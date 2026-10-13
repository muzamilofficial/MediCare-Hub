export const locales = ['en', 'ur', 'sd'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isRtlLocale(locale: string): boolean {
  return locale === 'ur' || locale === 'sd';
}
