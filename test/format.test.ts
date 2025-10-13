import { describe, it, expect } from "vitest";
import { format } from "../src";

describe("format", () => {
  it("formats Amharic with time", () => {
    const s = format(
      { year: 2017, month: 1, day: 1, hour: 9, minute: 5, second: 3 },
      { locale: "am" }
    );
    // Month 1 → Meskerem
    expect(s).toContain("መስከረም");
    expect(s).toContain("09:05:03");
  });

  it("formats Oromo with time", () => {
    const s = format(
      { year: 2017, month: 2, day: 5, hour: 14, minute: 30, second: 0 },
      { locale: "om" }
    );
    // Month 2 → Onkololeessa
    expect(s).toContain("Onkololeessa");
    expect(s).toContain("14:30:00");
  });

  it("formats Somali with time", () => {
    const s = format(
      { year: 2017, month: 3, day: 10, hour: 0, minute: 0, second: 0 },
      { locale: "so" }
    );
    // Month 3 → Noofembar
    expect(s).toContain("Noofembar");
    expect(s).toContain("00:00:00");
  });

  it("formats English with time", () => {
    const s = format(
      { year: 2017, month: 1, day: 1, hour: 9, minute: 5, second: 3 },
      { locale: "en" }
    );
    // Month 1 → September (Ethiopian calendar order)
    expect(s).toContain("September");
    expect(s).toContain("09:05:03");
  });

  it("formats English with default time when missing", () => {
    const s = format({ year: 2017, month: 3, day: 10 }, { locale: "en" });
    // Month 3 → November (Ethiopian calendar order)
    expect(s).toContain("November");
    expect(s).toContain("00:00:00"); // default time
  });

  it("formats all locales with single-digit day and month", () => {
    const locales: ("en" | "am" | "om" | "so")[] = ["en", "am", "om", "so"];
    locales.forEach((locale) => {
      const s = format({ year: 2025, month: 1, day: 5 }, { locale });
      expect(s).toMatch(/\d{2}:\d{2}:\d{2}/); // default time applied
    });
  });
});
