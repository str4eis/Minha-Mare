import { describe, expect, it } from "vitest";
import { getProfileDisplayName } from "./profile-name";

describe("getProfileDisplayName", () => {
  it("keeps the name saved in the profile ahead of provider metadata", () => {
    expect(
      getProfileDisplayName("Ana Silva", { full_name: "Ana Google" }, "ana@mail.com")
    ).toBe("Ana Silva");
  });

  it("uses Google full_name and then name", () => {
    expect(
      getProfileDisplayName("", { full_name: "  ", name: "Ana Google" }, "ana@mail.com")
    ).toBe("Ana Google");
    expect(getProfileDisplayName("", { full_name: "Ana Silva" }, "ana@mail.com")).toBe(
      "Ana Silva"
    );
  });

  it("falls back to the start of the email when metadata is empty", () => {
    expect(getProfileDisplayName("", {}, "  ana.silva@mail.com ")).toBe(
      "ana.silva"
    );
    expect(getProfileDisplayName("", {}, "")).toBe("");
  });
});
