// src/convert.ts
import { EthiopicDate } from "./types";

/** Is Ethiopian leap year */
export function isEthiopianLeap(year: number): boolean {
  // Ethiopian leap years: every 4 years, year % 4 === 3
  return year % 4 === 3;
}

/** Convert Ethiopian → Gregorian */
export function ethiopicToGregorian(ed: EthiopicDate): Date {
  const jdn = ethioToJDN(ed.year, ed.month, ed.day);
  return JDNToGregorian(jdn);
}

/** Convert Gregorian → Ethiopian */
export function gregorianToEthiopic(date: Date): EthiopicDate {
  const jdn = gregorianToJDN(date);
  return JDNToEthio(jdn);
}

// --- Helpers ---

/** Convert Ethiopic date to Julian Day Number */
function ethioToJDN(year: number, month: number, day: number): number {
  const JD_EPOCH_OFFSET = 1724221; // Correct JDN for 1 Meskerem 1
  return (
    JD_EPOCH_OFFSET +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    (day - 1)
  );
}

/** Convert Julian Day Number to Ethiopic date */
function JDNToEthio(jdn: number): EthiopicDate {
  const JD_EPOCH_OFFSET = 1724221;
  const r = (jdn - JD_EPOCH_OFFSET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const year =
    4 * Math.floor((jdn - JD_EPOCH_OFFSET) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460) +
    1; // Ethiopic year starts at 1

  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  return { year, month, day };
}

/** Convert Gregorian date to Julian Day Number */
function gregorianToJDN(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();

  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;

  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

/** Convert Julian Day Number to Gregorian date */
function JDNToGregorian(jdn: number): Date {
  let a = jdn + 32044;
  let b = Math.floor((4 * a + 3) / 146097);
  let c = a - Math.floor((146097 * b) / 4);

  let d = Math.floor((4 * c + 3) / 1461);
  let e = c - Math.floor((1461 * d) / 4);
  let m = Math.floor((5 * e + 2) / 153);

  let day = e - Math.floor((153 * m + 2) / 5) + 1;
  let month = m + 3 - 12 * Math.floor(m / 10);
  let year = 100 * b + d - 4800 + Math.floor(m / 10);

  return new Date(Date.UTC(year, month - 1, day));
}
