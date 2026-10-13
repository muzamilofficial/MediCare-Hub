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

const contactSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(120)
    .refine((v) => isValidPersonName(sanitizeText(v, 120)), {
      message: 'Please enter a valid name without numbers or symbols.',
    }),
  phone: z.string().refine((v) => isValidPakPhone(v), {
    message: 'Invalid Pakistani phone number.',
  }),
  email: z.string().email().max(120).optional().or(z.literal('')),
  subject: z.string().min(2).max(120),
  message: z.string().min(5).max(1500),
});

export async function POST(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const rate = checkRateLimit(`contact_${ip}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'Too many messages sent. Please wait before trying again.',
        code: 'RATE_LIMITED',
      },
      { status: 429 }
    );
  }

  const bodyResult = await parseJsonBodySafely(req, 16 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  const parsed = contactSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid form fields.',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const msg = await prisma.contactMessage.create({
      data: {
        name: sanitizeText(parsed.data.name, 120),
        phone: normalizePakPhone(sanitizeText(parsed.data.phone, 25)),
        email: parsed.data.email ? sanitizeText(parsed.data.email, 120) : null,
        subject: sanitizeText(parsed.data.subject, 120),
        message: sanitizeText(parsed.data.message, 1500),
      },
    });

    return NextResponse.json({ success: true, id: msg.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit message.' },
      { status: 500 }
    );
  }
}
