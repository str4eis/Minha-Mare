import { describe, expect, it } from "vitest";
import { getCategoryIconName } from "../lib/category-icons";

const knownCategoryIds = [
  "ostra",
  "caranguejo",
  "peixe",
  "marisco",
  "sururu",
  "outros",
  "combustivel",
  "transporte",
  "gelo",
  "equipamentos",
  "manutencao",
  "iscas",
  "alimentacao",
  "moradia",
  "saude",
  "educacao",
  "lazer",
];

describe("CategoryIcon mapping", () => {
  it("maps every known category to a specific icon", () => {
    for (const category of knownCategoryIds) {
      expect(getCategoryIconName(category)).toBe(category);
    }
  });

  it("uses a generic icon for unknown category ids", () => {
    expect(getCategoryIconName("categoria-desconhecida")).toBe("generico");
  });
});
