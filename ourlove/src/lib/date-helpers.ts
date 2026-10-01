const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month] ?? '';
}

export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] ?? '';
}

export function getDayNameShort(dayIndex: number): string {
  return DAY_NAMES_SHORT[dayIndex] ?? '';
}

/** Format a date like "Friday, Oct 18, 2024" */
export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = getDayName(getMondayBasedDay(d));
  const month = getMonthName(d.getMonth()).slice(0, 3);
  return `${dayName}, ${month} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Format a date like "Oct 18, 2024" */
export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const month = getMonthName(d.getMonth()).slice(0, 3);
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Format time from "19:30" to "7:30 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (h === undefined || m === undefined) return time;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Get Monday-based day index (0=Mon, 6=Sun) */
export function getMondayBasedDay(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

/** Get all days to display in a month grid (Mon-Sun, 6 weeks) */
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = getMondayBasedDay(firstDay);

  const days: Date[] = [];
  const startDate = new Date(year, month, 1 - startOffset);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  return days;
}

/** Format date to ISO date string YYYY-MM-DD */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Check if two dates are the same day */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

/** Check if a date string is today */
export function isToday(dateStr: string): boolean {
  return isSameDay(new Date(dateStr + 'T00:00:00'), new Date());
}

/** Get seasonal chip text for a month */
export function getSeasonalChip(month: number): string {
  const chips: Record<number, string> = {
    0: 'Month of Fresh Starts 🌟',
    1: 'Month of Sweet Love 💕',
    2: 'Month of Spring Blooms 🌸',
    3: 'Month of April Showers 🌧️',
    4: 'Month of Flower Fields 🌺',
    5: 'Month of Sunny Days ☀️',
    6: 'Month of Adventures 🏖️',
    7: 'Month of Starry Nights ✨',
    8: 'Month of Golden Leaves 🍂',
    9: 'Month of Cozy Sweaters 🧣',
    10: 'Month of Gratitude 🦃',
    11: 'Month of Magic & Joy 🎄',
  };
  return chips[month] ?? '';
}

/** Calculate days between two dates */
export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
}

/** Check if dateStr falls within a range [start, end] inclusive */
export function isDateInRange(dateStr: string, startStr: string, endStr?: string): boolean {
  if (!endStr) return dateStr === startStr;
  return dateStr >= startStr && dateStr <= endStr;
}
