const URL_PATTERN =
  /https?:\/\/[^\s]+/i;

export function extractDocsUrl(text: string): string | null {
  const trimmed = text.trim();
  const match = trimmed.match(URL_PATTERN);
  if (!match) {
    return null;
  }
  if (trimmed !== match[0] && !trimmed.startsWith(match[0])) {
    return null;
  }
  try {
    const url = new URL(match[0].replace(/[.,;:!?)]+$/, ""));
    return url.href;
  } catch {
    return null;
  }
}
