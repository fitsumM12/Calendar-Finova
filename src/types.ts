// cspell:ignore Pagume

/**
 * Represents a date in the Ethiopian calendar.
 */
export type EthiopicDate = {
  /** Ethiopian year (E.C.) */
  year: number;

  /** Ethiopian month (1–13; 13 = Pagume) */
  month: number;

  /** Ethiopian day (1–30; Pagume has 1–5 or 1–6) */
  day: number;

  /** Optional time: hour (0–23) */
  hour?: number;

  /** Optional time: minute (0–59) */
  minute?: number;

  /** Optional time: second (0–59) */
  second?: number;
};

/**
 * Supported locales for month and weekday names.
 */
export type Locale = "am" | "om" | "so" | "en";

/**
 * Options for formatting Ethiopian dates.
 */
export interface FormatOptions {
  /** Locale for month and weekday names (defaults to "en"). */
  locale?: Locale;

  /** Optional custom format pattern. Example: "EEE, dd MMM yyyy EC". */
  pattern?: string;

  /** Weekday name style. */
  weekday?: "short" | "long" | "narrow";
}
