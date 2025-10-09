import { EthiopicDate, FormatOptions } from "./types";
import { monthNames, weekdayNames } from "./i18n";

/**
 * Format an Ethiopian date to a readable string.
 */
export function format(date: EthiopicDate, opts: FormatOptions = {}): string {
  const locale = opts.locale ?? "en";
  const months = monthNames[locale];
  const weekdays = weekdayNames[locale];

  // Rough weekday calculation
  const jdn =
    (date.year - 1) * 365 +
    Math.floor(date.year / 4) +
    (date.month - 1) * 30 +
    date.day;
  const weekday = weekdays.long[jdn % 7];

  const dd = date.day.toString().padStart(2, "0");
  const hh = (date.hour ?? 0).toString().padStart(2, "0");
  const mm = (date.minute ?? 0).toString().padStart(2, "0");
  const ss = (date.second ?? 0).toString().padStart(2, "0");

  return `${weekday}, ${dd} ${months[date.month - 1]} ${date.year} EC ${hh}:${mm}:${ss}`;
}
