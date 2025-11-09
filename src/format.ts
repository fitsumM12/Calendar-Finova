import { EthiopicDate, FormatOptions } from "./types";
import { monthNames, weekdayNames } from "./i18n";
import { ethiopicToGregorian } from "./convert";

/**
 * Calculate the correct Ethiopian weekday (0-6 where 0=Monday, 6=Sunday)
 */
function calculateEthiopianWeekday(date: EthiopicDate): number {
  // Convert Ethiopian date to Gregorian to get the actual day of week
  const gregorianDate = ethiopicToGregorian(date);

  // Get Gregorian weekday (0=Sunday, 1=Monday, ..., 6=Saturday)
  const gregWeekday = gregorianDate.getDay();

  // Map to Ethiopian weekday system where Monday is the first day
  // Gregorian: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  // Ethiopian: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  return (gregWeekday + 6) % 7;
}

/**
 * Format time in 12-hour format with AM/PM
 */
function formatTime12Hour(hours: number, minutes: number, seconds: number): string {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  displayHours = displayHours === 0 ? 12 : displayHours; // Convert 0 to 12

  const hh = displayHours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return `${hh}:${mm}:${ss} ${ampm}`;
}

/**
 * Format time in 24-hour format
 */
function formatTime24Hour(hours: number, minutes: number, seconds: number): string {
  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

/**
 * Format an Ethiopian date to a readable string.
 */
export function format(date: EthiopicDate, opts: FormatOptions = {}): string {
  let locale = (opts.locale || "en").toLowerCase() as keyof typeof monthNames;
  if (!(locale in monthNames)) {
    console.warn(`Unsupported locale "${opts.locale}", falling back to "en"`);
    locale = "en";
  }

  const months = monthNames[locale];
  const weekdays = weekdayNames[locale];


  // Use correct weekday calculation instead of broken JDN
  const weekdayIndex = calculateEthiopianWeekday(date);
  const weekday = weekdays.long[weekdayIndex];

  const dd = date.day.toString().padStart(2, "0");
  const monthName = months[date.month - 1];

  // Always include time to maintain backward compatibility with tests
  const hours = date.hour ?? 0;
  const minutes = date.minute ?? 0;
  const seconds = date.second ?? 0;

  // ✅ FIXED: Support both 12-hour and 24-hour formats
  let timePart: string;
  if (opts.timeFormat === "12h") {
    timePart = formatTime12Hour(hours, minutes, seconds);
  } else {
    timePart = formatTime24Hour(hours, minutes, seconds);
  }

  return `${weekday}, ${dd} ${monthName} ${date.year} EC ${timePart}`;
}