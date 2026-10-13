import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { ADMIN_COOKIE_NAME } from '../src/lib/adminAuth';
import { getKarachiDateString } from '../src/lib/utils';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function readEnvCredentials(): { user: string; pass: string } {
  const envPath = path.join(process.cwd(), '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const userMatch = content.match(/ADMIN_USER(?:NAME)?="([^"]+)"/);
  const passMatch = content.match(/ADMIN_PASSWORD="([^"]+)"/);
  return {
    user: userMatch ? userMatch[1] : 'admin',
    pass: passMatch ? passMatch[1] : 'MediCare@2026',
  };
}

export async function runSecurityTests() {
  console.log('\n🔒 [4/4] Running 14-Point Security Audit & Admin Panel CRUD Tests...');
  let passed = 0;

  // 1. Unauthenticated requests to Admin APIs must return 401
  {
    const r1 = await fetch(`${BASE_URL}/api/admin/data`);
    assert.equal(r1.status, 401, 'Unauthenticated GET /api/admin/data must return 401');

    const r2 = await fetch(`${BASE_URL}/api/admin/data`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'appointment_status', id: '123', status: 'Confirmed' }),
    });
    assert.equal(r2.status, 401, 'Unauthenticated PATCH /api/admin/data must return 401');

    const r3 = await fetch(`${BASE_URL}/api/admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized Doc', specialty: 'GP' }),
    });
    assert.equal(r3.status, 401, 'Unauthenticated POST /api/admin/doctors must return 401');

    const r4 = await fetch(`${BASE_URL}/api/admin/doctors?id=123`, {
      method: 'DELETE',
    });
    assert.equal(r4.status, 401, 'Unauthenticated DELETE /api/admin/doctors must return 401');
    passed += 4;
  }

  // 2. Tampered / forged session cookie must return 401
  {
    const forgedRes = await fetch(`${BASE_URL}/api/admin/data`, {
      headers: {
        Cookie: `${ADMIN_COOKIE_NAME}=admin.${Date.now()}.deadbeef.forgedsignature`,
      },
    });
    assert.equal(forgedRes.status, 401, 'Tampered admin token must return 401');
    passed++;
  }

  // 3. Brute-force protection on /api/admin/auth (5 wrong attempts -> 6th returns 429)
  {
    const bruteIp = `10.88.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const wrongRes = await fetch(`${BASE_URL}/api/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': bruteIp,
        },
        body: JSON.stringify({ username: 'admin', password: `wrong-pass-${attempt}` }),
      });
      assert.equal(
        wrongRes.status,
        401,
        `Attempt ${attempt} with wrong password should return 401`
      );
    }

    const lockedRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': bruteIp,
      },
      body: JSON.stringify({ username: 'admin', password: 'wrong-pass-6' }),
    });
    assert.equal(
      lockedRes.status,
      429,
      '6th wrong login attempt must return 429 Too Many Requests lockout'
    );
    passed++;
  }

  // 4. Valid Admin Login, Cookie Attributes, Admin CRUD, Soft-Delete, and Token Revocation on Logout
  {
    const creds = readEnvCredentials();
    const validAdminIp = `10.55.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
    const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': validAdminIp,
      },
      body: JSON.stringify({ username: creds.user, password: creds.pass }),
    });
    assert.equal(loginRes.status, 200, 'Valid admin login must return 200');

    const setCookieHeader = loginRes.headers.get('set-cookie') || '';
    assert.ok(
      setCookieHeader.toLowerCase().includes('httponly'),
      'Admin cookie must be HttpOnly'
    );
    assert.ok(
      setCookieHeader.toLowerCase().includes('samesite=strict'),
      'Admin cookie must be SameSite=Strict'
    );

    const tokenMatch = setCookieHeader.match(
      new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`)
    );
    assert.ok(tokenMatch, `Expected ${ADMIN_COOKIE_NAME} in Set-Cookie header`);
    const cookieHeader = `${ADMIN_COOKIE_NAME}=${tokenMatch[1]}`;

    // Authenticated GET /api/admin/data
    const dataRes = await fetch(`${BASE_URL}/api/admin/data`, {
      headers: { Cookie: cookieHeader },
    });
    assert.equal(dataRes.status, 200, 'Authenticated GET /api/admin/data must return 200');
    const adminData = await dataRes.json();
    assert.ok(Array.isArray(adminData.appointments));
    assert.ok(Array.isArray(adminData.doctors));

    // Create a new Doctor via Admin API
    const createDocRes = await fetch(`${BASE_URL}/api/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: 'Dr. Kamran Siddiqui',
        specialty: 'General Physician',
        qualification: 'MBBS, FCPS',
        serviceSlug: 'general-physician',
        experienceYears: 9,
        fee: 1900,
        bio: 'Experienced family physician.',
      }),
    });
    assert.equal(createDocRes.status, 201, 'Admin create doctor must return 201');
    const createdDoc = (await createDocRes.json()).doctor;

    // Edit Doctor fee via Admin API
    const editDocRes = await fetch(`${BASE_URL}/api/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        id: createdDoc.id,
        name: 'Dr. Kamran Siddiqui',
        specialty: 'General Physician',
        qualification: 'MBBS, FCPS',
        serviceSlug: 'general-physician',
        experienceYears: 9,
        fee: 2100,
        bio: 'Experienced family physician.',
      }),
    });
    assert.equal(editDocRes.status, 200, 'Admin edit doctor must return 200');
    const updatedDoc = (await editDocRes.json()).doctor;
    assert.equal(updatedDoc.fee, 2100, 'Expected updated doctor fee to be 2100');

    // Delete the newly created doctor (0 appointments -> hard delete)
    const delDocRes = await fetch(
      `${BASE_URL}/api/admin/doctors?id=${encodeURIComponent(createdDoc.id)}`,
      {
        method: 'DELETE',
        headers: { Cookie: cookieHeader },
      }
    );
    assert.equal(delDocRes.status, 200, 'Admin delete doctor must return 200');

    // Test Soft-Delete on a seeded doctor who has appointments
    const seededDocWithAppt = await prisma.doctor.findFirst({
      where: { slug: 'dr-tariq-mahmood-siddiqui' },
    });
    if (seededDocWithAppt) {
      const softDelRes = await fetch(
        `${BASE_URL}/api/admin/doctors?id=${encodeURIComponent(seededDocWithAppt.id)}`,
        {
          method: 'DELETE',
          headers: { Cookie: cookieHeader },
        }
      );
      assert.equal(
        softDelRes.status,
        200,
        'Deleting doctor with appointments must soft-delete (200) instead of throwing 500'
      );
      // Restore isActive = true on seeded doctor
      await prisma.doctor.update({
        where: { id: seededDocWithAppt.id },
        data: { isActive: true },
      });
    }

    // Logout & verify token revocation (replaying the old cookie must return 401)
    const logoutRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader },
    });
    assert.equal(logoutRes.status, 200, 'Admin logout must return 200');

    const replayRes = await fetch(`${BASE_URL}/api/admin/data`, {
      headers: { Cookie: cookieHeader },
    });
    assert.equal(
      replayRes.status,
      401,
      'Replaying revoked admin session token after logout must return 401'
    );
    passed += 6;
  }

  // 5. CSRF Forged Origin Check
  {
    const csrfRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil-attacker.example.com',
        Host: 'localhost:3000',
      },
      body: JSON.stringify({
        name: 'Attacker',
        phone: '0300-1234567',
        subject: 'General',
        message: 'Forged cross-site request',
      }),
    });
    assert.equal(csrfRes.status, 403, 'Cross-origin POST with forged Origin must return 403');
    passed++;
  }

  // 6. Stored XSS Sanitization Check
  {
    const xssRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.66.1.1',
      },
      body: JSON.stringify({
        name: 'XSS Tester',
        phone: '0300-9988776',
        email: 'xss@example.com',
        subject: 'General Inquiry',
        message:
          'Hello <script>alert(1)</script> <img onerror=alert(1) src=x> javascript:alert(1)',
      }),
    });
    assert.equal(xssRes.status, 201, 'Contact submission with sanitized text should return 201');
    const savedMsg = await prisma.contactMessage.findFirst({
      where: { phone: '0300-9988776' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(savedMsg, 'Expected saved contact message');
    assert.ok(
      !savedMsg.message.includes('<script') &&
        !savedMsg.message.includes('onerror=') &&
        !savedMsg.message.includes('javascript:'),
      `Stored message should not contain raw XSS payload: ${savedMsg.message}`
    );
    await prisma.contactMessage.delete({ where: { id: savedMsg.id } });
    passed++;
  }

  // 7. SQL Injection Prevention Check
  {
    const sqliPayloads = [
      "' OR 1=1 --",
      '"; DROP TABLE Appointment; --',
      'UNION SELECT * FROM Doctor',
    ];
    for (const sqli of sqliPayloads) {
      const slotRes = await fetch(
        `${BASE_URL}/api/appointments/slots?doctorId=${encodeURIComponent(
          sqli
        )}&date=2026-10-20`
      );
      assert.ok(
        [200, 400, 404].includes(slotRes.status),
        `SQLi payload on slots endpoint returned unexpected status ${slotRes.status}`
      );
    }
    const doctorCount = await prisma.doctor.count();
    assert.ok(doctorCount >= 6, 'Doctor table must remain intact after SQLi attempts');
    passed++;
  }

  // 8. IDOR & PII Leak Check on Public Slots Endpoint
  {
    const doc = await prisma.doctor.findFirst({ where: { isActive: true } });
    assert.ok(doc);
    const slotsRes = await fetch(
      `${BASE_URL}/api/appointments/slots?doctorId=${encodeURIComponent(
        doc.id
      )}&date=${encodeURIComponent(getKarachiDateString(0))}`
    );
    assert.equal(slotsRes.status, 200);
    const rawJson = await slotsRes.text();
    assert.ok(
      !rawJson.includes('patientName') &&
        !rawJson.includes('phone') &&
        !rawJson.includes('email') &&
        !rawJson.includes('reference'),
      'Public /api/appointments/slots must never leak patient PII'
    );
    passed++;
  }

  // 9. Mass Assignment Protection Check on POST /api/appointments
  {
    const doc = await prisma.doctor.findFirst({ where: { isActive: true } });
    const srv = await prisma.service.findFirst();
    assert.ok(doc && srv);
    let maDate = getKarachiDateString(8);
    const [y, m, d] = maDate.split('-').map(Number);
    if (new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0) {
      maDate = getKarachiDateString(9);
    }

    const maRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.66.2.2',
      },
      body: JSON.stringify({
        id: 'hacked-custom-id-999',
        reference: 'MCH-HACKED-0000',
        status: 'Confirmed',
        serviceId: srv.id,
        doctorId: doc.id,
        date: maDate,
        timeSlot: '05:00 PM',
        patientName: 'Imran Qureshi',
        phone: '0312-3456789',
        consent: true,
      }),
    });
    assert.equal(maRes.status, 201);
    const maData = await maRes.json();
    assert.notEqual(
      maData.appointment.id,
      'hacked-custom-id-999',
      'Mass-assigned id must be ignored'
    );
    assert.notEqual(
      maData.appointment.reference,
      'MCH-HACKED-0000',
      'Mass-assigned reference must be ignored'
    );
    assert.equal(
      maData.appointment.status,
      'Pending',
      'Mass-assigned status="Confirmed" must be ignored; new bookings must be Pending'
    );
    await prisma.appointment.delete({ where: { id: maData.appointment.id } });
    passed++;
  }

  // 10. Oversized Payload (413) & Malformed JSON (400) Check
  {
    const hugeBody = JSON.stringify({
      name: 'Huge Payload',
      phone: '0300-1234567',
      subject: 'General',
      message: 'X'.repeat(40000),
    });
    const hugeRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.66.3.3',
      },
      body: hugeBody,
    });
    assert.equal(
      hugeRes.status,
      413,
      `Expected 413 Payload Too Large for 40KB body, got ${hugeRes.status}`
    );

    const badJsonRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.66.3.4',
      },
      body: '{malformed json',
    });
    assert.equal(
      badJsonRes.status,
      400,
      `Expected 400 Bad Request for malformed JSON, got ${badJsonRes.status}`
    );
    passed += 2;
  }

  console.log(`   ✅ Passed ${passed} security audit and Admin CRUD checks.`);
}
