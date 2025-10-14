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
    });

    // Ethiopian 2016-01-01 → Gregorian 2023-09-12 (EAT +3)
    // Ethiopian 00:00 = Gregorian 06:00 EAT = 03:00 UTC
    expect(result.toISOString()).toBe("2023-09-12T03:00:00.000Z");
  });

  it("converts Gregorian date (2023-09-12T03:00:00Z) back to Ethiopian correctly", () => {
    const date = new Date("2023-09-12T03:00:00Z");
    const result = gregorianToEthiopic(date);

    expect(result.year).toBe(2016);
    expect(result.month).toBe(1);
    expect(result.day).toBe(1);
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
  });

  it("handles Ethiopian midday conversion correctly", () => {
    const result = ethiopicToGregorian({
      year: 2016,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
    });

    // 12:00 Ethiopian = 18:00 EAT = 15:00 UTC
    expect(result.toISOString()).toBe("2023-09-12T15:00:00.000Z");
  });

  it("handles round-trip conversion (Ethiopic → Gregorian → Ethiopic)", () => {
    const ethioDate = {
      year: 2017,
      month: 4,
      day: 15,
      hour: 9,
      minute: 30,
      second: 0,
    };

    const greg = ethiopicToGregorian(ethioDate);
    const back = gregorianToEthiopic(greg);

    expect(back.year).toBe(ethioDate.year);
    expect(back.month).toBe(ethioDate.month);
    expect(back.day).toBe(ethioDate.day);
    expect(back.hour).toBe(ethioDate.hour);
    expect(back.minute).toBe(ethioDate.minute);
    expect(back.second).toBe(ethioDate.second);
  });

  it("defaults time to 00:00:00 if not provided", () => {
    const result = ethiopicToGregorian({
      year: 2016,
      month: 1,
      day: 1,
    });

    // Ethiopian 2016-01-01 → Gregorian 2023-09-12 03:00 UTC (06:00 EAT)
    expect(result.toISOString()).toBe("2023-09-12T03:00:00.000Z");
  });
});
