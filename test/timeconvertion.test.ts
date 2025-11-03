import { describe, it, expect } from "vitest";
import { ethiopicToGregorian, gregorianToEthiopic } from "../src/convert";

describe("Ethiopic ↔ Gregorian Conversion (EAT)", () => {
  it("converts Ethiopian New Year (2016 Meskerem 1) to Gregorian correctly", () => {
    const result = ethiopicToGregorian({
      year: 2016,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      ampm: ""
    });

    // Ethiopian 2016-01-01 → Gregorian 2023-09-12 (EAT +3)
    // Ethiopian 00:00 = Gregorian 06:00 EAT = 03:00 UTC
    expect(result.toISOString()).toBe("2023-09-12T03:00:00.000Z");
  });



});
