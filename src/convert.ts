import { EthiopicDate } from "./types";
import {
  meskerem1Gregorian,
  toUTCDate,
  addDaysUTC,
  diffDaysUTC,
} from "./utils";

/**
 * Convert Ethiopian time → Gregorian time (East African Time)
 * Ethiopian 00:00 = Gregorian 06:00 (EAT)
 */
function ethiopianToGregorianTime(
  ethioHour: number,
  ethioMinute: number,
  ethioSecond: number
): { hour: number; minute: number; second: number } {
  const gregHour = (ethioHour + 6) % 24;
  return { hour: gregHour, minute: ethioMinute, second: ethioSecond };
}

/**
 * Convert Gregorian time → Ethiopian time (East African Time)
 * Gregorian 06:00 = Ethiopian 00:00 (EAT)
 */
function gregorianToEthiopianTime(
  gregHour: number,
  gregMinute: number,
  gregSecond: number
): { hour: number; minute: number; second: number } {
  const ethioHour = (gregHour + 18) % 24; // equivalent to -6 mod 24
  return { hour: ethioHour, minute: gregMinute, second: gregSecond };
}

/**
 * Convert Ethiopian date → Gregorian Date (in East African Time)
 */
export function ethiopicToGregorian(ed: EthiopicDate): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = ed;

  // Get Ethiopian New Year’s corresponding Gregorian date (UTC)
  const { y, m, d } = meskerem1Gregorian(year);
  const newYearUTC = toUTCDate(y, m, d);
  const offset = (month - 1) * 30 + (day - 1);
  const gregDateUTC = addDaysUTC(newYearUTC, offset);

  // Convert Ethiopian time → Gregorian time (EAT)
  const { hour: gHour, minute: gMin, second: gSec } =
    ethiopianToGregorianTime(hour, minute, second);

  // Add +3 hour offset to convert from EAT → UTC
  gregDateUTC.setUTCHours(gHour - 3, gMin, gSec, 0);

  return gregDateUTC;
}

/**
 * Convert Gregorian Date → Ethiopian date (East African Time)
 */
export function gregorianToEthiopic(date: Date): EthiopicDate {
  // Convert UTC → East African Time (UTC+3)
  const local = new Date(date.getTime() + 3 * 60 * 60 * 1000);

  const gy = local.getUTCFullYear();
  const gm = local.getUTCMonth() + 1;
  const gd = local.getUTCDate();
  const gh = local.getUTCHours();
  const gmin = local.getUTCMinutes();
  const gsec = local.getUTCSeconds();

  const etYear = gy - 8 + (gm > 9 || (gm === 9 && gd >= 11) ? 1 : 0);
  const { y, m, d } = meskerem1Gregorian(etYear);
  const newYear = toUTCDate(y, m, d);

  const daysSince = diffDaysUTC(local, newYear);
  const month = Math.floor(daysSince / 30) + 1;
  const day = (daysSince % 30) + 1;

  // Convert Gregorian → Ethiopian time (EAT)
  const { hour: ethHour, minute: ethMin, second: ethSec } =
    gregorianToEthiopianTime(gh, gmin, gsec);

  return {
    year: etYear,
    month,
    day,
    hour: ethHour,
    minute: ethMin,
    second: ethSec,
  };
}
