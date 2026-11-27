import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { mapProfileRow } from "./mappers";

type Client = SupabaseClient<Database>;

export async function getProfile(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Perfil da usuária não encontrado.");
  return mapProfileRow(data);
}
