import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  sanitizeText,
  isValidPakPhone,
  normalizePakPhone,
  parseJsonBodySafely,
  verifyCsrfOrigin,
} from '@/lib/security';

const leadSchema = z.object({
  name: z.string().max(120).optional(),
  phone: z.string().refine((v) => isValidPakPhone(v)),
  type: z.enum(['callback', 'lab_report']).optional(),
  details: z.string().max(400).optional(),
  locale: z.enum(['en', 'ur', 'sd']).optional(),
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
  const rate = checkRateLimit(`lead_${ip}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.', code: 'RATE_LIMITED' },
      { status: 429 }
    );
  }

  const bodyResult = await parseJsonBodySafely(req, 8 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  const parsed = leadSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid lead data.' }, { status: 400 });
  }

  try {
    const lead = await prisma.chatLead.create({
      data: {
        name: parsed.data.name ? sanitizeText(parsed.data.name, 120) : 'Visitor',
        phone: normalizePakPhone(sanitizeText(parsed.data.phone, 25)),
        type: parsed.data.type || 'callback',
        details: parsed.data.details ? sanitizeText(parsed.data.details, 400) : '',
        locale: parsed.data.locale || 'en',
      },
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not save lead.' }, { status: 500 });
  }
}
