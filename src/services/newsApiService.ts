// src/services/newsApiService.ts
import axios from "axios";
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

const BASE_URL = "https://newsapi.org/v2";

// Map our topics to NewsAPI categories for top-headlines. [web:90]
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
  topic: string;      // our Topic id
  searchTerm: string;
}): Promise<NewsArticle[]> {
  const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
  console.log("API key present?", !!apiKey);
  if (!apiKey) {
    console.warn("VITE_NEWSAPI_KEY is not set. Returning empty article list.");
    return [];
  }

  const { topic, searchTerm } = params;
  const hasSearch = searchTerm.trim().length > 0;

  // Strategy:
  // - If user typed a search term OR topic is "all" → use /everything (full-text search). [web:82]
  // - Else → use /top-headlines with category/country. [web:90]
  const useEverything = hasSearch || topic === "all";

  let url: URL;

  if (useEverything) {
    url = new URL(`${BASE_URL}/everything`);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "40");
    // If search term is empty but topic = all, use a broad query to avoid empty q.
    const q = hasSearch ? searchTerm.trim() : "news";
    url.searchParams.set("q", q);
  } else {
    url = new URL(`${BASE_URL}/top-headlines`);
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

  const response = await axios.get(url.toString(), {
    headers: { "X-Api-Key": apiKey },
  });

  const data = response.data;
  console.log("NewsAPI response", data);

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
