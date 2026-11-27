import { getMonthRange } from "../domain/period";
import type { Sale } from "../domain/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { mapSaleRow, toSaleInsert } from "./mappers";
import type { SaleCategory } from "../domain/types";

type Client = SupabaseClient<Database>;

export async function listSalesForMonth(
  client: Client,
  year: number,
  month: number
): Promise<Sale[]> {
  const { start, end } = getMonthRange(year, month);
  const { data, error } = await client
    .from("sales")
    .select("*")
    .gte("occurred_at", start)
    .lt("occurred_at", end)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data.map(mapSaleRow);
}

export async function getLatestSale(client: Client): Promise<Sale | null> {
  const { data, error } = await client
    .from("sales")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSaleRow(data) : null;
}

export async function getLatestSaleForCategory(
  client: Client,
  category: SaleCategory
): Promise<Sale | null> {
  const { data, error } = await client
    .from("sales")
    .select("*")
    .eq("category", category)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSaleRow(data) : null;
}

export async function insertSale(
  client: Client,
  sale: Omit<Sale, "id">
): Promise<Sale> {
  const { data, error } = await client
    .from("sales")
    .insert(toSaleInsert(sale))
    .select("*")
    .single();

  if (error) throw error;
  return mapSaleRow(data);
}

export async function updateSaleById(
  client: Client,
  id: string,
  sale: Omit<Sale, "id">
): Promise<Sale> {
  const { data, error } = await client
    .from("sales")
    .update(toSaleInsert(sale))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapSaleRow(data);
}

export async function deleteSaleById(
  client: Client,
  id: string
): Promise<void> {
  const { error } = await client
    .from("sales")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
}

export async function getSaleById(client: Client, id: string): Promise<Sale | null> {
  const { data, error } = await client
    .from("sales")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSaleRow(data) : null;
}
