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

  /** Hour (0–23) */
  hour: number;

  /** Minute (0–59) */
  minute: number;

  /** Second (0–59) */
  second: number;
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

  /** Include time in formatting (default: false) */
  includeTime?: boolean;

  /** Time format style (12h or 24h) */
  timeFormat?: "12h" | "24h";
}

/**
 * Ethiopian Date-Time Picker Options
 */
export interface EthiopianDateTimePickerOptions {
  locale?: Locale;
  minDate?: Date;
  maxDate?: Date;
  showGregorian?: boolean;
  showTime?: boolean;
  timeFormat?: "12h" | "24h";
  autoClose?: boolean;
  defaultTime?: {
    hour: number;
    minute: number;
    second: number;
  };
}

/**
 * Ethiopian Date-Time Picker Instance
 */
export interface EthiopianDateTimePickerInstance {
  setDateTime: (date: Date | EthiopicDate) => void;
  getDateTime: () => EthiopicDate;
  getGregorianDateTime: () => Date;
  destroy: () => void;
}