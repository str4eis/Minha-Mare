import { SupabaseConfigurationError } from "../supabase/config";

export interface AuthErrorLike {
  code?: string | null;
  status?: number;
  name?: string;
  message?: string;
}

function isAuthErrorLike(value: unknown): value is AuthErrorLike {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.code === undefined ||
      candidate.code === null ||
      typeof candidate.code === "string") &&
    (candidate.status === undefined || typeof candidate.status === "number") &&
    (candidate.name === undefined || typeof candidate.name === "string") &&
    (candidate.message === undefined || typeof candidate.message === "string")
  );
}

export function mapAuthError(value: unknown): string {
  if (value instanceof SupabaseConfigurationError) return value.message;
  const error = isAuthErrorLike(value) ? value : null;
  const code = error?.code?.toLowerCase() ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (
    ["invalid_credentials", "invalid_login_credentials"].includes(code) ||
    message.includes("invalid login credentials")
  ) {
    return "E-mail ou senha incorretos.";
  }
  if (
    ["user_already_exists", "email_exists"].includes(code) ||
    message.includes("already registered")
  ) {
    return "Este e-mail já está cadastrado.";
  }
  if (
    ["weak_password", "password_too_short"].includes(code) ||
    message.includes("password should be")
  ) {
    return "A senha é muito fraca ou curta. Use pelo menos 8 caracteres.";
  }
  if (
    ["email_not_confirmed", "signup_disabled"].includes(code) ||
    message.includes("email not confirmed")
  ) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (
    ["too_many_requests", "over_email_send_rate_limit", "over_request_rate_limit"].includes(code) ||
    error?.status === 429
  ) {
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  }
  if (
    error?.name === "TypeError" ||
    ["fetch_error", "network_error"].includes(code) ||
    /network|fetch failed|failed to fetch/.test(message)
  ) {
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  }
  return "Não foi possível concluir. Tente novamente.";
}
