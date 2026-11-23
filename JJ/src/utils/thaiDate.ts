// src/utils/thaiDate.ts

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAYS = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats YYYY-MM-DD or Date object into Thai Buddhist Era format
 * Example: 2026-11-23 -> "23 พ.ย. 2569"
 */
export function formatThaiDate(
  dateInput: string | Date | undefined,
  options?: {
    showDayOfWeek?: boolean;
    fullMonth?: boolean;
    showYear?: boolean;
  }
): string {
  if (!dateInput) return '-';
  
  let date: Date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return '-';

  const day = date.getDate();
  const monthIdx = date.getMonth();
  const yearBE = date.getFullYear() + 543;
  const dayOfWeek = THAI_DAYS[date.getDay()];
  const monthName = options?.fullMonth ? THAI_MONTHS_FULL[monthIdx] : THAI_MONTHS_SHORT[monthIdx];

  const prefix = options?.showDayOfWeek ? `${dayOfWeek}ที่ ` : '';
  const yearStr = options?.showYear !== false ? ` ${yearBE}` : '';

  return `${prefix}${day} ${monthName}${yearStr}`;
}

/**
 * Format currency in Thai Baht (฿)
 */
export function formatThaiCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '฿0';
  return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/**
 * Calculate working hours between startTime and endTime (format HH:mm)
 */
export function calculateWorkHours(startTime: string, endTime: string): { hours: number; formatted: string } {
  if (!startTime || !endTime) {
    return { hours: 0, formatted: '0 ชม.' };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return { hours: 0, formatted: '0 ชม.' };
  }

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  // Handle overnight shift (e.g. 22:00 to 06:00)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  const hours = parseFloat((diffMinutes / 60).toFixed(2));

  const displayH = Math.floor(diffMinutes / 60);
  const displayM = diffMinutes % 60;

  let formatted = '';
  if (displayH > 0) formatted += `${displayH} ชม. `;
  if (displayM > 0 || displayH === 0) formatted += `${displayM} นาที`;

  return { hours, formatted: formatted.trim() };
}
