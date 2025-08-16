// src/format.ts
import { EthiopicDate } from "./types";
import { monthNames, weekdayNames } from "./i18n";

export function format(date: EthiopicDate, opts: { locale: "am" | "om" | "so" }) {
  const { locale } = opts;
  const months = monthNames[locale];
  const weekdays = weekdayNames[locale];

  // Rough weekday calc from JDN
  const jdn = (date.year - 1) * 365 + Math.floor(date.year / 4) + (date.month - 1) * 30 + date.day;
  const weekday = weekdays.long[jdn % 7];

  return `${weekday}, ${date.day.toString().padStart(2, "0")} ${months[date.month - 1]} ${date.year} EC`;
}
