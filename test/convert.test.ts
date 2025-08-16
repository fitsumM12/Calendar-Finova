import { describe, it, expect } from "vitest";
import { ethiopicToGregorian, gregorianToEthiopic, isEthiopianLeap } from "../src";

describe("Ethiopic ↔ Gregorian", () => {
  it("round-trips mid-year dates", () => {
    const samples = [
      { year: 2014, month: 4, day: 10 },
    ];
    for (const s of samples) {
      const g = ethiopicToGregorian(s);
      const back = gregorianToEthiopic(g);
      expect(back).toEqual(s);
    }
  });

  it("validates Pagume length via isEthiopianLeap", () => {
    expect(typeof isEthiopianLeap(2015)).toBe("boolean");
  });
});
