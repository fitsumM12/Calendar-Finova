import { describe, it, expect } from "vitest";
import { format } from "../src";

describe("format", () => {
  it("formats Amharic with time", () => {
    const s = format({ year: 2017, month: 1, day: 1, hour: 9, minute: 5, second: 3 }, { locale: "am" });
    expect(s).toContain("መስከረም");
    expect(s).toContain("09:05:03");
  });

  it("formats Oromo with time", () => {
    const s = format({ year: 2017, month: 2, day: 5, hour: 14, minute: 30, second: 0 }, { locale: "om" });
    expect(s).toContain("Onkololeessa");
    expect(s).toContain("14:30:00");
  });

  it("formats Somali with time", () => {
    const s = format({ year: 2017, month: 3, day: 10, hour: 0, minute: 0, second: 0 }, { locale: "so" });
    expect(s).toContain("Noofembar");
    expect(s).toContain("00:00:00");
  });

  it("formats English with default time when missing", () => {
    const s = format({ year: 2017, month: 3, day: 10 }, { locale: "en" });
    expect(s).toContain("Hidar"); // Correct month for month 3 in English
    expect(s).toContain("00:00:00"); // Default time
  });
});
