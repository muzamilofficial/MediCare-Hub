import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-US')}`;
}

/**
 * Returns YYYY-MM-DD in Asia/Karachi timezone (Western digits),
 * optionally offset by `offsetDays`.
 */
export function getKarachiDateString(offsetDays: number = 0, baseDate?: Date): string {
  const d = baseDate ? new Date(baseDate.getTime()) : new Date();
  if (offsetDays !== 0) {
    d.setUTCDate(d.getUTCDate() + offsetDays);
  }
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

export function getDayNameFromDateString(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dateObj.getUTCDay()] || 'Monday';
}

export function generateBookingReference(dateStr: string): string {
  const compactDate = dateStr.replace(/-/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `APT-${compactDate}-${randomDigits}`;
}

export function localizeField<T extends Record<string, any>>(
  item: T,
  field: string,
  locale: string
): string {
  if (locale === 'ur' && item[`${field}Ur`]) {
    return item[`${field}Ur`];
  }
  if (locale === 'sd' && item[`${field}Sd`]) {
    return item[`${field}Sd`];
  }
  return item[field] || '';
}
