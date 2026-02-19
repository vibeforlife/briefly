import { PAYWALLED_DOMAINS, USUALLY_FREE_DOMAINS } from "../data/paywallList";

function getDomainFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isLikelyPaywalled(url: string): boolean {
  const domain = getDomainFromUrl(url);
  if (!domain) return false;

  if (PAYWALLED_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) {
    return true;
  }
  if (USUALLY_FREE_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) {
    return false;
  }

  // Unknown domains default to not paywalled; you can tune this later.
  return false;
}
