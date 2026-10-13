import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { getKarachiDateString } from '../src/lib/utils';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export async function runBookingTests() {
  console.log('\n📅 [2/4] Running Booking Validation, Double-Book & 20x Concurrency Tests...');
  let passed = 0;

  const doctor = await prisma.doctor.findFirst({
    where: { slug: 'dr-tariq-mahmood-siddiqui', isActive: true },
  });
  const service = await prisma.service.findFirst({
    where: { slug: 'general-physician' },
  });
  assert.ok(doctor, 'Expected seeded doctor dr-tariq-mahmood-siddiqui');
  assert.ok(service, 'Expected seeded service general-physician');

  // Pick a future weekday date (Monday-Saturday)
  let testDate = getKarachiDateString(4);
  const [y, m, d] = testDate.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (dayOfWeek === 0) {
    // If Sunday, advance 1 day to Monday so full weekday slots exist
    testDate = getKarachiDateString(5);
  }

  // Clean up any previous test appointments on testDate
  await prisma.appointment.deleteMany({
    where: { date: testDate },
  });

  // 1. Input Validation Edge Cases (Section E)
  const invalidPayloads: Array<{ label: string; body: Record<string, any> }> = [
    {
      label: 'Empty body',
      body: {},
    },
    {
      label: 'Name with digits (Ali 123)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Ali 123',
        phone: '0300-1234567',
        consent: true,
      },
    },
    {
      label: 'Name with symbols (Ali @#$%)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Ali @#$%',
        phone: '0300-1234567',
        consent: true,
      },
    },
    {
      label: 'Name with 200 characters',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'A'.repeat(200),
        phone: '0300-1234567',
        consent: true,
      },
    },
    {
      label: 'Invalid phone (landline / short)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0213500000',
        consent: true,
      },
    },
    {
      label: 'Invalid email (notanemail)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        email: 'notanemail',
        consent: true,
      },
    },
    {
      label: 'Invalid age 0',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        age: 0,
        consent: true,
      },
    },
    {
      label: 'Invalid age -5',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        age: -5,
        consent: true,
      },
    },
    {
      label: 'Invalid age 200',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        age: 200,
        consent: true,
      },
    },
    {
      label: 'Past date (2020-01-01)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: '2020-01-01',
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        consent: true,
      },
    },
    {
      label: 'Slot not in doctor schedule (03:17 AM)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '03:17 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        consent: true,
      },
    },
    {
      label: 'Consent false',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        consent: false,
      },
    },
    {
      label: 'Reason > 300 characters (rejected with 400)',
      body: {
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'Kamran Ahmed',
        phone: '0300-1234567',
        reason: 'Severe seasonal flu and throat irritation. '.repeat(10),
        consent: true,
      },
    },
  ];

  for (let i = 0; i < invalidPayloads.length; i++) {
    const item = invalidPayloads[i];
    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `10.10.1.${i + 1}`,
      },
      body: JSON.stringify(item.body),
    });
    assert.equal(
      res.status,
      400,
      `Expected 400 for invalid case "${item.label}", got ${res.status}`
    );
    passed++;
  }

  // 2. Valid booking with Urdu script name & +92 phone normalization
  {
    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.20.1.1',
      },
      body: JSON.stringify({
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '09:00 AM',
        patientName: 'محمد بلال خان',
        phone: '+92 321 7654321',
        age: 34,
        gender: 'Male',
        reason: 'Seasonal fever and mild cough for 2 days.',
        consent: true,
      }),
    });
    assert.equal(res.status, 201, 'Expected valid Urdu name booking to return 201');
    const data = await res.json();
    assert.ok(
      /^APT-\d{8}-\d{4}$/.test(data.appointment.reference),
      `Expected APT-YYYYMMDD-XXXX reference, got ${data.appointment.reference}`
    );
    assert.equal(
      data.appointment.phone,
      '0321-7654321',
      'Expected +92 phone to normalize to 0321-7654321'
    );

    const dbRecord = await prisma.appointment.findUnique({
      where: { reference: data.appointment.reference },
    });
    assert.ok(dbRecord, 'Expected appointment saved in SQLite database');
    passed++;
  }

  // 3. Verify slot 09:00 AM now appears in bookedSlots
  {
    const slotsRes = await fetch(
      `${BASE_URL}/api/appointments/slots?doctorId=${encodeURIComponent(
        doctor.id
      )}&date=${encodeURIComponent(testDate)}`
    );
    assert.equal(slotsRes.status, 200);
    const slotsData = await slotsRes.json();
    assert.ok(
      slotsData.bookedSlots.includes('09:00 AM'),
      'Expected 09:00 AM to be in bookedSlots'
    );
    assert.ok(
      !slotsData.availableSlots.includes('09:00 AM'),
      'Expected 09:00 AM to be removed from availableSlots'
    );
    passed++;
  }

  // 4. Concurrency / Race Condition Test: 20 simultaneous requests for the exact same slot (Section F)
  {
    const raceSlot = '10:30 AM';
    const requests = Array.from({ length: 20 }, (_, idx) =>
      fetch(`${BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `10.99.0.${idx + 1}`,
        },
        body: JSON.stringify({
          serviceId: service.id,
          doctorId: doctor.id,
          date: testDate,
          timeSlot: raceSlot,
          patientName: `Concurrent Patient ${String.fromCharCode(65 + idx)}`,
          phone: `0300-${String(1000000 + idx).slice(0, 7)}`,
          age: 28,
          gender: 'Female',
          consent: true,
        }),
      })
    );

    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status);
    const successCount = statuses.filter((s) => s === 201).length;
    const conflictCount = statuses.filter((s) => s === 409).length;

    assert.equal(
      successCount,
      1,
      `Concurrency test failed: expected exactly 1 success (201), got ${successCount} (statuses: ${statuses.join(',')})`
    );
    assert.equal(
      conflictCount,
      19,
      `Concurrency test failed: expected 19 conflicts (409), got ${conflictCount}`
    );
    passed++;
  }

  // 5. Slot release on Cancellation: cancelling the 10:30 AM booking frees the slot for re-booking
  {
    const bookedAppt = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '10:30 AM',
        status: { not: 'Cancelled' },
      },
    });
    assert.ok(bookedAppt, 'Expected active 10:30 AM appointment');

    await prisma.appointment.update({
      where: { id: bookedAppt.id },
      data: { status: 'Cancelled' },
    });

    // Re-book the now-cancelled 10:30 AM slot
    const rebookRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.200.1.1',
      },
      body: JSON.stringify({
        serviceId: service.id,
        doctorId: doctor.id,
        date: testDate,
        timeSlot: '10:30 AM',
        patientName: 'Sana Javed',
        phone: '0333-9876543',
        age: 29,
        gender: 'Female',
        consent: true,
      }),
    });
    assert.equal(
      rebookRes.status,
      201,
      'Expected cancelled slot to be freed and re-bookable (201)'
    );
    passed++;
  }

  // Clean up test appointments created on testDate
  await prisma.appointment.deleteMany({
    where: { date: testDate },
  });

  console.log(`   ✅ Passed ${passed} booking validation, concurrency (20x), and slot lifecycle checks.`);
}
