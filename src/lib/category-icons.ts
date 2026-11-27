const categoryIconNames = {
  ostra: "ostra",
  caranguejo: "caranguejo",
  peixe: "peixe",
  marisco: "marisco",
  sururu: "sururu",
  outros: "outros",
  combustivel: "combustivel",
  transporte: "transporte",
  gelo: "gelo",
  equipamentos: "equipamentos",
  manutencao: "manutencao",
  iscas: "iscas",
  alimentacao: "alimentacao",
  moradia: "moradia",
  saude: "saude",
  educacao: "educacao",
  lazer: "lazer",
} as const;

export type CategoryIconName =
  | (typeof categoryIconNames)[keyof typeof categoryIconNames]
  | "generico";

export function getCategoryIconName(category: string): CategoryIconName {
  return Object.prototype.hasOwnProperty.call(categoryIconNames, category)
    ? categoryIconNames[category as keyof typeof categoryIconNames]
    : "generico";
}
