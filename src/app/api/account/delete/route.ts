import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const genericError = { error: "Não foi possível excluir a conta." };

export async function POST() {
  let userId: string;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json(
        { error: "É necessário entrar na conta." },
        { status: 401 }
      );
    }
    userId = user.id;
  } catch {
    return NextResponse.json(genericError, { status: 500 });
  }

  try {
    const admin = createAdminClient();
    if (!admin) return NextResponse.json(genericError, { status: 500 });
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return NextResponse.json(genericError, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(genericError, { status: 500 });
  }
}
