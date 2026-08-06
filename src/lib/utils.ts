import { format, parseISO, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';

const ARABIC_DAY_NAMES = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** Returns Arabic day name derived from a date string YYYY-MM-DD */
export function getDayOfWeek(dateStr: string): string {
  const date = parseISO(dateStr);
  return ARABIC_DAY_NAMES[getDay(date)];
}

/** Formats date as "الاثنين، 12 يناير 2026" */
export function formatArabicDate(dateStr: string): string {
  const date = parseISO(dateStr);
  const dayName = ARABIC_DAY_NAMES[getDay(date)];
  const day = date.getDate();
  const month = ARABIC_MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}، ${day} ${month} ${year}`;
}

/** Formats date as "12 يناير 2026" (no day name) */
export function formatArabicDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  const day = date.getDate();
  const month = ARABIC_MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Returns Arabic month + year string, e.g. "يناير 2026" */
export function getArabicMonthYear(dateStr: string): string {
  const date = parseISO(dateStr);
  return `${ARABIC_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** Returns month key "YYYY-MM" for grouping */
export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/** Formats time as-is or returns "وقت غير محدد" */
export function formatTime(time: string | null): string {
  if (!time || time.trim() === '') return 'وقت غير محدد';
  return time;
}

/** Parses CSV text into an array of objects using headers from first row */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

/** Returns today's date as YYYY-MM-DD */
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Formats a number as currency with ₪ symbol */
export function formatPrice(num: number | null, text: string | null): string {
  if (text) return text;
  if (num != null) return `${num.toLocaleString('ar')} ₪`;
  return '—';
}

/** Formats phone number ensuring +961 country code for Lebanese numbers */
export function formatPhone(phone: string | null | undefined): string | null {
  if (!phone || !phone.trim()) return null;
  let trimmed = phone.trim();

  // If already starts with '+', return as is
  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  // If starts with country code 961
  if (digits.startsWith('961')) {
    const local = digits.substring(3);
    if (local.startsWith('3') && local.length === 7) {
      return `+961 3 ${local.slice(1, 4)} ${local.slice(4)}`;
    }
    if (local.length === 8) {
      return `+961 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
    }
    return `+${digits}`;
  }

  // Local 8-digit starting with 03 (e.g. 03123456 -> +961 3 123 456)
  if (digits.startsWith('03') && digits.length === 8) {
    const rest = digits.slice(2);
    return `+961 3 ${rest.slice(0, 3)} ${rest.slice(3)}`;
  }

  // Local number starting with 0 (e.g. 070123456 -> +961 70 123 456)
  if (digits.startsWith('0') && digits.length === 9) {
    const rest = digits.slice(1);
    return `+961 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  }

  // Local 8-digit starting with 70, 71, 76, 78, 79, 81, etc.
  if (digits.length === 8) {
    return `+961 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  // Local 7-digit starting with 3 (e.g. 3123456 -> +961 3 123 456)
  if (digits.length === 7 && digits.startsWith('3')) {
    return `+961 3 ${digits.slice(1, 4)} ${digits.slice(4)}`;
  }

  // Fallback: prepend +961
  return `+961 ${trimmed}`;
}

/** Clean phone number and generate WhatsApp click-to-chat URL */
export function getWhatsAppUrl(phone: string | null | undefined): string | null {
  if (!phone || !phone.trim()) return null;
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (!cleaned) return null;

  if (!cleaned.startsWith('961')) {
    if (cleaned.startsWith('03') && cleaned.length === 8) {
      cleaned = '9613' + cleaned.slice(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = '961' + cleaned.slice(1);
    } else if (cleaned.length === 8 || cleaned.length === 7) {
      cleaned = '961' + cleaned;
    }
  }

  return `https://wa.me/${cleaned}`;
}

export { format, parseISO, ar };

