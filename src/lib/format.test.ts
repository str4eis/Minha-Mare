import { describe, expect, it } from "vitest";
import { formatDateShort, parseMoneyInput } from "./format";

describe("parseMoneyInput", () => {
  it.each(["12,34", "12.34"])("accepts %s as a decimal amount", (input) => {
    expect(parseMoneyInput(input)).toBe(12.34);
  });

  describe("formatDateShort", () => {
    it("uses Recife time when identifying today", () => {
      expect(
        formatDateShort(
          "2026-02-10T02:00:00.000Z",
          new Date("2026-02-10T02:30:00.000Z")
        )
      ).toBe("Hoje, 23:00");
    });

    it("formats older dates in Recife", () => {
      expect(
        formatDateShort(
          "2026-02-09T14:00:00.000Z",
          new Date("2026-02-10T03:00:00.000Z")
        )
      ).toBe("09/02");
    });
  });

  it.each(["0", "-1", "abc", "1.234", "1,2.3"])(
    "rejects invalid or non-positive amount %s",
    (input) => {
      expect(parseMoneyInput(input)).toBeNull();
    }
  );
});
