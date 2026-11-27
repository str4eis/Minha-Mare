import { safeNextPath } from "./auth-routes";

export function getOAuthSuccessPath(nextPath?: string | null): string {
  const destination = safeNextPath(nextPath);
  return destination && destination !== "/" ? destination : "/home";
}

export function mapOAuthError(error: unknown): string {
  const details =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null
        ? [
            (error as Record<string, unknown>).code,
            (error as Record<string, unknown>).error,
            (error as Record<string, unknown>).message,
            (error as Record<string, unknown>).name,
          ]
            .filter((value): value is string => typeof value === "string")
            .join(" ")
        : "";
  const normalized = details.toLowerCase();

  if (
    /access_denied|user.?cancel|cancelled|canceled|user denied|denied access/.test(
      normalized
    )
  ) {
    return "Você cancelou a entrada. Toque no botão para tentar de novo.";
  }

  if (
    /network|fetch failed|failed to fetch|offline|internet|connection|authretryablefetcherror|typeerror/.test(
      normalized
    )
  ) {
    return "Sem internet no momento. Tente de novo.";
  }

  return "Não deu certo. Tente de novo em alguns instantes.";
}

export function getOAuthRedirectUrl(
  origin: string,
  nextPath?: string | null
): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", getOAuthSuccessPath(nextPath));
  return callbackUrl.toString();
}

export function getSessionRedirectPath(
  session: { user: unknown } | null,
  nextPath?: string | null
): string | null {
  return session?.user ? getOAuthSuccessPath(nextPath) : null;
}

export function isEmbeddedBrowser(userAgent: string): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|FB4A|WhatsApp|Line\/|TikTok|Musical_ly/i.test(
    userAgent
  );
}
