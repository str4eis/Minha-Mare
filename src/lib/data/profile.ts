import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { mapProfileRow } from "./mappers";

type Client = SupabaseClient<Database>;

export async function getProfile(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return {
      id: userId,
      full_name: "",
    };
  }
  return mapProfileRow(data);
}

export async function upsertProfile(
  client: Client,
  userId: string,
  profile: { full_name: string }
) {
  const { data, error } = await client
    .from("profiles")
    .upsert({ id: userId, ...profile }, { onConflict: "id" })
    .select("id, full_name")
    .single();

  if (error) throw error;
  return mapProfileRow(data);
}
