/**
 * Check if a Gregorian year is a leap year.
 */
export const isGregorianLeap = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Check if an Ethiopian year is a leap year.
 * Ethiopian year y is leap if the following Gregorian year (y + 8) is leap.
 */
export const isEthiopianLeap = (ethiopianYear: number): boolean => {
  const gregorianYearStart = ethiopianYear + 7;
  return isGregorianLeap(gregorianYearStart + 1);
};

/**
 * Gregorian date of Meskerem 1 (Ethiopian New Year) for EC year y.
 * In 1900–2099 range, it's Sept 11, except Sept 12 if the following G-year is leap.
 */
export const meskerem1Gregorian = (
  ethiopianYear: number
): { y: number; m: number; d: number } => {
  const gy = ethiopianYear + 7;
  const sepDay = isGregorianLeap(gy + 1) ? 12 : 11;
  return { y: gy, m: 9, d: sepDay };
};

/**
 * Create a UTC date.
 */
export const toUTCDate = (y: number, m: number, d: number): Date =>
  new Date(Date.UTC(y, m - 1, d));

/**
 * Add days to a UTC date.
 */
export const addDaysUTC = (date: Date, days: number): Date => {
  const nd = new Date(date.getTime());
  nd.setUTCDate(nd.getUTCDate() + days);
  return nd;
};

/**
 * Difference in days between two UTC dates (a - b).
 */
export const diffDaysUTC = (a: Date, b: Date): number => {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / 86400000);
};
