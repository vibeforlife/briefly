// src/services/newsApiService.ts
import { isLikelyPaywalled } from "./paywallService";

export type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  isPaywalled: boolean;
  imageUrl?: string;
};

// Hard-code the Cloudflare Worker proxy URL so it works in GitHub Pages builds
// Replace the URL below with your actual Worker URL.
const PROXY_BASE_URL = "https://briefly-news-proxy.listen2meagain25.workers.dev";

// Map our topics to NewsAPI categories for top-headlines.
const topicToCategory: Record<string, string> = {
  top: "general",
  politics: "general",
  world: "general",
  technology: "technology",
  business: "business",
  science: "science",
  health: "health",
  sports: "sports",
  environment: "general",
  entertainment: "entertainment",
  canada: "general",
  // "all" handled separately
};

export async function fetchNews(params: {
  topic: string; // our Topic id
  searchTerm: string;
}): Promise<NewsArticle[]> {
  if (!PROXY_BASE_URL) {
    console.warn("PROXY_BASE_URL is not set. Returning empty article list.");
    return [];
  }

  const { topic, searchTerm } = params;
  const hasSearch = searchTerm.trim().length > 0;

  // Strategy:
  // - If user typed a search term OR topic is "all" → use /everything (full-text search).
  // - Else → use /top-headlines with category/country.
  const useEverything = hasSearch || topic === "all";

  let url: URL;

  if (useEverything) {
    url = new URL("/v2/everything", PROXY_BASE_URL);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "40");
    const q = hasSearch ? searchTerm.trim() : "news";
    url.searchParams.set("q", q);
  } else {
    url = new URL("/v2/top-headlines", PROXY_BASE_URL);
    url.searchParams.set("language", "en");

    if (topic === "canada") {
      url.searchParams.set("country", "ca");
    }

    const category = topicToCategory[topic] || "general";
    url.searchParams.set("category", category);

    if (hasSearch) {
      url.searchParams.set("q", searchTerm.trim());
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error("News proxy error", response.status, await response.text());
    return [];
  }

  const data = await response.json();
  console.log("News proxy response", data);

  if (!data || !Array.isArray(data.articles)) {
    return [];
  }

  return data.articles
    .filter((a: any) => a && a.title && a.url)
    .map((a: any, index: number) => ({
      id: `${Date.now()}-${index}-${a.url}`,
      title: a.title,
      url: a.url,
      source: a.source?.name ?? "Unknown",
      publishedAt: a.publishedAt ?? new Date().toISOString(),
      isPaywalled: isLikelyPaywalled(a.url),
      imageUrl: a.urlToImage || undefined,
    })) as NewsArticle[];
}
