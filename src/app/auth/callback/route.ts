import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";

function redirectToLogin(request: NextRequest, errorCode: string) {
  const destination = new URL("/login", request.url);
  destination.searchParams.set("error", errorCode);
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (nextPath) destination.searchParams.set("next", nextPath);
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/home";
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError !== null) {
    return redirectToLogin(request, oauthError || "callback");
  }

  if (!code) {
    return redirectToLogin(request, "callback");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirectToLogin(request, error.code ?? "callback");
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
