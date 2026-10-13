import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultWeekdaySlots = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
];

const sundayMorningSlots = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
];

async function main() {
  console.log('🌱 Seeding MediCare Hub database...');

  const servicesData = [
    {
      slug: 'general-physician',
      title: 'General Physician',
      titleUr: 'جنرل فزیشن (عام امراض کے ماہر)',
      titleSd: 'جنرل فزيشن (عام بيمارين جو ماهر)',
      description:
        'Comprehensive primary care for fever, seasonal infections, stomach issues, weakness, and everyday family health concerns.',
      descriptionUr:
        'بخار، موسمی انفیکشن، معدے کے مسائل، جسمانی کمزوری اور روزمرہ خاندانی صحت کے مسائل کا مکمل علاج۔',
      descriptionSd:
        'بخار، موسمي انفيڪشن، معدي جي تڪليف، ڪمزوري ۽ روزاني خانداني صحت جي مسئلن جو مڪمل علاج.',
      whatWeTreat: JSON.stringify([
        'Viral fever, flu, dengue, and malaria evaluation',
        'Respiratory tract infections, cough, and asthma management',
        'Gastritis, acidity, typhoid, and digestive complaints',
        'Routine physical checkups, fatigue, and nutritional deficiencies',
      ]),
      howToPrepare: JSON.stringify([
        'Bring any previous medical prescriptions or lab reports',
        'Write down all medicines you are currently taking',
        'Arrive 10 minutes before your scheduled appointment slot',
      ]),
      feeFrom: 1500,
      category: 'General',
      icon: 'Stethoscope',
    },
    {
      slug: 'pediatrics',
      title: 'Pediatrics (Child Specialist)',
      titleUr: 'بچوں کے امراض کے ماہر (پیڈیاٹرکس)',
      titleSd: 'ٻارن جي بيمارين جو ماهر (پيڊياٽرڪس)',
      description:
        'Gentle care for newborns, infants, and children including growth monitoring, nutrition, and childhood illnesses.',
      descriptionUr:
        'نوزائیدہ اور بڑھتے ہوئے بچوں کی صحت، نشوونما، خوراک اور بچپن کی بیماریوں کا تسلی بخش علاج۔',
      descriptionSd:
        'نون ڄاول ۽ وڌندڙ ٻارن جي صحت، واڌ ويجهه، خوراڪ ۽ ٻاروتڻ جي بيمارين جو خاص خيال ۽ علاج.',
      whatWeTreat: JSON.stringify([
        'Newborn checkups, jaundice evaluation, and feeding guidance',
        'Childhood fever, chest congestion, diarrhea, and allergies',
        'Growth milestones, weight gain, and pediatric nutrition',
        'Immunization counseling and school health assessments',
      ]),
      howToPrepare: JSON.stringify([
        'Bring your child’s vaccination card (EPI card) to every visit',
        'Note the child’s temperature readings and feeding frequency',
        'Bring a favorite small toy or blanket to keep the child comfortable',
      ]),
      feeFrom: 1800,
      category: 'Women & Child',
      icon: 'Baby',
    },
    {
      slug: 'gynecology-obstetrics',
      title: 'Gynecology & Obstetrics',
      titleUr: 'زنانہ امراض اور زچگی کی ماہر (گائناکالوجی)',
      titleSd: 'عورتن جي بيمارين ۽ ويم جي ماهر (گائناڪولوجي)',
      description:
        'Private, respectful maternity care, antenatal checkups, PCOS management, and complete women’s health consultations.',
      descriptionUr:
        'مکمل رازداری اور احترام کے ساتھ حمل کے معائنے، پی سی او ایس، اور خواتین کی صحت کے تمام مسائل کا علاج۔',
      descriptionSd:
        'مڪمل رازداري ۽ عزت سان حمل جي چڪاس، پي سي او ايس، ۽ عورتن جي صحت جي سمورن مسئلن جو علاج.',
      whatWeTreat: JSON.stringify([
        'Antenatal (pregnancy) checkups and high-risk pregnancy monitoring',
        'PCOS, hormonal imbalance, and menstrual irregularities',
        'Infertility counseling and preconception care',
        'Postnatal recovery, family planning, and women’s wellness checks',
      ]),
      howToPrepare: JSON.stringify([
        'Bring previous ultrasound scans and antenatal lab reports',
        'Note the first day of your last menstrual cycle',
        'Drink water prior to your visit if a pelvic ultrasound is needed',
      ]),
      feeFrom: 2000,
      category: 'Women & Child',
      icon: 'HeartHandshake',
    },
    {
      slug: 'dental-care',
      title: 'Dental Care',
      titleUr: 'دانتوں کا علاج (ڈینٹل کیئر)',
      titleSd: 'ڏندن جو علاج (ڊينٽل ڪيئر)',
      description:
        'Painless tooth extractions, scaling & polishing, fillings, root canal treatment, and family oral hygiene.',
      descriptionUr:
        'بغیر درد کے دانت نکالنا، صفائی اور پالش، فلنگ، روٹ کینال اور مسوڑھوں کی بیماریوں کا جدید علاج۔',
      descriptionSd:
        'بنا سور جي ڏند ڪڍڻ، صفائي ۽ پالش، فلنگ، روٽ ڪينال ۽ مهارن جي بيمارين جو جديد علاج.',
      whatWeTreat: JSON.stringify([
        'Toothache relief, dental fillings, and root canal therapy (RCT)',
        'Ultrasonic scaling, polishing, and bleeding gums treatment',
        'Painless tooth extraction and wisdom tooth care',
        'Children’s preventive dental checkups and fluoride application',
      ]),
      howToPrepare: JSON.stringify([
        'Brush your teeth gently before arriving at the clinic',
        'Inform the dentist if you have diabetes, high BP, or take blood thinners',
        'Bring any previous dental X-rays (OPG or periapical films)',
      ]),
      feeFrom: 1500,
      category: 'Dental',
      icon: 'Sparkles',
    },
    {
      slug: 'laboratory-diagnostics',
      title: 'Laboratory & Diagnostics',
      titleUr: 'لیبارٹری اور خون کے ٹیسٹ',
      titleSd: 'ليبارٽري ۽ رت جا ٽيسٽ',
      description:
        'Accurate blood, urine, and pathology tests with automated analyzers and digital reports delivered on WhatsApp.',
      descriptionUr:
        'جدید مشینوں کے ذریعے خون اور پیشاب کے مستند ٹیسٹ، جن کی ڈیجیٹل رپورٹ واٹس ایپ پر فراہم کی جاتی ہے۔',
      descriptionSd:
        'جديد مشينن ذريعي رت ۽ پيشاب جا معتبر ٽيسٽ، جن جي ڊجيٽل رپورٽ واٽس ايپ تي ملي ٿي.',
      whatWeTreat: JSON.stringify([
        'Complete Blood Count (CBC), Dengue NS1, Malaria, and Typhoid tests',
        'Fasting Blood Sugar, HbA1c, Lipid Profile (Cholesterol)',
        'Liver Function Tests (LFTs), Renal Function Tests (RFTs), and Thyroid (TSH)',
        'Urine D/R, Vitamin D, Vitamin B12, and Iron studies',
      ]),
      howToPrepare: JSON.stringify([
        'For Lipid Profile or Fasting Sugar, fast for 10–12 hours (plain water is allowed)',
        'Bring your doctor’s prescription slip if available',
        'Provide your active WhatsApp number at reception to receive digital PDF reports',
      ]),
      feeFrom: 500,
      category: 'Diagnostics',
      icon: 'FlaskConical',
    },
    {
      slug: 'ecg-ultrasound',
      title: 'ECG & Ultrasound',
      titleUr: 'ای سی جی اور الٹراساؤنڈ',
      titleSd: 'اي سي جي ۽ الٽراسائونڊ',
      description:
        'Digital 12-lead ECG and high-resolution color Doppler ultrasound with female sonologist availability.',
      descriptionUr:
        'ڈیجیٹل ای سی جی اور ہائی ریزولوشن کلر ڈوپلر الٹراساؤنڈ، خواتین کے لیے لیڈی سونولوجسٹ کی سہولت کے ساتھ۔',
      descriptionSd:
        'ڊجيٽل اي سي جي ۽ هاءِ ريزوليوشن الٽراسائونڊ، عورتن لاءِ ليڊي سونولوجسٽ جي سهولت سان گڏ.',
      whatWeTreat: JSON.stringify([
        'Digital 12-Lead Electrocardiogram (ECG) for chest pain and heart rhythm checks',
        'Abdominal and Pelvic Ultrasound (KUB, liver, gallbladder)',
        'Obstetric / Pregnancy Ultrasound (growth and anomaly scans)',
        'Color Doppler and Thyroid / Breast ultrasound screenings',
      ]),
      howToPrepare: JSON.stringify([
        'For abdominal ultrasound, avoid heavy meals for 6 hours before the scan',
        'For pelvic or KUB ultrasound, drink 3–4 glasses of water 45 minutes prior so the bladder is full',
        'Wear comfortable two-piece clothing for easy access during scanning',
      ]),
      feeFrom: 1200,
      category: 'Diagnostics',
      icon: 'Activity',
    },
    {
      slug: 'vaccination',
      title: 'Vaccination',
      titleUr: 'حفاظتی ٹیکہ جات (ویکسینیشن)',
      titleSd: 'حفاظتي ٽيڪا (ويڪسينيشن)',
      description:
        'Cold-chain maintained vaccines for newborns, children, and adults including flu, hepatitis, tetanus, and typhoid.',
      descriptionUr:
        'بچوں اور بڑوں کے لیے مستند کولڈ چین میں محفوظ حفاظتی ویکسینز بشمول فلو، ہیپاٹائٹس، تشنج اور ٹائیفائیڈ۔',
      descriptionSd:
        'ٻارن ۽ وڏن لاءِ محفوظ ڪولڊ چين ويڪسينز بشمول فلو، هيپاٽائيٽس، ٽيٽنس ۽ ٽائيفائيڊ.',
      whatWeTreat: JSON.stringify([
        'Childhood routine immunization and booster doses',
        'Typhoid Conjugate Vaccine (TCV) and Hepatitis A & B vaccines',
        'Seasonal Influenza (Flu) and Pneumonia vaccines for elderly patients',
        'Tetanus Toxoid (TT) and Rabies post-exposure vaccination',
      ]),
      howToPrepare: JSON.stringify([
        'Always bring the vaccination record card to update dose dates',
        'Inform the doctor if the patient currently has a high fever',
        'Wait in the clinic lounge for 15 minutes after vaccination for observation',
      ]),
      feeFrom: 800,
      category: 'General',
      icon: 'Syringe',
    },
    {
      slug: 'diabetes-bp-care',
      title: 'Diabetes & BP Care',
      titleUr: 'شوگر اور بلڈ پریشر کلینک',
      titleSd: 'شوگر ۽ بلڊ پريشر ڪلينڪ',
      description:
        'Long-term management of diabetes, hypertension, cholesterol, and foot care tailored to Pakistani diets and lifestyles.',
      descriptionUr:
        'پاکستانی خوراک اور طرزِ زندگی کے مطابق شوگر، ہائی بلڈ پریشر اور کولیسٹرول کا مستقل اور آسان کنٹرول۔',
      descriptionSd:
        'پاڪستاني خوراڪ ۽ رهڻي ڪهڻي موجب شوگر، هاءِ بلڊ پريشر ۽ ڪوليسٽرول جو مستقل ۽ آسان علاج.',
      whatWeTreat: JSON.stringify([
        'Type 1, Type 2, and Gestational Diabetes management & insulin titration',
        'Uncontrolled Hypertension (High Blood Pressure) and heart risk prevention',
        'Diabetic neuropathy (numbness/burning feet) and kidney screening',
        'Customized Pakistani diet plans (including safe fasting guidance for Ramadan)',
      ]),
      howToPrepare: JSON.stringify([
        'Bring your home glucometer and blood pressure logbook if you maintain one',
        'Bring all current tablet strips or insulin pens to verify dosages',
        'Recent HbA1c or kidney profile reports (within 3 months) help speed up evaluation',
      ]),
      feeFrom: 1800,
      category: 'General',
      icon: 'HeartPulse',
    },
  ];

  const createdServices: Record<string, string> = {};
  for (const s of servicesData) {
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
    createdServices[s.slug] = service.id;
  }

  const doctorsData = [
    {
      slug: 'dr-tariq-mahmood-siddiqui',
      name: 'Prof. Dr. Tariq Mahmood Siddiqui',
      nameUr: 'پروفیسر ڈاکٹر طارق محمود صدیقی',
      nameSd: 'پروفيسر ڊاڪٽر طارق محمود صديقي',
      specialty: 'Senior General Physician & Internal Medicine',
      specialtyUr: 'سینیئر جنرل فزیشن اور ماہر امراضِ باطنہ',
      specialtySd: 'سينيئر جنرل فزيشن ۽ اندروني بيمارين جو ماهر',
      serviceSlug: 'general-physician',
      qualification: 'MBBS (Dow), FCPS (Medicine), FRCP (London)',
      experienceYears: 18,
      bio: 'Prof. Dr. Tariq Mahmood Siddiqui has over 18 years of clinical experience in internal medicine, infectious diseases, and preventive family healthcare in Karachi. Known for his patient listening and clear explanations, he treats acute fevers, digestive disorders, and complex medical conditions.',
      bioUr:
        'پروفیسر ڈاکٹر طارق محمود صدیقی کراچی میں جنرل میڈیسن اور خاندانی صحت کے شعبے میں 18 سال سے زائد کا تجربہ رکھتے ہیں۔ وہ مریضوں کی بات غور سے سننے اور سادہ الفاظ میں بیماری اور علاج سمجھانے کے لیے جانے جاتے ہیں۔',
      bioSd:
        'پروفيسر ڊاڪٽر طارق محمود صديقي ڪراچي ۾ جنرل ميڊيسن ۽ خانداني صحت جي شعبي ۾ 18 سالن کان وڌيڪ تجربو رکي ٿو. هو مريضن جي ڳالهه غور سان ٻڌڻ ۽ سادي زبان ۾ علاج سمجهائڻ لاءِ مشهور آهي.',
      photo: '/images/doctor-1.svg',
      fee: 2000,
      languages: JSON.stringify(['English', 'Urdu', 'Sindhi', 'Punjabi']),
      availability: JSON.stringify({
        Monday: defaultWeekdaySlots,
        Tuesday: defaultWeekdaySlots,
        Wednesday: defaultWeekdaySlots,
        Thursday: defaultWeekdaySlots,
        Friday: defaultWeekdaySlots,
        Saturday: defaultWeekdaySlots,
        Sunday: sundayMorningSlots,
      }),
      isActive: true,
    },
    {
      slug: 'dr-ayesha-kamran',
      name: 'Dr. Ayesha Kamran',
      nameUr: 'ڈاکٹر عائشہ کامران',
      nameSd: 'ڊاڪٽر عائشه ڪامران',
      specialty: 'Consultant Pediatrician (Child Specialist)',
      specialtyUr: 'کنسلٹنٹ چائلڈ اسپیشلسٹ (ماہر امراضِ اطفال)',
      specialtySd: 'ڪنسلٽنٽ چائلڊ اسپيشلسٽ (ٻارن جي بيمارين جي ماهر)',
      serviceSlug: 'pediatrics',
      qualification: 'MBBS (KEMU), FCPS (Pediatrics), DCH',
      experienceYears: 12,
      bio: 'Dr. Ayesha Kamran specializes in newborn care, childhood immunization, pediatric asthma, and nutritional growth tracking. Parents appreciate her gentle approach with anxious children and practical feeding advice.',
      bioUr:
        'ڈاکٹر عائشہ کامران نوزائیدہ بچوں کی نگہداشت، ویکسینیشن، بچوں کے دمے اور نشوونما کے مسائل میں 12 سال کا تجربہ رکھتی ہیں۔ والدین ان کے شفیق رویے اور عملی مشوروں کو بے حد سراہتے ہیں۔',
      bioSd:
        'ڊاڪٽر عائشه ڪامران نون ڄاول ٻارن جي سار سنڀال، ويڪسينيشن ۽ ٻارن جي واڌ ويجهه جي مسئلن ۾ 12 سالن جو تجربو رکي ٿي.',
      photo: '/images/doctor-2.svg',
      fee: 1800,
      languages: JSON.stringify(['English', 'Urdu', 'Punjabi']),
      availability: JSON.stringify({
        Monday: defaultWeekdaySlots.slice(0, 12),
        Tuesday: defaultWeekdaySlots.slice(0, 12),
        Wednesday: defaultWeekdaySlots.slice(0, 12),
        Thursday: defaultWeekdaySlots.slice(0, 12),
        Friday: defaultWeekdaySlots.slice(0, 12),
        Saturday: defaultWeekdaySlots,
        Sunday: sundayMorningSlots,
      }),
      isActive: true,
    },
    {
      slug: 'dr-nadia-farooq-memon',
      name: 'Dr. Nadia Farooq Memon',
      nameUr: 'ڈاکٹر نادیہ فاروق میمن',
      nameSd: 'ڊاڪٽر ناديه فاروق ميمڻ',
      specialty: 'Consultant Gynecologist & Obstetrician',
      specialtyUr: 'کنسلٹنٹ گائناکالوجسٹ (ماہر امراضِ نسواں و زچگی)',
      specialtySd: 'ڪنسلٽنٽ گائناڪولوجسٽ (عورتن جي بيمارين ۽ ويم جي ماهر)',
      serviceSlug: 'gynecology-obstetrics',
      qualification: 'MBBS (LUMHS), FCPS (Obs & Gynae), MRCOG-I (UK)',
      experienceYears: 14,
      bio: 'Dr. Nadia Farooq Memon provides compassionate antenatal care, high-risk pregnancy management, PCOS treatment, and women’s health consultations in a comfortable, private environment for families across Sindh.',
      bioUr:
        'ڈاکٹر نادیہ فاروق میمن حمل کی نگہداشت، پی سی او ایس اور خواتین کے جملہ مسائل کے علاج میں 14 سال کا وسیع تجربہ رکھتی ہیں اور اردو و سندھی دونوں زبانوں میں مریضوں کی رہنمائی کرتی ہیں۔',
      bioSd:
        'ڊاڪٽر ناديه فاروق ميمڻ حمل جي سار سنڀال، پي سي او ايس ۽ عورتن جي صحت جي مسئلن ۾ 14 سالن جو وسيع تجربو رکي ٿي ۽ سنڌي توڙي اردو ۾ مريضن جي رهنمائي ڪري ٿي.',
      photo: '/images/doctor-3.svg',
      fee: 2000,
      languages: JSON.stringify(['English', 'Urdu', 'Sindhi']),
      availability: JSON.stringify({
        Monday: defaultWeekdaySlots,
        Tuesday: defaultWeekdaySlots,
        Wednesday: defaultWeekdaySlots,
        Thursday: defaultWeekdaySlots,
        Friday: defaultWeekdaySlots,
        Saturday: defaultWeekdaySlots,
        Sunday: [],
      }),
      isActive: true,
    },
    {
      slug: 'dr-bilal-ahmed-qureshi',
      name: 'Dr. Bilal Ahmed Qureshi',
      nameUr: 'ڈاکٹر بلال احمد قریشی',
      nameSd: 'ڊاڪٽر بلال احمد قريشي',
      specialty: 'Senior Dental Surgeon & Endodontist',
      specialtyUr: 'سینیئر ڈینٹل سرجن (ماہر امراضِ دندان)',
      specialtySd: 'سينيئر ڊينٽل سرجن (ڏندن جي بيمارين جو ماهر)',
      serviceSlug: 'dental-care',
      qualification: 'BDS (Baqai), RDS, MCPS (Operative Dentistry)',
      experienceYears: 10,
      bio: 'Dr. Bilal Ahmed Qureshi focuses on painless single-visit root canals, ultrasonic scaling, cosmetic fillings, and gentle extractions using strict international sterilization standards.',
      bioUr:
        'ڈاکٹر بلال احمد قریشی بغیر درد کے روٹ کینال، دانتوں کی صفائی، فلنگ اور جراثیم سے پاک جدید آلات کے ساتھ دانتوں کے علاج میں 10 سال کا تجربہ رکھتے ہیں۔',
      bioSd:
        'ڊاڪٽر بلال احمد قريشي بنا سور جي روٽ ڪينال، ڏندن جي صفائي، فلنگ ۽ جديد آلات سان ڏندن جي علاج ۾ 10 سالن جو تجربو رکي ٿو.',
      photo: '/images/doctor-4.svg',
      fee: 1500,
      languages: JSON.stringify(['English', 'Urdu', 'Sindhi']),
      availability: JSON.stringify({
        Monday: defaultWeekdaySlots.slice(6),
        Tuesday: defaultWeekdaySlots.slice(6),
        Wednesday: defaultWeekdaySlots.slice(6),
        Thursday: defaultWeekdaySlots.slice(6),
        Friday: defaultWeekdaySlots.slice(6),
        Saturday: defaultWeekdaySlots,
        Sunday: sundayMorningSlots,
      }),
      isActive: true,
    },
    {
      slug: 'dr-sanaullah-bhutto',
      name: 'Dr. Sanaullah Bhutto',
      nameUr: 'ڈاکٹر ثناء اللہ بھٹو',
      nameSd: 'ڊاڪٽر ثناءُ الله ڀٽو',
      specialty: 'Diabetologist & Hypertension Specialist',
      specialtyUr: 'ماہر امراضِ شوگر، بلڈ پریشر اور میٹابولزم',
      specialtySd: 'شوگر، بلڊ پريشر ۽ ميٽابولزم جو ماهر ڊاڪٽر',
      serviceSlug: 'diabetes-bp-care',
      qualification: 'MBBS (SMBBMU), Dip. in Diabetes (UK), MCPS (Medicine)',
      experienceYears: 15,
      bio: 'Dr. Sanaullah Bhutto helps elderly patients and families manage Type 2 diabetes, blood pressure, thyroid disorders, and cholesterol with practical diet charts and affordable medication regimens.',
      bioUr:
        'ڈاکٹر ثناء اللہ بھٹو بزرگ مریضوں اور خاندانوں کو شوگر، بلڈ پریشر، تھائی رائیڈ اور کولیسٹرول کو آسان خوراک کے چارٹ اور مناسب ادویات کے ذریعے کنٹرول کرنے میں مدد دیتے ہیں۔',
      bioSd:
        'ڊاڪٽر ثناءُ الله ڀٽو بزرگ مريضن ۽ خاندانن کي شوگر، بلڊ پريشر ۽ ڪوليسٽرول کي آسان خوراڪ ۽ مناسب دوائن ذريعي ڪنٽرول ڪرڻ ۾ مدد ڪري ٿو.',
      photo: '/images/doctor-5.svg',
      fee: 1800,
      languages: JSON.stringify(['English', 'Urdu', 'Sindhi']),
      availability: JSON.stringify({
        Monday: defaultWeekdaySlots,
        Tuesday: defaultWeekdaySlots,
        Wednesday: defaultWeekdaySlots,
        Thursday: defaultWeekdaySlots,
        Friday: defaultWeekdaySlots,
        Saturday: defaultWeekdaySlots,
        Sunday: sundayMorningSlots,
      }),
      isActive: true,
    },
    {
      slug: 'dr-zainab-raza-shah',
      name: 'Dr. Zainab Raza Shah',
      nameUr: 'ڈاکٹر زینب رضا شاہ',
      nameSd: 'ڊاڪٽر زينب رضا شاهه',
      specialty: 'Consultant Radiologist & Sonologist',
      specialtyUr: 'کنسلٹنٹ ریڈیولوجسٹ اور لیڈی سونولوجسٹ (الٹراساؤنڈ و ای سی جی)',
      specialtySd: 'ڪنسلٽنٽ ريڊيولوجسٽ ۽ ليڊي سونولوجسٽ (الٽراسائونڊ ۽ اي سي جي)',
      serviceSlug: 'ecg-ultrasound',
      qualification: 'MBBS (AKU), FCPS (Diagnostic Radiology)',
      experienceYears: 9,
      bio: 'Dr. Zainab Raza Shah performs high-precision obstetric, pelvic, abdominal, and color Doppler ultrasounds as well as diagnostic ECG evaluations, ensuring comfort and privacy for female patients.',
      bioUr:
        'ڈاکٹر زینب رضا شاہ خواتین کے لیے مکمل رازداری اور آرام دہ ماحول میں حمل کے الٹراساؤنڈ، پیٹ کے الٹراساؤنڈ، کلر ڈوپلر اور ای سی جی تشخیص کے فرائض سرانجام دیتی ہیں۔',
      bioSd:
        'ڊاڪٽر زينب رضا شاهه عورتن لاءِ مڪمل رازداري ۽ آرامده ماحول ۾ حمل جي الٽراسائونڊ، پيٽ جي الٽراسائونڊ، ڪلر ڊاپلر ۽ اي سي جي جي چڪاس ڪري ٿي.',
      photo: '/images/doctor-6.svg',
      fee: 1500,
      languages: JSON.stringify(['English', 'Urdu', 'Sindhi', 'Punjabi']),
      availability: JSON.stringify({
        Monday: defaultWeekdaySlots.slice(0, 10),
        Tuesday: defaultWeekdaySlots.slice(0, 10),
        Wednesday: defaultWeekdaySlots.slice(0, 10),
        Thursday: defaultWeekdaySlots.slice(0, 10),
        Friday: defaultWeekdaySlots.slice(0, 10),
        Saturday: defaultWeekdaySlots.slice(0, 12),
        Sunday: [],
      }),
      isActive: true,
    },
  ];

  const createdDoctors: Record<string, string> = {};
  for (const d of doctorsData) {
    const doc = await prisma.doctor.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
    createdDoctors[d.slug] = doc.id;
  }

  // Create sample appointments for today and tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const sampleAppointments = [
    {
      reference: 'APT-20261013-1001',
      doctorId: createdDoctors['dr-tariq-mahmood-siddiqui'],
      serviceId: createdServices['general-physician'],
      date: todayStr,
      timeSlot: '10:30 AM',
      activeSlotKey: `${createdDoctors['dr-tariq-mahmood-siddiqui']}_${todayStr}_10:30 AM`,
      patientName: 'Muhammad Zubair Khan',
      phone: '0300-2345678',
      email: 'zubair.khan@example.com',
      age: 54,
      gender: 'Male',
      reason: 'Routine blood pressure and seasonal fever checkup',
      status: 'Confirmed',
      source: 'web',
    },
    {
      reference: 'APT-20261013-1002',
      doctorId: createdDoctors['dr-ayesha-kamran'],
      serviceId: createdServices['pediatrics'],
      date: todayStr,
      timeSlot: '11:00 AM',
      activeSlotKey: `${createdDoctors['dr-ayesha-kamran']}_${todayStr}_11:00 AM`,
      patientName: 'Fatima Bibi (Child: Hamza)',
      phone: '0321-8765432',
      email: '',
      age: 4,
      gender: 'Male',
      reason: 'Childhood cough and vaccination review',
      status: 'Pending',
      source: 'chatbot',
    },
    {
      reference: 'APT-20261014-1003',
      doctorId: createdDoctors['dr-sanaullah-bhutto'],
      serviceId: createdServices['diabetes-bp-care'],
      date: tomorrowStr,
      timeSlot: '06:00 PM',
      activeSlotKey: `${createdDoctors['dr-sanaullah-bhutto']}_${tomorrowStr}_06:00 PM`,
      patientName: 'Abdul Jabbar Soomro',
      phone: '0333-4567890',
      email: 'aj.soomro@example.com',
      age: 62,
      gender: 'Male',
      reason: 'Fasting sugar review and diet adjustment',
      status: 'Pending',
      source: 'web',
    },
  ];

  for (const apt of sampleAppointments) {
    await prisma.appointment.upsert({
      where: { reference: apt.reference },
      update: apt,
      create: apt,
    });
  }

  // Sample contact message & chat lead
  const msgCount = await prisma.contactMessage.count();
  if (msgCount === 0) {
    await prisma.contactMessage.create({
      data: {
        name: 'Salman Ahmed',
        phone: '0345-2112233',
        email: 'salman.ahmed@example.com',
        subject: 'Lab Test Inquiry',
        message: 'Assalam-o-Alaikum, do you offer home blood sample collection in Clifton Block 4 for elderly patients?',
        isRead: false,
      },
    });
  }

  const leadCount = await prisma.chatLead.count();
  if (leadCount === 0) {
    await prisma.chatLead.createMany({
      data: [
        {
          name: 'Mrs. Rukhsana',
          phone: '0312-9988776',
          type: 'lab_report',
          details: 'CBC & HbA1c Test Report request',
          locale: 'ur',
          status: 'New',
        },
        {
          name: 'Ghulam Mustafa',
          phone: '0301-5544332',
          type: 'callback',
          details: 'Requested reception callback regarding ultrasound timings',
          locale: 'sd',
          status: 'New',
        },
      ],
    });
  }

  console.log('✅ Seed completed successfully: 8 services, 6 doctors, 3 appointments, and sample leads created.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
