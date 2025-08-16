import { describe, it, expect } from "vitest";
import { format } from "../src";

describe("format", () => {
  it("formats Amharic", () => {
    const s = format({ year: 2017, month: 1, day: 1 }, { locale: "am" });
    expect(s).toContain("መስከረም");
  });
  it("formats Oromo", () => {
    const s = format({ year: 2017, month: 2, day: 5 }, { locale: "om" });
    expect(s).toContain("Onkololeessa");
  });
  it("formats Somali", () => {
    const s = format({ year: 2017, month: 3, day: 10 }, { locale: "so" });
    expect(s).toContain("Noofembar");
  });
});
