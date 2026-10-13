/**
 * DATA-DRIVEN CHATBOT FLOWS & KEYWORD ENGINE
 * ============================================
 * Edit all bot messages, quick-reply labels, emergency keywords, symptom safety
 * triggers, and intent matchers in this single file without touching the UI component.
 */

import { clinicConfig } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';

export type BotIntent =
  | 'EMERGENCY'
  | 'SYMPTOM_SAFETY'
  | 'BOOK_APPOINTMENT'
  | 'DOCTORS_TIMINGS'
  | 'SERVICES_FEES'
  | 'LOCATION_CONTACT'
  | 'LAB_REPORTS'
  | 'TALK_RECEPTION'
  | 'GREETING'
  | 'UNKNOWN';

export interface QuickReplyOption {
  id: string;
  label: string;
  action: string;
  payload?: string;
}

export interface ChatbotFlowCopy {
  greetingChooseLang: string;
  welcomeMenu: string;
  privacyNotice: string;
  onlineStatus: string;
  inputPlaceholder: string;
  backButton: string;
  cancelButton: string;
  mainMenuButton: string;
  callNowButton: string;
  whatsappButton: string;
  mapDirectionsButton: string;
  menu: {
    book: string;
    doctors: string;
    services: string;
    location: string;
    lab: string;
    reception: string;
  };
  emergencyAlert: string;
  symptomSafeReply: string;
  booking: {
    askService: string;
    askDoctor: string;
    anyDoctor: string;
    askDate: string;
    today: string;
    tomorrow: string;
    pickDatePrompt: string;
    askSlot: string;
    noSlots: string;
    askName: string;
    askPhone: string;
    invalidPhone: string;
    confirmPrompt: (summary: {
      service: string;
      doctor: string;
      date: string;
      slot: string;
      name: string;
      phone: string;
      fee: number;
    }) => string;
    confirmYes: string;
    bookingSuccess: (ref: string) => string;
    bookingError: string;
    cancelled: string;
  };
  doctorsFlow: {
    selectDoctorPrompt: string;
    doctorDetails: (doc: {
      name: string;
      specialty: string;
      qualification: string;
      fee: number;
      timings: string;
    }) => string;
    bookWithThisDoctor: string;
  };
  servicesFlow: {
    selectServicePrompt: string;
    serviceDetails: (srv: { title: string; description: string; feeFrom: number }) => string;
    bookThisService: string;
  };
  locationFlow: {
    details: string;
  };
  labFlow: {
    intro: string;
    askName: string;
    askPhone: string;
    askTestName: string;
    savedSuccess: string;
  };
  receptionFlow: {
    intro: string;
    leaveNumberBtn: string;
    askName: string;
    askPhone: string;
    savedCallback: string;
  };
  fallback: {
    firstTry: string;
    secondTry: string;
  };
}

export const CHATBOT_COPY: Record<Locale, ChatbotFlowCopy> = {
  en: {
    greetingChooseLang: `Hello! I'm the ${clinicConfig.name} assistant. Please choose your language:`,
    welcomeMenu: 'How can I help you today?',
    privacyNotice: "Please don't share sensitive medical details in chat.",
    onlineStatus: 'Online',
    inputPlaceholder: 'Type your message...',
    backButton: '⬅ Back',
    cancelButton: '✖ Cancel',
    mainMenuButton: '🏠 Main Menu',
    callNowButton: `📞 Call ${clinicConfig.phone}`,
    whatsappButton: '💬 WhatsApp Us',
    mapDirectionsButton: '📍 Open Google Maps',
    menu: {
      book: 'Book Appointment',
      doctors: 'Doctors & Timings',
      services: 'Services & Fees',
      location: 'Location & Contact',
      lab: 'Lab Reports',
      reception: 'Talk to Reception',
    },
    emergencyAlert: `🚨 This sounds like an emergency. Please call ${clinicConfig.emergencyPhone} (or Rescue ${clinicConfig.emergencyRescue}) or go to the nearest hospital now.`,
    symptomSafeReply:
      'I am sorry you are not feeling well. For your safety, I cannot give medical diagnoses, treatment advice, or medicine doses. I strongly advise seeing a doctor for a proper checkup. Would you like to book an appointment?',
    booking: {
      askService: 'Step 1/6: Which medical service do you need?',
      askDoctor: 'Step 2/6: Please choose a doctor:',
      anyDoctor: 'Any Available Doctor',
      askDate: 'Step 3/6: Which date would you prefer?',
      today: 'Today',
      tomorrow: 'Tomorrow',
      pickDatePrompt: 'Please type your preferred date in YYYY-MM-DD format (e.g. 2026-10-16):',
      askSlot: 'Step 4/6: Please pick an available 30-minute time slot:',
      noSlots: 'No slots are available on that date. Please pick another date:',
      askName: 'Step 5/6: Please type the patient’s full name:',
      askPhone:
        'Step 6/6: Please enter your Pakistani mobile number (e.g. 0300-1234567 or +92 300 1234567):',
      invalidPhone:
        'That phone number format looks incomplete. Please enter a valid Pakistani mobile number like 0300-1234567:',
      confirmPrompt: (s) =>
        `Please confirm your appointment details:\n• Service: ${s.service}\n• Doctor: ${s.doctor}\n• Date: ${s.date}\n• Time: ${s.slot}\n• Patient: ${s.name}\n• Phone: ${s.phone}\n• Fee: PKR ${s.fee}`,
      confirmYes: '✅ Confirm Booking',
      bookingSuccess: (ref) =>
        `🎉 Your appointment is booked!\nReference Number: ${ref}\nPlease arrive 10 minutes early. You can also send your confirmation on WhatsApp below.`,
      bookingError:
        'Sorry, we could not complete that booking (the slot may have just been taken). Please try again or message us on WhatsApp.',
      cancelled: 'Booking cancelled. How else can I help you today?',
    },
    doctorsFlow: {
      selectDoctorPrompt: 'Select a doctor below to see their specialty, timings, and fee:',
      doctorDetails: (d) =>
        `👨‍⚕️ ${d.name}\n• Specialty: ${d.specialty}\n• Qualification: ${d.qualification}\n• Timings: ${d.timings}\n• Consultation Fee: PKR ${d.fee}`,
      bookWithThisDoctor: '📅 Book with this doctor',
    },
    servicesFlow: {
      selectServicePrompt: 'Select a service to view details and fee range:',
      serviceDetails: (s) =>
        `🏥 ${s.title}\n${s.description}\n• Fee Range: From PKR ${s.feeFrom}`,
      bookThisService: '📅 Book this service',
    },
    locationFlow: {
      details: `📍 ${clinicConfig.name}\nAddress: ${clinicConfig.address.en}\nPhone: ${clinicConfig.phone}\nWhatsApp: ${clinicConfig.whatsapp}\nTimings: ${clinicConfig.timings.summary.en}`,
    },
    labFlow: {
      intro: `🧪 Lab reports are shared directly on WhatsApp within ${clinicConfig.labReportHours} hours.\nTo request your report status, please type the patient's full name:`,
      askName: 'Please enter the patient’s full name:',
      askPhone: 'Please enter your WhatsApp / mobile number (e.g. 0300-1234567):',
      askTestName: 'Which lab test was performed? (e.g. CBC, Sugar, Lipid Profile):',
      savedSuccess: `Thank you! Our laboratory desk has received your request and will send your report on WhatsApp shortly.`,
    },
    receptionFlow: {
      intro: `📞 You can call our reception desk at ${clinicConfig.phone}, message us on WhatsApp, or leave your number and we will call you back.`,
      leaveNumberBtn: '📲 Leave number for callback',
      askName: 'Please type your name:',
      askPhone: 'Please enter your Pakistani mobile number (e.g. 0300-1234567):',
      savedCallback:
        'Thank you! We have saved your number. Our reception staff will call you back shortly.',
    },
    fallback: {
      firstTry:
        "I'm sorry, I didn't quite understand that. Please choose one of the options below:",
      secondTry:
        "I still couldn't understand your request. Would you like to talk directly with our reception staff on phone or WhatsApp?",
    },
  },
  ur: {
    greetingChooseLang: `السلام علیکم! میں ${clinicConfig.nameUr} کا اسسٹنٹ ہوں۔ براہِ کرم اپنی زبان منتخب کریں:`,
    welcomeMenu: 'آج میں آپ کی کیا مدد کر سکتا ہوں؟',
    privacyNotice: 'براہِ کرم چیٹ میں اپنی حساس طبی معلومات شیئر نہ کریں۔',
    onlineStatus: 'آن لائن',
    inputPlaceholder: 'اپنا پیغام لکھیں...',
    backButton: '⬅ واپس',
    cancelButton: '✖ منسوخ کریں',
    mainMenuButton: '🏠 مین مینو',
    callNowButton: `📞 کال کریں ${clinicConfig.phone}`,
    whatsappButton: '💬 واٹس ایپ کریں',
    mapDirectionsButton: '📍 گوگل میپ کھولیں',
    menu: {
      book: 'اپوائنٹمنٹ بک کریں',
      doctors: 'ڈاکٹرز اور اوقات',
      services: 'خدمات اور فیس',
      location: 'پتہ اور رابطہ',
      lab: 'لیب رپورٹس',
      reception: 'استقبالیہ سے بات کریں',
    },
    emergencyAlert: `🚨 یہ ایک ایمرجنسی کی صورتحال لگتی ہے۔ براہِ کرم فوراً ${clinicConfig.emergencyPhone} (یا ریسکیو ${clinicConfig.emergencyRescue}) پر کال کریں یا ابھی قریبی اسپتال جائیں۔`,
    symptomSafeReply:
      'ہمیں افسوس ہے کہ آپ کی طبیعت ٹھیک نہیں ہے۔ آپ کی حفاظت کے لیے میں چیٹ میں بیماری کی تشخیص، علاج یا دوا کی خوراک نہیں بتا سکتا۔ براہِ کرم ہمارے ڈاکٹر کو دکھائیں۔ کیا آپ اپوائنٹمنٹ بک کرنا چاہتے ہیں؟',
    booking: {
      askService: 'مرحلہ 1/6: آپ کو کون سی طبی سروس درکار ہے؟',
      askDoctor: 'مرحلہ 2/6: براہِ کرم ڈاکٹر منتخب کریں:',
      anyDoctor: 'کوئی بھی دستیاب ڈاکٹر',
      askDate: 'مرحلہ 3/6: آپ کس تاریخ کو آنا چاہیں گے؟',
      today: 'آج',
      tomorrow: 'کل',
      pickDatePrompt: 'براہِ کرم تاریخ YYYY-MM-DD کے فارمیٹ میں لکھیں (مثال: 2026-10-16):',
      askSlot: 'مرحلہ 4/6: براہِ کرم 30 منٹ کا دستیاب وقت منتخب کریں:',
      noSlots: 'اس تاریخ پر کوئی وقت خالی نہیں ہے۔ براہِ کرم دوسری تاریخ منتخب کریں:',
      askName: 'مرحلہ 5/6: براہِ کرم مریض کا پورا نام لکھیں:',
      askPhone: 'مرحلہ 6/6: براہِ کرم اپنا موبائل نمبر لکھیں (مثال: 0300-1234567):',
      invalidPhone:
        'فون نمبر درست نہیں لگ رہا۔ براہِ کرم درست پاکستانی موبائل نمبر لکھیں (جیسے 0300-1234567):',
      confirmPrompt: (s) =>
        `براہِ کرم اپنی اپوائنٹمنٹ کی تصدیق کریں:\n• سروس: ${s.service}\n• ڈاکٹر: ${s.doctor}\n• تاریخ: ${s.date}\n• وقت: ${s.slot}\n• مریض کا نام: ${s.name}\n• فون: ${s.phone}\n• فیس: PKR ${s.fee}`,
      confirmYes: '✅ اپوائنٹمنٹ کنفرم کریں',
      bookingSuccess: (ref) =>
        `🎉 آپ کی اپوائنٹمنٹ بک ہو گئی ہے!\nبکنگ ریفرنس: ${ref}\nبراہِ کرم وقت سے 10 منٹ پہلے تشریف لائیں۔`,
      bookingError:
        'معذرت، بکنگ مکمل نہیں ہو سکی (شاید یہ وقت ابھی بک ہو گیا ہے)۔ براہِ کرم دوبارہ کوشش کریں یا واٹس ایپ کریں۔',
      cancelled: 'بکنگ منسوخ کر دی گئی۔ میں آپ کی اور کیا مدد کر سکتا ہوں؟',
    },
    doctorsFlow: {
      selectDoctorPrompt: 'ڈاکٹر کے اوقات اور فیس دیکھنے کے لیے نام پر کلک کریں:',
      doctorDetails: (d) =>
        `👨‍⚕️ ${d.name}\n• شعبہ: ${d.specialty}\n• قابلیت: ${d.qualification}\n• اوقات: ${d.timings}\n• فیس: PKR ${d.fee}`,
      bookWithThisDoctor: '📅 اس ڈاکٹر کے ساتھ بک کریں',
    },
    servicesFlow: {
      selectServicePrompt: 'تفصیل اور فیس دیکھنے کے لیے سروس منتخب کریں:',
      serviceDetails: (s) => `🏥 ${s.title}\n${s.description}\n• فیس: کم از کم PKR ${s.feeFrom}`,
      bookThisService: '📅 یہ سروس بک کریں',
    },
    locationFlow: {
      details: `📍 ${clinicConfig.nameUr}\nپتہ: ${clinicConfig.address.ur}\nفون: ${clinicConfig.phone}\nواٹس ایپ: ${clinicConfig.whatsapp}\nاوقات: ${clinicConfig.timings.summary.ur}`,
    },
    labFlow: {
      intro: `🧪 لیب رپورٹس ${clinicConfig.labReportHours} گھنٹے کے اندر واٹس ایپ پر بھیج دی جاتی ہیں۔\nرپورٹ منگوانے کے لیے براہِ کرم مریض کا پورا نام لکھیں:`,
      askName: 'براہِ کرم مریض کا نام لکھیں:',
      askPhone: 'براہِ کرم اپنا واٹس ایپ / موبائل نمبر لکھیں (مثال: 0300-1234567):',
      askTestName: 'کون سا ٹیسٹ کروایا تھا؟ (جیسے CBC، شوگر، وغیرہ):',
      savedSuccess:
        'شکریہ! آپ کی درخواست لیبارٹری کو مل گئی ہے، جلد آپ کے واٹس ایپ پر رپورٹ بھیج دی جائے گی۔',
    },
    receptionFlow: {
      intro: `📞 آپ ہمارے استقبالیہ کو ${clinicConfig.phone} پر کال کر سکتے ہیں، واٹس ایپ کر سکتے ہیں، یا اپنا نمبر چھوڑ دیں، ہم خود آپ کو کال کریں گے۔`,
      leaveNumberBtn: '📲 اپنا نمبر لکھوائیں (کال بیک)',
      askName: 'براہِ کرم اپنا نام لکھیں:',
      askPhone: 'براہِ کرم اپنا پاکستانی موبائل نمبر لکھیں (مثال: 0300-1234567):',
      savedCallback: 'شکریہ! آپ کا نمبر محفوظ کر لیا گیا ہے۔ ہمارا عملہ جلد آپ کو کال کرے گا۔',
    },
    fallback: {
      firstTry: 'معذرت، میں آپ کی بات سمجھ نہیں سکا۔ براہِ کرم نیچے دیے گئے بٹنوں میں سے انتخاب کریں:',
      secondTry:
        'میں اب بھی آپ کی بات سمجھ نہیں پایا۔ کیا آپ براہِ راست ہمارے استقبالیہ سے فون یا واٹس ایپ پر بات کرنا چاہیں گے؟',
    },
  },
  sd: {
    greetingChooseLang: `السلام عليڪم! مان ${clinicConfig.nameSd} جو اسسٽنٽ آهيان. مهرباني ڪري پنهنجي ٻولي چونڊيو:`,
    welcomeMenu: 'اڄ مان توهان جي ڪهڙي مدد ڪري سگهان ٿو؟',
    privacyNotice: 'مهرباني ڪري چيٽ ۾ پنهنجي حساس طبي معلومات شيئر نه ڪريو.',
    onlineStatus: 'آن لائن',
    inputPlaceholder: 'پنهنجو پيغام لکو...',
    backButton: '⬅ واپس',
    cancelButton: '✖ منسوخ ڪريو',
    mainMenuButton: '🏠 مين مينيو',
    callNowButton: `📞 ڪال ڪريو ${clinicConfig.phone}`,
    whatsappButton: '💬 واٽس ايپ ڪريو',
    mapDirectionsButton: '📍 گوگل ميپ کوليو',
    menu: {
      book: 'اپائنٽمينٽ بُڪ ڪريو',
      doctors: 'ڊاڪٽر ۽ وقت',
      services: 'خدمتون ۽ فيس',
      location: 'پتو ۽ رابطو',
      lab: 'ليب رپورٽون',
      reception: 'استقباليه سان ڳالهايو',
    },
    emergencyAlert: `🚨 هي هڪ ايمرجنسي جي صورتحال لڳي ٿي. مهرباني ڪري فوراً ${clinicConfig.emergencyPhone} (يا ريسڪيو ${clinicConfig.emergencyRescue}) تي ڪال ڪريو يا هاڻي ئي ويجهي اسپتال وڃو.`,
    symptomSafeReply:
      'اسان کي افسوس آهي ته توهان جي طبيعت ٺيڪ ناهي. توهان جي حفاظت خاطر مان چيٽ ۾ بيماري جي تشخيص يا دوا جو مقدار نٿو ٻڌائي سگهان. مهرباني ڪري اسان جي ڊاڪٽر کي ڏيکاريو. ڇا توهان اپائنٽمينٽ بُڪ ڪرڻ چاهيو ٿا؟',
    booking: {
      askService: 'مرحلو 1/6: توهان کي ڪهڙي طبي سروس گهرجي؟',
      askDoctor: 'مرحلو 2/6: مهرباني ڪري ڊاڪٽر چونڊيو:',
      anyDoctor: 'ڪو به دستياب ڊاڪٽر',
      askDate: 'مرحلو 3/6: توهان ڪهڙي تاريخ تي اچڻ چاهيندا؟',
      today: 'اڄ',
      tomorrow: 'سڀاڻي',
      pickDatePrompt: 'مهرباني ڪري تاريخ YYYY-MM-DD فارميٽ ۾ لکو (مثال: 2026-10-16):',
      askSlot: 'مرحلو 4/6: مهرباني ڪري 30 منٽن جو دستياب وقت چونڊيو:',
      noSlots: 'هن تاريخ تي ڪو به وقت خالي ناهي. مهرباني ڪري ٻي تاريخ چونڊيو:',
      askName: 'مرحلو 5/6: مهرباني ڪري مريض جو پورو نالو لکو:',
      askPhone: 'مرحلو 6/6: مهرباني ڪري پنهنجو موبائيل نمبر لکو (مثال: 0300-1234567):',
      invalidPhone:
        'فون نمبر صحيح نه پيو لڳي. مهرباني ڪري صحيح پاڪستاني موبائيل نمبر لکو (جيئن 0300-1234567):',
      confirmPrompt: (s) =>
        `مهرباني ڪري پنهنجي اپائنٽمينٽ جي تصديق ڪريو:\n• سروس: ${s.service}\n• ڊاڪٽر: ${s.doctor}\n• تاريخ: ${s.date}\n• وقت: ${s.slot}\n• مريض جو نالو: ${s.name}\n• فون: ${s.phone}\n• فيس: PKR ${s.fee}`,
      confirmYes: '✅ اپائنٽمينٽ پڪي ڪريو',
      bookingSuccess: (ref) =>
        `🎉 توهان جي اپائنٽمينٽ بُڪ ٿي وئي آهي!\nبُڪنگ ريفرنس: ${ref}\nمهرباني ڪري وقت کان 10 منٽ اڳ تشريف آڻيو.`,
      bookingError:
        'معاف ڪجو، بُڪنگ مڪمل نه ٿي سگهي. مهرباني ڪري ٻيهر ڪوشش ڪريو يا واٽس ايپ ڪريو.',
      cancelled: 'بُڪنگ منسوخ ڪئي وئي. مان توهان جي ٻي ڪهڙي مدد ڪري سگهان ٿو؟',
    },
    doctorsFlow: {
      selectDoctorPrompt: 'ڊاڪٽر جا وقت ۽ فيس ڏسڻ لاءِ نالي تي ڪلڪ ڪريو:',
      doctorDetails: (d) =>
        `👨‍⚕️ ${d.name}\n• شعبو: ${d.specialty}\n• تعليم: ${d.qualification}\n• وقت: ${d.timings}\n• فيس: PKR ${d.fee}`,
      bookWithThisDoctor: '📅 هن ڊاڪٽر سان بُڪ ڪريو',
    },
    servicesFlow: {
      selectServicePrompt: 'تفصيل ۽ فيس ڏسڻ لاءِ سروس چونڊيو:',
      serviceDetails: (s) => `🏥 ${s.title}\n${s.description}\n• فيس: گهٽ ۾ گهٽ PKR ${s.feeFrom}`,
      bookThisService: '📅 هي سروس بُڪ ڪريو',
    },
    locationFlow: {
      details: `📍 ${clinicConfig.nameSd}\nپتو: ${clinicConfig.address.sd}\nفون: ${clinicConfig.phone}\nواٽس ايپ: ${clinicConfig.whatsapp}\nوقت: ${clinicConfig.timings.summary.sd}`,
    },
    labFlow: {
      intro: `🧪 ليب رپورٽون ${clinicConfig.labReportHours} ڪلاڪن اندر واٽس ايپ تي موڪليون وينديون آهن.\nرپورٽ گهرائڻ لاءِ مهرباني ڪري مريض جو پورو نالو لکو:`,
      askName: 'مهرباني ڪري مريض جو نالو لکو:',
      askPhone: 'مهرباني ڪري پنهنجو واٽس ايپ / موبائيل نمبر لکو (مثال: 0300-1234567):',
      askTestName: 'ڪهڙو ٽيسٽ ڪرايو هو؟ (جيئن CBC، شوگر، وغيره):',
      savedSuccess:
        'مهرباني! توهان جي درخواست ليبارٽري کي ملي وئي آهي، جلد توهان جي واٽس ايپ تي رپورٽ موڪلي ويندي.',
    },
    receptionFlow: {
      intro: `📞 توهان اسان جي استقباليه کي ${clinicConfig.phone} تي ڪال ڪري سگهو ٿا، واٽس ايپ ڪري سگهو ٿا، يا پنهنجو نمبر ڇڏيو ته اسان توهان کي ڪال ڪنداسين.`,
      leaveNumberBtn: '📲 پنهنجو نمبر لکرايو (ڪال بيڪ)',
      askName: 'مهرباني ڪري پنهنجو نالو لکو:',
      askPhone: 'مهرباني ڪري پنهنجو پاڪستاني موبائيل نمبر لکو (مثال: 0300-1234567):',
      savedCallback: 'مهرباني! توهان جو نمبر محفوظ ڪيو ويو آهي. اسان جو عملو جلد توهان کي ڪال ڪندو.',
    },
    fallback: {
      firstTry: 'معاف ڪجو، مان توهان جي ڳالهه سمجهي نه سگهيس. مهرباني ڪري هيٺ ڏنل بٽڻن مان چونڊيو:',
      secondTry:
        'مان اڃا تائين توهان جي ڳالهه نه سمجهي سگهيس. ڇا توهان سڌو اسان جي استقباليه سان فون يا واٽس ايپ تي ڳالهائڻ چاهيندا؟',
    },
  },
};

/**
 * MANDATORY EMERGENCY KEYWORDS (Section 9)
 * English, Urdu, Sindhi, and Roman Urdu equivalents.
 */
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  "can't breathe",
  'cannot breathe',
  'cant breathe',
  'difficulty breathing',
  'shortness of breath',
  'heavy bleeding',
  'severe bleeding',
  'unconscious',
  'fainted',
  'accident',
  'seizure',
  'fits',
  'stroke',
  'poison',
  'suicide',
  // Roman Urdu
  'seene mein dard',
  'seenay mein dard',
  'dil ka dora',
  'saans nahi',
  'sans nahi',
  'khoon beh',
  'behosh',
  'hadsa',
  'mirgi',
  'jhatke',
  'falij',
  // Urdu script
  'سینے میں درد',
  'دل کا دورہ',
  'سانس نہیں',
  'سانس رک',
  'زیادہ خون',
  'خون بہہ',
  'بے ہوش',
  'بےہوش',
  'حادثہ',
  'مرگی',
  'جھٹکے',
  'فالج',
  // Sindhi script
  'سيني ۾ سور',
  'دل جو دورو',
  'ساهه نه',
  'ساهه کڻڻ ۾ تڪليف',
  'رت وهي',
  'بي هوش',
  'حادثو',
  'مرگهي',
  'فالج',
];

/**
 * SYMPTOM / MEDICAL ADVICE KEYWORDS (Section 9)
 * Triggers empathetic refusal to diagnose/prescribe + offer to book a doctor.
 */
const SYMPTOM_KEYWORDS = [
  'fever',
  'headache',
  'stomach pain',
  'vomiting',
  'diarrhea',
  'loose motion',
  'cough',
  'flu',
  'infection',
  'rash',
  'dizzy',
  'dizziness',
  'tablet for',
  'medicine for',
  'which medicine',
  'what medicine',
  'medicine',
  'medication',
  'paracetamol',
  'panadol',
  'brufen',
  'ibuprofen',
  'aspirin',
  'disprin',
  'amoxicillin',
  'augmentin',
  'azithromycin',
  'flagyl',
  'rigix',
  'cetirizine',
  'syrup',
  'capsule',
  'dose',
  'dosage',
  'how much paracetamol',
  'how many tablets',
  'antibiotic',
  'painkiller',
  'prescribe',
  'prescription',
  'diagnose',
  'diagnosis',
  'treatment for',
  'pregnancy pain',
  'toothache',
  'blood pressure',
  // Roman Urdu
  'bukhar',
  'sar dard',
  'pait dard',
  'ulti',
  'dast',
  'khansi',
  'zukam',
  'dawa bata',
  'konsi dawa',
  'kaunsi dawa',
  'dawai',
  'goli',
  'khurak',
  'daant mein dard',
  // Urdu script
  'بخار',
  'سر درد',
  'پیٹ میں درد',
  'الٹی',
  'دست',
  'کھانسی',
  'زکام',
  'دوا بتائیں',
  'کون سی دوا',
  'کونسی دوا',
  'پیراسیٹامول',
  'پیناڈول',
  'بروفن',
  'خوراک',
  'تشخیص',
  'گولی',
  'دانت میں درد',
  // Sindhi script
  'بخار آهي',
  'بخار',
  'مٿي ۾ سور',
  'پيٽ ۾ سور',
  'الٽي',
  'دست',
  'کنگهه',
  'زڪام',
  'دوا ٻڌايو',
  'ڪهڙي دوا',
  'پيراسيٽامول',
  'پيناڊول',
  'مقدار',
  'گوري',
  'ڏند ۾ سور',
];

function containsKeyword(text: string, kw: string): boolean {
  const lower = kw.toLowerCase();
  if (/^[a-z]{1,4}$/.test(lower)) {
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(lower);
}

/**
 * INTENT KEYWORD MATCHING (Section 9)
 */
export function matchUserIntent(rawInput: string): BotIntent {
  const text = String(rawInput || '')
    .slice(0, 500)
    .toLowerCase()
    .trim();
  if (!text) return 'UNKNOWN';

  // 1. Check Emergency first (highest priority)
  for (const kw of EMERGENCY_KEYWORDS) {
    if (containsKeyword(text, kw)) {
      return 'EMERGENCY';
    }
  }

  // 2. Check Symptoms / Medication requests (safety guardrail)
  for (const kw of SYMPTOM_KEYWORDS) {
    if (containsKeyword(text, kw)) {
      return 'SYMPTOM_SAFETY';
    }
  }

  // 3. Appointment keywords
  const bookKeywords = [
    'appointment',
    'apointment',
    'appointmnt',
    'book',
    'booking',
    'slot',
    'اپوائنٹمنٹ',
    'اپائنٽمينٽ',
    'بکنگ',
    'بُڪنگ',
    'وقت لینا',
    'وقت وٺڻ',
  ];
  if (bookKeywords.some((k) => containsKeyword(text, k))) return 'BOOK_APPOINTMENT';

  // 4. Doctors & Timings keywords
  const doctorTimingKeywords = [
    'doctor',
    'doctors',
    'dr',
    'specialist',
    'timing',
    'timings',
    'time',
    'waqt',
    'kitne baje',
    'kab khulta',
    'hours',
    'schedule',
    'sunday',
    'ڈاکٹر',
    'ڊاڪٽر',
    'وقت',
    'اوقات',
    'ٹائمنگ',
    'ٽائمنگ',
    'کتنے بجے',
    'گھڻي وڳي',
  ];
  if (doctorTimingKeywords.some((k) => containsKeyword(text, k))) return 'DOCTORS_TIMINGS';

  // 5. Services & Fees keywords
  const feeServiceKeywords = [
    'fee',
    'fees',
    'price',
    'cost',
    'charges',
    'kitni fee',
    'service',
    'services',
    'ultrasound',
    'ecg',
    'dental',
    'vaccine',
    'فیس',
    'فيس',
    'خرچہ',
    'خدمات',
    'خدمتون',
    'الٹراساؤنڈ',
    'الٽراسائونڊ',
  ];
  if (feeServiceKeywords.some((k) => containsKeyword(text, k))) return 'SERVICES_FEES';

  // 6. Location & Contact keywords
  const locationKeywords = [
    'address',
    'location',
    'map',
    'where',
    'kahan',
    'kidhar',
    'clifton',
    'direction',
    'پتہ',
    'پتو',
    'کہاں',
    'ڪٿي',
    'لوکیشن',
    'راستہ',
  ];
  if (locationKeywords.some((k) => containsKeyword(text, k))) return 'LOCATION_CONTACT';

  // 7. Lab Reports keywords
  const labKeywords = [
    'report',
    'reports',
    'lab',
    'test',
    'blood test',
    'cbc',
    'رپورٹ',
    'رپورٽ',
    'لیب',
    'ليب',
    'ٹیسٹ',
    'ٽيسٽ',
  ];
  if (labKeywords.some((k) => containsKeyword(text, k))) return 'LAB_REPORTS';

  // 8. Reception / Human contact keywords
  const receptionKeywords = [
    'reception',
    'human',
    'call',
    'phone',
    'whatsapp',
    'number',
    'baat',
    'rabta',
    'استقبالیہ',
    'استقباليه',
    'کال',
    'ڪال',
    'رابطہ',
    'رابطو',
    'نمبر',
  ];
  if (receptionKeywords.some((k) => containsKeyword(text, k))) return 'TALK_RECEPTION';

  // 9. Greeting keywords
  const greetingKeywords = [
    'hi',
    'hello',
    'salam',
    'assalam',
    'aoa',
    'hey',
    'سلام',
    'السلام',
    'ہیلو',
    'هيلو',
  ];
  if (greetingKeywords.some((k) => containsKeyword(text, k))) return 'GREETING';

  return 'UNKNOWN';
}
