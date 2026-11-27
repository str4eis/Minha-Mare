import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { Expense, Sale } from "../types";
import { toExpenseInsert, toSaleInsert } from "./mappers";

type Client = SupabaseClient<Database>;

export async function insertImportedSales(
  client: Client,
  sales: Array<Omit<Sale, "id">>,
  ids: string[]
): Promise<void> {
  if (sales.length !== ids.length) {
    throw new RangeError("A quantidade de IDs de vendas não corresponde.");
  }
  if (ids.length === 0) return;

  const { data: existingRows, error: lookupError } = await client
    .from("sales")
    .select("id")
    .in("id", ids);
  if (lookupError) throw lookupError;
  const existingIds = new Set((existingRows ?? []).map((row) => row.id));
  const rows = sales.flatMap((sale, index) =>
    existingIds.has(ids[index]) ? [] : [toSaleInsert(sale, ids[index])]
  );

  if (rows.length === 0) return;
  const { error } = await client.from("sales").insert(rows);
  if (error) throw error;
}

export async function insertImportedExpenses(
  client: Client,
  expenses: Array<Omit<Expense, "id">>,
  ids: string[]
): Promise<void> {
  if (expenses.length !== ids.length) {
    throw new RangeError("A quantidade de IDs de gastos não corresponde.");
  }
  if (ids.length === 0) return;

  const { data: existingRows, error: lookupError } = await client
    .from("expenses")
    .select("id")
    .in("id", ids);
  if (lookupError) throw lookupError;
  const existingIds = new Set((existingRows ?? []).map((row) => row.id));
  const rows = expenses.flatMap((expense, index) =>
    existingIds.has(ids[index]) ? [] : [toExpenseInsert(expense, ids[index])]
  );

  if (rows.length === 0) return;
  const { error } = await client.from("expenses").insert(rows);
  if (error) throw error;
}
