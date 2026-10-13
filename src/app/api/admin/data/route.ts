import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { parseJsonBodySafely, verifyCsrfOrigin } from '@/lib/security';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-show',
];

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [appointments, doctors, services, messages, leads] = await Promise.all([
    prisma.appointment.findMany({
      include: { doctor: true, service: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.doctor.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.service.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.chatLead.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return NextResponse.json({
    appointments,
    doctors,
    services,
    messages,
    leads,
  });
}

export async function PATCH(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bodyResult = await parseJsonBodySafely(req, 16 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  try {
    const body = bodyResult.data;

    if (body.type === 'appointment_status') {
      const { id, status } = body;
      if (typeof id !== 'string' || !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid appointment id or status.' },
          { status: 400 }
        );
      }

      const existing = await prisma.appointment.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const activeSlotKey =
        status === 'Cancelled'
          ? null
          : `${existing.doctorId}_${existing.date}_${existing.timeSlot}`;

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status, activeSlotKey },
        include: { doctor: true, service: true },
      });
      return NextResponse.json({ appointment: updated });
    }

    if (body.type === 'message_read') {
      const updated = await prisma.contactMessage.update({
        where: { id: String(body.id) },
        data: { isRead: Boolean(body.isRead) },
      });
      return NextResponse.json({ message: updated });
    }

    if (body.type === 'lead_status') {
      const updated = await prisma.chatLead.update({
        where: { id: String(body.id) },
        data: { status: String(body.status) },
      });
      return NextResponse.json({ lead: updated });
    }

    return NextResponse.json({ error: 'Unknown update type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
