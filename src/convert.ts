import { EthiopicDate } from "./types";
import {
  meskerem1Gregorian,
  toUTCDate,
  addDaysUTC,
  diffDaysUTC,
} from "./utils";

/**
 * Convert Ethiopian time to Gregorian time
 * Ethiopian day starts at 6:00 AM Gregorian (00:00 Ethiopian)
 */
function ethiopianToGregorianTime(ethioHour: number, ethioMinute: number, ethioSecond: number): {
  hour: number;
  minute: number;
  second: number;
} {
  // Ethiopian 00:00 = Gregorian 06:00
  // Ethiopian 12:00 = Gregorian 18:00
  // Ethiopian 18:00 = Gregorian 00:00 (next day)
  let gregHour = (ethioHour + 6) % 24;
  return {
    hour: gregHour,
    minute: ethioMinute,
    second: ethioSecond
  };
}

/**
 * Convert Gregorian time to Ethiopian time
 * Gregorian 06:00 AM = Ethiopian 00:00
 */
function gregorianToEthiopianTime(gregHour: number, gregMinute: number, gregSecond: number): {
  hour: number;
  minute: number;
  second: number;
} {
  // Gregorian 06:00 = Ethiopian 00:00
  // Gregorian 18:00 = Ethiopian 12:00  
  // Gregorian 00:00 = Ethiopian 18:00 (previous day)
  let ethioHour = (gregHour + 18) % 24; // +18 is equivalent to -6 modulo 24
  return {
    hour: ethioHour,
    minute: gregMinute,
    second: gregSecond
  };
}

/**
 * Convert an Ethiopian date → Gregorian Date.
 */
export function ethiopicToGregorian(ed: EthiopicDate): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = ed;

  const { y, m, d } = meskerem1Gregorian(year);
  const newYear = toUTCDate(y, m, d);
  const offset = (month - 1) * 30 + (day - 1);

  const gregDate = addDaysUTC(newYear, offset);
  
  // ✅ FIXED: Convert Ethiopian time to Gregorian time
  const { hour: gregHour, minute: gregMinute, second: gregSecond } = 
    ethiopianToGregorianTime(hour, minute, second);
  
  gregDate.setUTCHours(gregHour, gregMinute, gregSecond, 0);

  return gregDate;
}

/**
 * Convert a Gregorian Date → Ethiopian date.
 */
export function gregorianToEthiopic(date: Date): EthiopicDate {
  // Use UTC to avoid timezone issues
  const gy = date.getUTCFullYear();
  const gm = date.getUTCMonth() + 1;
  const gd = date.getUTCDate();
  const gh = date.getUTCHours();
  const gmin = date.getUTCMinutes();
  const gsec = date.getUTCSeconds();

  const etYear = gy - 8 + (gm > 9 || (gm === 9 && gd >= 11) ? 1 : 0);
  const { y, m, d } = meskerem1Gregorian(etYear);
  const newYear = toUTCDate(y, m, d);

  const daysSince = diffDaysUTC(date, newYear);
  const month = Math.floor(daysSince / 30) + 1;
  const day = (daysSince % 30) + 1;

  // ✅ FIXED: Convert Gregorian time to Ethiopian time
  const { hour: ethioHour, minute: ethioMinute, second: ethioSecond } = 
    gregorianToEthiopianTime(gh, gmin, gsec);

  return {
    year: etYear,
    month,
    day,
    hour: ethioHour, // ✅ Now this will be correct Ethiopian time
    minute: ethioMinute,
    second: ethioSecond,
  };
}