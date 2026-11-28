export const WELCOME_SEEN_KEY = "minha-mare:welcome-seen";

export function getWelcomeSeenKey(userId: string): string {
  return `${WELCOME_SEEN_KEY}:${userId}`;
}

export function hasSeenWelcome(userId: string): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem(getWelcomeSeenKey(userId)) === "true"
    );
  } catch {
    return false;
  }
}

export function markWelcomeAsSeen(userId: string): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getWelcomeSeenKey(userId), "true");
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
