/**
 * CENTRALIZED CLINIC CONFIGURATION
 * =====================================
 * Edit all clinic-wide placeholders, contact details, timings, statistics,
 * map coordinates, and social links in this single file. Changes here automatically
 * update the Header, Footer, Home page, Contact page, Chatbot, and SEO JSON-LD.
 */

export interface ClinicConfig {
  name: string;
  nameUr: string;
  nameSd: string;
  tagline: {
    en: string;
    ur: string;
    sd: string;
  };
  city: {
    en: string;
    ur: string;
    sd: string;
  };
  address: {
    en: string;
    ur: string;
    sd: string;
  };
  phone: string;
  phoneClean: string;
  emergencyPhone: string;
  emergencyRescue: string;
  whatsapp: string;
  whatsappNumberClean: string;
  email: string;
  timings: {
    summary: {
      en: string;
      ur: string;
      sd: string;
    };
    weekdays: {
      days: { en: string; ur: string; sd: string };
      hours: string;
    };
    sunday: {
      days: { en: string; ur: string; sd: string };
      hours: string;
    };
    offDays: number[]; // 0 = Sunday, etc. Empty array if open 7 days; Sunday has shorter hours
  };
  stats: {
    yearsExperience: number;
    happyPatients: number;
    specialistDoctors: number;
    patientRating: number;
  };
  labReportHours: number;
  map: {
    lat: number;
    lng: number;
    embedUrl: string;
    directionsUrl: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  whatsappDefaultMessages: {
    en: string;
    ur: string;
    sd: string;
  };
  founder: {
    name: { en: string; ur: string; sd: string };
    title: { en: string; ur: string; sd: string };
    qualification: string;
    photo: string;
  };
}

export const clinicConfig: ClinicConfig = {
  name: 'MediCare Hub',
  nameUr: 'میڈی کیئر ہب',
  nameSd: 'ميڊي ڪيئر هب',
  tagline: {
    en: 'Caring for Your Family, Every Day',
    ur: 'آپ کے خاندان کی صحت کا خیال، ہر دن',
    sd: 'توهان جي خاندان جي صحت جو خيال، هر روز',
  },
  city: {
    en: 'Karachi, Sindh',
    ur: 'کراچی، سندھ',
    sd: 'ڪراچي، سنڌ',
  },
  address: {
    en: 'Suite 203, Al-Noor Medical Plaza, Clifton Block 5, Karachi 75600',
    ur: 'سویٹ 203، النور میڈیکل پلازہ، کلفٹن بلاک 5، کراچی 75600',
    sd: 'سوئيٽ 203، النور ميڊيڪل پلازه، ڪلفٽن بلاڪ 5، ڪراچي 75600',
  },
  phone: '+92 21 3500 0000',
  phoneClean: '+922135000000',
  emergencyPhone: '+92 21 3500 0000',
  emergencyRescue: '1122',
  whatsapp: '+92 328 8285894',
  whatsappNumberClean: '923288285894',
  email: 'muzamilelahi798@gmail.com',
  timings: {
    summary: {
      en: 'Mon-Sat 9:00 AM - 9:00 PM, Sun 10:00 AM - 2:00 PM',
      ur: 'پیر تا ہفتہ صبح 9:00 تا رات 9:00، اتوار صبح 10:00 تا دوپہر 2:00',
      sd: 'سومر کان ڇنڇر صبح 9:00 کان رات 9:00، آچر صبح 10:00 کان منجهند 2:00',
    },
    weekdays: {
      days: {
        en: 'Monday – Saturday',
        ur: 'پیر تا ہفتہ',
        sd: 'سومر کان ڇنڇر',
      },
      hours: '09:00 AM – 09:00 PM',
    },
    sunday: {
      days: {
        en: 'Sunday',
        ur: 'اتوار',
        sd: 'آچر',
      },
      hours: '10:00 AM – 02:00 PM',
    },
    offDays: [], // Clinic is open Mon-Sat (full) and Sunday (morning)
  },
  stats: {
    yearsExperience: 10,
    happyPatients: 15000,
    specialistDoctors: 8,
    patientRating: 4.8,
  },
  labReportHours: 6,
  map: {
    lat: 24.8138,
    lng: 67.0303,
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.3853497416645!2d67.0281!3d24.8138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33db500000001%3A0x1!2sClifton%20Block%205%2C%20Karachi!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Suite+203+Al-Noor+Medical+Plaza+Clifton+Block+5+Karachi+75600',
  },
  socials: {
    facebook: 'https://facebook.com/medicarehubpk',
    instagram: 'https://instagram.com/medicarehubpk',
    youtube: 'https://youtube.com/@medicarehubpk',
    whatsapp: 'https://wa.me/923288285894',
  },
  whatsappDefaultMessages: {
    en: 'Assalam-o-Alaikum! I would like to book an appointment or inquire about MediCare Hub services.',
    ur: 'السلام علیکم! میں میڈی کیئر ہب میں اپوائنٹمنٹ بک کروانا یا معلومات لینا چاہتا/چاہتی ہوں۔',
    sd: 'السلام عليڪم! مان ميڊي ڪيئر هب ۾ اپائنٽمينٽ بُڪ ڪرائڻ يا معلومات وٺڻ چاهيان ٿو/ٿي.',
  },
  founder: {
    name: {
      en: 'Prof. Dr. Tariq Mahmood Siddiqui',
      ur: 'پروفیسر ڈاکٹر طارق محمود صدیقی',
      sd: 'پروفيسر ڊاڪٽر طارق محمود صديقي',
    },
    title: {
      en: 'Founder & Chief Medical Director',
      ur: 'بانی اور چیف میڈیکل ڈائریکٹر',
      sd: 'باني ۽ چيف ميڊيڪل ڊائريڪٽر',
    },
    qualification: 'MBBS (Dow), FCPS (Medicine), FRCP (London)',
    photo: '/images/doctor-1.svg',
  },
};

export function getWhatsAppUrl(locale: string = 'en', customMessage?: string): string {
  const msg =
    customMessage ||
    clinicConfig.whatsappDefaultMessages[
      (locale as keyof typeof clinicConfig.whatsappDefaultMessages) || 'en'
    ] ||
    clinicConfig.whatsappDefaultMessages.en;
  return `https://wa.me/${clinicConfig.whatsappNumberClean}?text=${encodeURIComponent(msg)}`;
}

export function getClinicName(locale: string = 'en'): string {
  if (locale === 'ur') return clinicConfig.nameUr;
  if (locale === 'sd') return clinicConfig.nameSd;
  return clinicConfig.name;
}
