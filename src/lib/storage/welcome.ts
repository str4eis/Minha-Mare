export const WELCOME_SEEN_KEY = "minha-mare:welcome-seen:v1";

export function hasSeenWelcome(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem(WELCOME_SEEN_KEY) === "true"
    );
  } catch {
    return false;
  }
}

export function markWelcomeAsSeen(): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WELCOME_SEEN_KEY, "true");
    }
  } catch {
    // Storage may be unavailable in private or restricted browsing.
  }
}

export function getWelcomeVideoEmbedUrl(videoId?: string): string | null {
  const cleanId = videoId?.trim();
  if (!cleanId) return null;

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    cleanId
  )}?rel=0&modestbranding=1&playsinline=1&cc_load_policy=1&hl=pt`;
}
