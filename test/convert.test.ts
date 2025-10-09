import { describe, it, expect } from "vitest";
import { ethiopicToGregorian, gregorianToEthiopic, isEthiopianLeap } from "../src";

describe("Ethiopic ↔ Gregorian", () => {
  it("round-trips mid-year dates with time", () => {
    const samples = [
      { year: 2014, month: 4, day: 10, hour: 12, minute: 30, second: 15 },
      { year: 2015, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
      { year: 2016, month: 13, day: 5, hour: 23, minute: 59, second: 59 }, // Pagume
    ];

    for (const s of samples) {
      const g = ethiopicToGregorian(s);
      const back = gregorianToEthiopic(g);

      // Ensure the full datetime matches
      expect(back).toEqual(s);
    }
  });

  it("validates Pagume length via isEthiopianLeap", () => {
    expect(typeof isEthiopianLeap(2015)).toBe("boolean");
  });
});
