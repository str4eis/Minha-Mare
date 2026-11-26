import { describe, expect, it } from "vitest";
import { parseMoneyInput } from "./format";

describe("parseMoneyInput", () => {
  it.each(["12,34", "12.34"])("accepts %s as a decimal amount", (input) => {
    expect(parseMoneyInput(input)).toBe(12.34);
  });

  it.each(["0", "-1", "abc", "1.234", "1,2.3"])(
    "rejects invalid or non-positive amount %s",
    (input) => {
      expect(parseMoneyInput(input)).toBeNull();
    }
  );
});
