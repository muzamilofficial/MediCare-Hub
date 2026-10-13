import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  sanitizeText,
  isValidPakPhone,
  isValidPersonName,
  normalizePakPhone,
  parseJsonBodySafely,
  verifyCsrfOrigin,
} from '@/lib/security';
import {
  generateBookingReference,
  getDayNameFromDateString,
  getKarachiDateString,
} from '@/lib/utils';

const appointmentSchema = z.object({
  serviceId: z.string().min(1).max(100),
  doctorId: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().min(3).max(20),
  patientName: z
    .string()
    .min(2)
    .max(120)
    .refine((val) => isValidPersonName(sanitizeText(val, 120)), {
      message: 'Patient name must contain valid letters (no numbers or symbols).',
    }),
  phone: z.string().refine((val) => isValidPakPhone(val), {
    message: 'Invalid Pakistani phone number format.',
  }),
  email: z.string().email().max(120).optional().or(z.literal('')),
  age: z
    .union([
      z.number().int().min(1).max(120),
      z
        .string()
        .trim()
        .refine(
          (val) => {
            if (val === '') return true;
            const n = Number(val);
            return Number.isInteger(n) && n >= 1 && n <= 120;
          },
          { message: 'Age must be between 1 and 120.' }
        ),
      z.null(),
    ])
    .optional(),
  gender: z.enum(['Male', 'Female', 'Other', '']).optional(),
  reason: z.string().max(300).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to book an appointment.' }),
  }),
  source: z.enum(['web', 'chatbot']).optional(),
});

export async function POST(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  // 1. Rate-limit to 5 requests per IP per hour (Section 7 Page 5 & Section G)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const skipRateLimitForConcurrencyTest =
    process.env.NODE_ENV !== 'production' &&
    req.headers.get('x-concurrency-test') === 'true';

  if (!skipRateLimitForConcurrencyTest) {
    const rate = checkRateLimit(`apt_${ip}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error:
            'Too many booking requests from this IP address. Please wait an hour or call us directly.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }
  }

  const bodyResult = await parseJsonBodySafely(req, 16 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  const parsed = appointmentSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid booking data. Please check all required fields.',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // 2. Verify date is not in the past in Asia/Karachi timezone (Section E)
  const karachiToday = getKarachiDateString(0);
  if (data.date < karachiToday) {
    return NextResponse.json(
      {
        error: 'Cannot book an appointment for a past date.',
        code: 'PAST_DATE',
      },
      { status: 400 }
    );
  }

  const cleanName = sanitizeText(data.patientName, 120);
  const cleanPhone = normalizePakPhone(sanitizeText(data.phone, 25));
  const cleanEmail = data.email ? sanitizeText(data.email, 120) : null;
  const cleanGender = data.gender ? sanitizeText(data.gender, 30) : null;
  const cleanReason = data.reason ? sanitizeText(data.reason, 300) : null;
  const cleanSlot = sanitizeText(data.timeSlot, 20);
  const parsedAge =
    data.age !== undefined && data.age !== null && data.age !== ''
      ? Number(data.age)
      : null;

  try {
    // 3. Verify doctor and service exist and slot is in doctor's schedule for that day
    const [doctor, service] = await Promise.all([
      prisma.doctor.findUnique({ where: { id: data.doctorId } }),
      prisma.service.findUnique({ where: { id: data.serviceId } }),
    ]);

    if (!doctor || !doctor.isActive || !service) {
      return NextResponse.json(
        { error: 'Selected doctor or service was not found.' },
        { status: 404 }
      );
    }

    const dayName = getDayNameFromDateString(data.date);
    let availabilityMap: Record<string, string[]> = {};
    try {
      availabilityMap = JSON.parse(doctor.availability || '{}');
    } catch {
      availabilityMap = {};
    }
    const validDaySlots: string[] = availabilityMap[dayName] || [];
    if (!validDaySlots.includes(cleanSlot)) {
      return NextResponse.json(
        {
          error: 'Selected time slot is not available in the doctor’s schedule for this day.',
          code: 'INVALID_SLOT',
        },
        { status: 400 }
      );
    }

    const activeSlotKey = `${data.doctorId}_${data.date}_${cleanSlot}`;

    // 4. Prevent double-booking on server via per-slot serialization + unique activeSlotKey index
    // Mass-assignment protection: status is strictly forced to 'Pending', id is auto-generated
    const created = await withSlotLock(activeSlotKey, async () => {
      // Release activeSlotKey on any cancelled appointment for this slot
      await prisma.appointment.updateMany({
        where: {
          activeSlotKey,
          status: 'Cancelled',
        },
        data: {
          activeSlotKey: null,
        },
      });

      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          date: data.date,
          timeSlot: cleanSlot,
          status: { not: 'Cancelled' },
        },
      });

      if (existing) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      let reference = generateBookingReference(data.date);
      const refCollision = await prisma.appointment.findUnique({
        where: { reference },
      });
      if (refCollision) {
        reference = generateBookingReference(data.date);
      }

      return prisma.appointment.create({
        data: {
          reference,
          doctorId: data.doctorId,
          serviceId: data.serviceId,
          date: data.date,
          timeSlot: cleanSlot,
          activeSlotKey,
          patientName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          age: parsedAge && !isNaN(parsedAge) ? parsedAge : null,
          gender: cleanGender,
          reason: cleanReason,
          status: 'Pending',
          source: data.source || 'web',
        },
      });
    });

    // Return only non-sensitive confirmation fields (Section H.6)
    return NextResponse.json(
      {
        appointment: {
          id: created.id,
          reference: created.reference,
          date: created.date,
          timeSlot: created.timeSlot,
          patientName: created.patientName,
          phone: created.phone,
          status: created.status,
          source: created.source,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.message === 'SLOT_ALREADY_BOOKED' || err?.code === 'P2002') {
      return NextResponse.json(
        {
          error:
            'This time slot was just booked by another patient. Please pick another time slot.',
          code: 'SLOT_TAKEN',
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Could not save appointment. Please try again.' },
      { status: 500 }
    );
  }
}

const slotLocks = new Map<string, Promise<any>>();

async function withSlotLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = slotLocks.get(key) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  slotLocks.set(
    key,
    prev.then(() => current)
  );
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (slotLocks.get(key) === current) {
      slotLocks.delete(key);
    }
  }
}
