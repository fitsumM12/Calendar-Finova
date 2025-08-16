export const isGregorianLeap = (year: number) => {
  // Gregorian rule
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/** Ethiopian year with 6th Pagume occurs when the ensuing Gregorian year is leap */
export const isEthiopianLeap = (ethiopianYear: number) => {
  const gyStart = ethiopianYear + 7; // EC year y starts in Gregorian year y+7
  return isGregorianLeap(gyStart + 1);
};

/**
 * Gregorian date of Ethiopian New Year (Meskerem 1) for EC year y
 * In 1900–2099 range, it's Sept 11, except Sept 12 if the following Gregorian year is leap.
 */
export const meskerem1Gregorian = (ethiopianYear: number): { y: number; m: number; d: number } => {
  const gy = ethiopianYear + 7; // Gregorian year where EC year starts
  const sepDay = isGregorianLeap(gy + 1) ? 12 : 11; // Enkutatash shifts one day later before G-leap
  return { y: gy, m: 9, d: sepDay }; // September = 9
};

export const toUTCDate = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

export const addDaysUTC = (date: Date, days: number) => {
  const nd = new Date(date.getTime());
  nd.setUTCDate(nd.getUTCDate() + days);
  return nd;
};

export const diffDaysUTC = (a: Date, b: Date) => {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / 86400000);
};