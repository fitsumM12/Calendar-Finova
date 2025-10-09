import { EthiopicDate } from "./types";
import {
  meskerem1Gregorian,
  toUTCDate,
  addDaysUTC,
  diffDaysUTC,
} from "./utils";

/**
 * Convert an Ethiopian date → Gregorian Date.
 */
export function ethiopicToGregorian(ed: EthiopicDate): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = ed;

  const { y, m, d } = meskerem1Gregorian(year);
  const newYear = toUTCDate(y, m, d);
  const offset = (month - 1) * 30 + (day - 1);

  const gregDate = addDaysUTC(newYear, offset);
  gregDate.setUTCHours(hour, minute, second, 0);

  return gregDate;
}

/**
 * Convert a Gregorian Date → Ethiopian date.
 */
export function gregorianToEthiopic(date: Date): EthiopicDate {
  const gy = date.getUTCFullYear();
  const gm = date.getUTCMonth() + 1;
  const gd = date.getUTCDate();

  const etYear = gy - 8 + (gm > 9 || (gm === 9 && gd >= 11) ? 1 : 0);
  const { y, m, d } = meskerem1Gregorian(etYear);
  const newYear = toUTCDate(y, m, d);

  const daysSince = diffDaysUTC(date, newYear);
  const month = Math.floor(daysSince / 30) + 1;
  const day = (daysSince % 30) + 1;

  return {
    year: etYear,
    month,
    day,
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}
