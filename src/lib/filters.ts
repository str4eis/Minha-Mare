import { filterByMonth } from "./period";

export interface ItemFilterOptions<T> {
  query?: string;
  category?: string;
  getSearchText: (item: T) => string;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function filterItems<T extends { date: string; category: string }>(
  items: T[],
  year: number,
  month: number,
  options: ItemFilterOptions<T>
): T[] {
  const query = normalizeText(options.query?.trim() ?? "");
  const monthItems = filterByMonth(items, year, month);

  return monthItems.filter((item) => {
    if (options.category && item.category !== options.category) return false;
    if (!query) return true;
    return normalizeText(options.getSearchText(item)).includes(query);
  });
}
