import { describe, expect, it } from "vitest";
import { mapAuthError } from "./auth-errors";
import { SupabaseConfigurationError } from "./supabase/config";

describe("mapAuthError", () => {
  it.each([
    ["invalid_credentials", "E-mail ou senha incorretos."],
    ["user_already_exists", "Este e-mail já está cadastrado."],
    ["weak_password", "A senha é muito fraca ou curta. Use pelo menos 8 caracteres."],
    ["email_not_confirmed", "Confirme seu e-mail antes de entrar."],
    ["too_many_requests", "Muitas tentativas. Aguarde um pouco e tente novamente."],
  ])("maps %s into a Portuguese message", (code, message) => {
    expect(mapAuthError({ code, message: "private server detail" })).toBe(message);
  });

  it("maps network and unknown errors without exposing server text", () => {
    expect(mapAuthError({ name: "TypeError", message: "fetch failed" })).toContain(
      "conectar"
    );
    expect(mapAuthError({ code: "unexpected", message: "internal secret" })).toBe(
      "Não foi possível concluir. Tente novamente."
    );
  });

  it("explains missing Supabase configuration without exposing credentials", () => {
    expect(
      mapAuthError(
        new SupabaseConfigurationError(
          "Configure as variáveis NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local."
        )
      )
    ).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});
