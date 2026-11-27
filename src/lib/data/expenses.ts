import { getMonthRange } from "../domain/period";
import type { Expense } from "../domain/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { mapExpenseRow, toExpenseInsert } from "./mappers";

type Client = SupabaseClient<Database>;

export async function listExpensesForMonth(
  client: Client,
  year: number,
  month: number
): Promise<Expense[]> {
  const { start, end } = getMonthRange(year, month);
  const { data, error } = await client
    .from("expenses")
    .select("*")
    .gte("occurred_at", start)
    .lt("occurred_at", end)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data.map(mapExpenseRow);
}

export async function insertExpense(
  client: Client,
  expense: Omit<Expense, "id">
): Promise<Expense> {
  const { data, error } = await client
    .from("expenses")
    .insert(toExpenseInsert(expense))
    .select("*")
    .single();

  if (error) throw error;
  return mapExpenseRow(data);
}

export async function updateExpenseById(
  client: Client,
  id: string,
  expense: Omit<Expense, "id">
): Promise<Expense> {
  const { data, error } = await client
    .from("expenses")
    .update(toExpenseInsert(expense))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapExpenseRow(data);
}

export async function deleteExpenseById(
  client: Client,
  id: string
): Promise<void> {
  const { error } = await client
    .from("expenses")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
}

export async function getExpenseById(
  client: Client,
  id: string
): Promise<Expense | null> {
  const { data, error } = await client
    .from("expenses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapExpenseRow(data) : null;
}
