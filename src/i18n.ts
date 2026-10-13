import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { getClinicName } from './config/clinic';
import { locales, type Locale } from './i18n/routing';

function applyClinicConfigToMessages(obj: any, loc: Locale): any {
  const clinicName = getClinicName(loc);
  if (typeof obj === 'string') {
    return obj
      .replace(/MediCare Hub/g, clinicName)
      .replace(/میڈی کیئر ہب/g, clinicName)
      .replace(/ميڊي ڪيئر هب/g, clinicName);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => applyClinicConfigToMessages(item, loc));
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = applyClinicConfigToMessages(v, loc);
    }
    return out;
  }
  return obj;
}

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const rawMessages = (await import(`../messages/${locale}.json`)).default;

  return {
    messages: applyClinicConfigToMessages(rawMessages, locale as Locale),
  };
});
