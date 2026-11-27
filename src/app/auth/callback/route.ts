import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/home";

  if (!code) {
    return NextResponse.redirect(new URL("/login?erro=callback", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?erro=callback", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
