import { describe, it, expect } from "vitest";
import { formatViewers } from "./format";

describe("formatViewers", () => {
  it("deja los números pequeños tal cual", () => {
    expect(formatViewers(0)).toBe("0");
    expect(formatViewers(980)).toBe("980");
  });

  it("formatea miles con sufijo 'mil'", () => {
    expect(formatViewers(4213)).toBe("4,2 mil");
    expect(formatViewers(1000)).toBe("1,0 mil");
  });

  it("formatea millones con sufijo 'M'", () => {
    expect(formatViewers(1_500_000)).toBe("1,5 M");
  });
});
