import { describe, expect, it } from "vitest";
import { moneyInWords } from "./money-words";

describe("moneyInWords", () => {
  it.each([
    [0, "zero reais"],
    [1, "um real"],
    [2.5, "dois reais e cinquenta centavos"],
    [50, "cinquenta reais"],
    [125.8, "cento e vinte e cinco reais e oitenta centavos"],
  ])("converts %s into Brazilian Portuguese", (value, words) => {
    expect(moneyInWords(value)).toBe(words);
  });

  it("uses the correct singular for one cent", () => {
    expect(moneyInWords(1.01)).toBe("um real e um centavo");
    expect(moneyInWords(0.01)).toBe("um centavo");
  });
});
