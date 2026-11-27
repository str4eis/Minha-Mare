export function getProfileDisplayName(
  profileName: string | null | undefined,
  userMetadata: Record<string, unknown> | null | undefined,
  email: string | null | undefined
): string {
  const candidates = [
    profileName,
    userMetadata?.full_name,
    userMetadata?.name,
    email?.split("@")[0],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}
