import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDayNameFromDateString } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Valid doctorId and date (YYYY-MM-DD) are required.' },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    const dayName = getDayNameFromDateString(date);
    let availabilityMap: Record<string, string[]> = {};
    try {
      availabilityMap = JSON.parse(doctor.availability || '{}');
    } catch {
      availabilityMap = {};
    }

    const allSlots: string[] = availabilityMap[dayName] || [];

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: {
          not: 'Cancelled',
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlots = existingAppointments.map((a) => a.timeSlot);
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    return NextResponse.json({
      date,
      dayName,
      allSlots,
      bookedSlots,
      availableSlots,
    });
  } catch (err) {
    console.error('Error fetching slots:', err);
    return NextResponse.json(
      { error: 'Failed to load appointment slots.' },
      { status: 500 }
    );
  }
}
