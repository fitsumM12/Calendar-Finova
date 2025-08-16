// cspell:ignore Pagume
export type EthiopicDate = {
  year: number; // Ethiopian year (EC)
  month: number; // 1..13 (13 = Pagume)
  day: number;   // 1..30 (Pagume 1..5/6)
};

export type Locale = "am" | "om" | "so" | "en";

export interface FormatOptions {
  locale?: Locale;
  pattern?: string; // e.g. "EEE, dd MMM yyyy EC"
  weekday?: "short" | "long" | "narrow";
}