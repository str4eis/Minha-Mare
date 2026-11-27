export function isProtectedPath(pathname: string): boolean {
  return ["/home", "/vendas", "/gastos", "/resultados", "/perfil"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function isAuthPath(pathname: string): boolean {
  return ["/login", "/cadastro"].includes(pathname);
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return null;
  }

  try {
    const base = new URL("https://minha-mare.invalid");
    const destination = new URL(value, base);
    return destination.origin === base.origin ? value : null;
  } catch {
    return null;
  }
}
