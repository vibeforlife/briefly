const BASE_URL = import.meta.env.VITE_NEWS_PROXY_BASE as string;

if (!BASE_URL) {
  console.warn("VITE_NEWS_PROXY_BASE is not set");
}

export async function fetchTopHeadlines(params: {
  country?: string;
  category?: string;
  q?: string;
}) {
  if (!BASE_URL) {
    throw new Error("News proxy base URL not configured");
  }

  const url = new URL("/v2/top-headlines", BASE_URL);

  if (params.country) url.searchParams.set("country", params.country);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.q) url.searchParams.set("q", params.q);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`News API error: ${resp.status}`);
  }

  return resp.json();
}
