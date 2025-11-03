import { EthiopicDate } from "./types";
import {
  meskerem1Gregorian,
  toUTCDate,
  addDaysUTC,
  diffDaysUTC,
} from "./utils";

/**
 * Convert Ethiopian time → Gregorian time (EAT)
 * Ethiopian 00:00 = Gregorian 06:00
 */
function ethiopianToGregorianTime(
  ethioHour: number,
  ethioMinute: number,
  ethioSecond: number
): { hour: number; minute: number; second: number; ampm: "AM" | "PM" } {
  let gregHour = (ethioHour + 6) % 24;
  const ampm = gregHour >= 12 ? "PM" : "AM";
  gregHour = gregHour % 12 === 0 ? 12 : gregHour % 12;
  return { hour: gregHour, minute: ethioMinute, second: ethioSecond, ampm };
}

/**
 * Convert Gregorian time → Ethiopian time (EAT)
 * Gregorian 06:00 = Ethiopian 00:00
 */
function gregorianToEthiopianTime(
  gregHour: number,
  gregMinute: number,
  gregSecond: number
): { hour: number; minute: number; second: number; ampm: "AM" | "PM" } {
  let ethioHour = (gregHour + 18) % 24; // equivalent to -6 mod 24
  const ampm = ethioHour >= 12 ? "PM" : "AM";
  ethioHour = ethioHour % 12 === 0 ? 12 : ethioHour % 12;
  return { hour: ethioHour, minute: gregMinute, second: gregSecond, ampm };
}

/**
 * Convert Ethiopian date → Gregorian Date (in EAT)
 */
export function ethiopicToGregorian(ed: EthiopicDate): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0, ampm = '' } = ed;
  const { y, m, d } = meskerem1Gregorian(year);
  const newYearUTC = toUTCDate(y, m, d);
  const offset = (month - 1) * 30 + (day - 1);
  const gregDateUTC = addDaysUTC(newYearUTC, offset);

  const { hour: gHour, minute: gMin, second: gSec } =
    ethiopianToGregorianTime(hour, minute, second);

  // Convert EAT → UTC
  gregDateUTC.setUTCHours(gHour - 3, gMin, gSec, 0);
  return gregDateUTC;
}

/**
 * Convert Gregorian Date → Ethiopian date (EAT)
 */
export function gregorianToEthiopic(date: Date): EthiopicDate {
  const local = new Date(date.getTime() + 3 * 60 * 60 * 1000); // UTC+3

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

  const { hour: ethHour, minute: ethMin, second: ethSec } =
    gregorianToEthiopianTime(gh, gmin, gsec);

  return {
    year: etYear,
    month,
    day,
    hour: ethHour,
    minute: ethMin,
    second: ethSec,
    ampm: ethHour >= 12 ? "PM" : "AM",
  };
}
