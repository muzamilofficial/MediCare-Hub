import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import {
  parseJsonBodySafely,
  sanitizeText,
  verifyCsrfOrigin,
} from '@/lib/security';

export async function POST(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bodyResult = await parseJsonBodySafely(req, 32 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  try {
    const body = bodyResult.data;
    const name = sanitizeText(body.name, 120);
    const specialty = sanitizeText(body.specialty, 120);
    const qualification = sanitizeText(body.qualification, 160);
    const serviceSlug = sanitizeText(body.serviceSlug || 'general-physician', 80);
    const experienceYears = Math.max(0, Math.min(70, Number(body.experienceYears) || 5));
    const fee = Math.max(0, Math.min(50000, Number(body.fee) || 1500));
    const bio = sanitizeText(body.bio || '', 1000);
    const photo = sanitizeText(body.photo || '/images/doctor-1.svg', 200);

    if (!name || !specialty || !qualification) {
      return NextResponse.json(
        { error: 'Name, specialty, and qualification are required.' },
        { status: 400 }
      );
    }

    const languages =
      typeof body.languages === 'string'
        ? body.languages
        : JSON.stringify(body.languages || ['English', 'Urdu', 'Sindhi']);
    const availability =
      typeof body.availability === 'string'
        ? body.availability
        : JSON.stringify(body.availability || {});

    const slug =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (body.id) {
      const updated = await prisma.doctor.update({
        where: { id: String(body.id) },
        data: {
          name,
          specialty,
          qualification,
          serviceSlug,
          experienceYears,
          fee,
          bio,
          photo,
          languages,
          availability,
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        },
      });
      return NextResponse.json({ doctor: updated });
    } else {
      const created = await prisma.doctor.create({
        data: {
          slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
          name,
          nameUr: name,
          nameSd: name,
          specialty,
          specialtyUr: specialty,
          specialtySd: specialty,
          serviceSlug,
          qualification,
          experienceYears,
          bio,
          bioUr: bio,
          bioSd: bio,
          photo,
          fee,
          languages,
          availability,
          isActive: true,
        },
      });
      return NextResponse.json({ doctor: created }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Could not save doctor.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Doctor id required' }, { status: 400 });
    }

    // Check if doctor has existing appointments (Section G: block or soft-delete safely)
    const appointmentCount = await prisma.appointment.count({
      where: { doctorId: id },
    });

    if (appointmentCount > 0) {
      // Soft-delete so historical appointments remain intact
      const deactivated = await prisma.doctor.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        doctor: deactivated,
        message:
          'Doctor has existing appointments and was safely deactivated (soft-deleted) to preserve patient records.',
      });
    }

    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ success: true, softDeleted: false });
  } catch {
    return NextResponse.json({ error: 'Could not delete doctor.' }, { status: 500 });
  }
}
