import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { CHATBOT_COPY, matchUserIntent } from '../src/chatbot/flows';
import { clinicConfig } from '../src/config/clinic';
import { getKarachiDateString } from '../src/lib/utils';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export async function runChatbotTests() {
  console.log('\n🤖 [3/4] Running Chatbot Flows, Multilingual Emergency, Safety & Abuse Tests...');
  let passed = 0;

  // 1. Verify CHATBOT_COPY completeness in English, Urdu, and Sindhi
  for (const loc of ['en', 'ur', 'sd'] as const) {
    const copy = CHATBOT_COPY[loc];
    assert.ok(copy.greetingChooseLang.length > 5);
    assert.ok(copy.privacyNotice.length > 5);
    assert.ok(
      copy.emergencyAlert.includes(clinicConfig.emergencyPhone) &&
        copy.emergencyAlert.includes(clinicConfig.emergencyRescue),
      `Expected emergencyAlert in ${loc} to include clinic emergency phone and 1122`
    );
    assert.ok(copy.symptomSafeReply.length > 20);
    passed++;
  }

  // 2. Mandatory Emergency Keyword Detection (English, Roman Urdu, Urdu, Sindhi)
  const emergencyInputs = [
    'I have severe chest pain right now',
    'My father is having a heart attack',
    "Help I can't breathe properly",
    'There is heavy bleeding from a wound',
    'Patient is unconscious and fainted',
    'Road accident emergency',
    'Child is having a seizure / fits',
    'seene mein dard ho raha hai',
    'saans nahi aa raha',
    'mariiz behosh ho gaya hai',
    'میرے سینے میں درد ہے',
    'مریض کو سانس نہیں آ رہا',
    'بے ہوش ہو گیا ہے',
    'سيني ۾ سور آهي',
    'ساهه نه پيو اچي',
    'مريض بي هوش آهي',
  ];

  for (const input of emergencyInputs) {
    const intent = matchUserIntent(input);
    assert.equal(
      intent,
      'EMERGENCY',
      `Expected EMERGENCY intent for "${input}", got ${intent}`
    );
    passed++;
  }

  // 3. Medical Safety Guardrail Tests (never diagnose or give medicine doses)
  const medicalSafetyInputs = [
    'I have a fever and headache',
    'which medicine for fever?',
    'how much paracetamol should I take?',
    'can I give panadol syrup to my child?',
    'what is the dose of brufen?',
    'suggest an antibiotic for throat infection',
    'مجھے بخار اور سر درد ہے کون سی دوا لوں؟',
    'پیراسیٹامول کی خوراک کتنی ہے؟',
    'مونکي بخار آهي ڪهڙي دوا وٺان؟',
    'پيراسيٽامول گوري جو مقدار ٻڌايو',
  ];

  for (const input of medicalSafetyInputs) {
    const intent = matchUserIntent(input);
    assert.equal(
      intent,
      'SYMPTOM_SAFETY',
      `Expected SYMPTOM_SAFETY intent for "${input}", got ${intent}`
    );
    passed++;
  }

  // 4. Multilingual Intent Matching (Book, Doctors/Timings, Fees, Location, Lab, Reception)
  const intentMatrix: Array<{ input: string; expected: string }> = [
    { input: 'I want to book an appointment', expected: 'BOOK_APPOINTMENT' },
    { input: 'اپوائنٹمنٹ بک کرنی ہے', expected: 'BOOK_APPOINTMENT' },
    { input: 'اپائنٽمينٽ بُڪ ڪرڻي آهي', expected: 'BOOK_APPOINTMENT' },
    { input: 'What are the doctor timings on Sunday?', expected: 'DOCTORS_TIMINGS' },
    { input: 'ڈاکٹر کے اوقات کیا ہیں؟', expected: 'DOCTORS_TIMINGS' },
    { input: 'ڊاڪٽر جا وقت ڇا آهن؟', expected: 'DOCTORS_TIMINGS' },
    { input: 'What is the consultation fee and ultrasound price?', expected: 'SERVICES_FEES' },
    { input: 'چیک اپ کی فیس کتنی ہے؟', expected: 'SERVICES_FEES' },
    { input: 'چيڪ اپ جي فيس گهڻي آهي؟', expected: 'SERVICES_FEES' },
    { input: 'Where is your clinic address in Clifton?', expected: 'LOCATION_CONTACT' },
    { input: 'کلینک کا پتہ کہاں ہے؟', expected: 'LOCATION_CONTACT' },
    { input: 'ڪلينڪ جو پتو ڪٿي آهي؟', expected: 'LOCATION_CONTACT' },
    { input: 'When will my blood test lab report be ready?', expected: 'LAB_REPORTS' },
    { input: 'میری لیب رپورٹ کب ملے گی؟', expected: 'LAB_REPORTS' },
    { input: 'منهنجي ليب رپورٽ ڪڏهن ملندي؟', expected: 'LAB_REPORTS' },
    { input: 'I want to talk to reception on phone', expected: 'TALK_RECEPTION' },
    { input: 'استقبالیہ کا نمبر دیں', expected: 'TALK_RECEPTION' },
    { input: 'استقباليه سان رابطو ڪرڻو آهي', expected: 'TALK_RECEPTION' },
  ];

  for (const { input, expected } of intentMatrix) {
    const actual = matchUserIntent(input);
    assert.equal(
      actual,
      expected,
      `Expected ${expected} for "${input}", got ${actual}`
    );
    passed++;
  }

  // 5. Abuse Testing: 10,000-character message, emojis, HTML/XSS, SQL injection, and 50 rapid-fire messages
  {
    const start = Date.now();
    const tenKMessage = 'Hello! 🌟 '.repeat(1200) + '<script>alert("xss")</script>';
    const res10k = matchUserIntent(tenKMessage);
    assert.ok(res10k, 'Expected 10,000-character input to be handled safely');

    for (let i = 0; i < 50; i++) {
      const rapidRes = matchUserIntent(
        `Rapid test message #${i} ' OR 1=1 -- <img src=x onerror=alert(1)>`
      );
      assert.equal(rapidRes, 'LAB_REPORTS'); // contains 'test'
    }
    const elapsed = Date.now() - start;
    assert.ok(
      elapsed < 200,
      `Expected 50 rapid-fire + 10k char checks to finish in <200ms, took ${elapsed}ms`
    );
    passed++;
  }

  // 6. End-to-End Chatbot Lead Submission (Lab Report & Callback) + Chatbot Booking
  {
    const labRes = await fetch(`${BASE_URL}/api/chat-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.77.1.1',
      },
      body: JSON.stringify({
        name: 'Tariq Jamil',
        phone: '0301-2345678',
        type: 'lab_report',
        details: 'Test: Lipid Profile & HbA1c',
        locale: 'ur',
      }),
    });
    assert.equal(labRes.status, 201, 'Expected POST /api/chat-leads (lab_report) to return 201');

    const cbRes = await fetch(`${BASE_URL}/api/chat-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.77.1.2',
      },
      body: JSON.stringify({
        name: 'Nadia Hussain',
        phone: '+92 333 1122334',
        type: 'callback',
        details: 'Requested reception callback via Chatbot',
        locale: 'sd',
      }),
    });
    assert.equal(cbRes.status, 201, 'Expected POST /api/chat-leads (callback) to return 201');

    // Clean up test chat leads
    await prisma.chatLead.deleteMany({
      where: {
        phone: { in: ['0301-2345678', '0333-1122334'] },
      },
    });

    // Chatbot booking creation
    const doc = await prisma.doctor.findFirst({ where: { isActive: true } });
    const srv = await prisma.service.findFirst();
    let botDate = getKarachiDateString(6);
    const [y, m, d] = botDate.split('-').map(Number);
    if (new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0) {
      botDate = getKarachiDateString(7);
    }

    if (doc && srv) {
      const botBookRes = await fetch(`${BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.77.1.3',
        },
        body: JSON.stringify({
          serviceId: srv.id,
          doctorId: doc.id,
          date: botDate,
          timeSlot: '11:00 AM',
          patientName: 'Zainab Bibi',
          phone: '0345-6789012',
          source: 'chatbot',
          consent: true,
        }),
      });
      assert.equal(botBookRes.status, 201, 'Expected chatbot booking to return 201');
      const botBookData = await botBookRes.json();
      await prisma.appointment.delete({
        where: { id: botBookData.appointment.id },
      });
    }
    passed += 3;
  }

  console.log(`   ✅ Passed ${passed} chatbot flows, emergency, medical safety, and abuse checks.`);
}
