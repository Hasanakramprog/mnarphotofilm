import { format, parseISO, getDay } from 'date-fns';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Returns English day name derived from a date string YYYY-MM-DD */
export function getDayOfWeek(dateStr: string): string {
  const date = parseISO(dateStr);
  return DAY_NAMES[getDay(date)];
}

/** Formats date as "Monday, 12 January 2026" */
export function formatArabicDate(dateStr: string): string {
  return formatDate(dateStr);
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  const dayName = DAY_NAMES[getDay(date)];
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

/** Formats date as "12 January 2026" (no day name) */
export function formatArabicDateShort(dateStr: string): string {
  return formatDateShort(dateStr);
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Returns English month + year string, e.g. "January 2026" */
export function getArabicMonthYear(dateStr: string): string {
  return getMonthYear(dateStr);
}

export function getMonthYear(dateStr: string): string {
  const date = parseISO(dateStr);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** Returns month key "YYYY-MM" for grouping */
export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/** Formats time as-is or returns "Time TBD" */
export function formatTime(time: string | null): string {
  if (!time || !time.trim()) return 'Time TBD';
  return time;
}

/** Parses CSV text into an array of objects using headers from first row */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
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

/** Formats a number as currency */
export function formatPrice(num: number | null, text: string | null): string {
  if (text) return text;
  if (num != null) return `$${num.toLocaleString('en')}`;
  return '—';
}

/** Formats phone number ensuring +961 country code for Lebanese numbers */
export function formatPhone(phone: string | null | undefined): string | null {
  if (!phone || !phone.trim()) return null;
  let trimmed = phone.trim();

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

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

  if (digits.startsWith('03') && digits.length === 8) {
    const rest = digits.slice(2);
    return `+961 3 ${rest.slice(0, 3)} ${rest.slice(3)}`;
  }

  if (digits.startsWith('0') && digits.length === 9) {
    const rest = digits.slice(1);
    return `+961 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  }

  if (digits.length === 8) {
    return `+961 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  if (digits.length === 7 && digits.startsWith('3')) {
    return `+961 3 ${digits.slice(1, 4)} ${digits.slice(4)}`;
  }

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

export { format, parseISO };
