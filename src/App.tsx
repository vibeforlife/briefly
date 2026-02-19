// src/App.tsx
import { useEffect, useRef, useState } from "react";
import type { NewsArticle } from "./services/newsApiService";
import { fetchNews } from "./services/newsApiService";
import { loadBookmarks, saveBookmarks } from "./services/bookmarkService";
import { loadPresets, savePresets } from "./services/presetService";
import type { Preset } from "./services/presetService";
import {
  loadPinnedSources,
  savePinnedSources,
} from "./services/pinnedSourceService";
import {
  BIG_OUTLET_DOMAINS,
  INDEPENDENT_DOMAINS,
  getDomainFromUrl,
  matchesDomain,
} from "./data/sourceGroups";
import type { SourceGroup } from "./data/sourceGroups";

type Topic =
  | "all"
  | "top"
  | "politics"
  | "world"
  | "technology"
  | "business"
  | "science"
  | "health"
  | "sports"
  | "environment"
  | "entertainment"
  | "canada";

const topics: { id: Topic; label: string }[] = [
  { id: "all", label: "All news" },
  { id: "top", label: "Top stories" },
  { id: "politics", label: "Politics" },
  { id: "world", label: "World" },
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business & Finance" },
  { id: "science", label: "Science" },
  { id: "health", label: "Health" },
  { id: "sports", label: "Sports" },
  { id: "environment", label: "Environment" },
  { id: "entertainment", label: "Entertainment" },
  { id: "canada", label: "Canada" },
];

type ViewMode = "comfy" | "compact";
type ThemeMode = "light" | "dark";

function App() {
  const [selectedTopic, setSelectedTopic] = useState<Topic>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [savingBookmarks, setSavingBookmarks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceGroup, setSourceGroup] = useState<SourceGroup>("all");
  const [hidePaywalled, setHidePaywalled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("comfy");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [pinnedSources, setPinnedSources] = useState<string[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const cache = useRef<Record<string, NewsArticle[]>>({});

  const isDark = theme === "dark";

  const isBookmarked = (a: NewsArticle) =>
    bookmarks.some((b) => b.url === a.url);

  const isPinned = (a: NewsArticle) =>
    pinnedSources.some((d) => getDomainFromUrl(a.url) === d);

  const applyFilters = (raw: NewsArticle[]): NewsArticle[] => {
    let filtered = [...raw];

    if (sourceGroup === "big") {
      filtered = filtered.filter((a) =>
        matchesDomain(a.url, BIG_OUTLET_DOMAINS)
      );
    } else if (sourceGroup === "independent") {
      filtered = filtered.filter((a) =>
        matchesDomain(a.url, INDEPENDENT_DOMAINS)
      );
    }

    if (hidePaywalled) {
      filtered = filtered.filter((a) => !a.isPaywalled);
    }

    const pinned = filtered.filter((a) => isPinned(a));
    const rest = filtered.filter((a) => !isPinned(a));
    return [...pinned, ...rest];
  };

  const displayedArticles = applyFilters(articles);

  const toggleBookmark = async (article: NewsArticle) => {
    const next = isBookmarked(article)
      ? bookmarks.filter((b) => b.url !== article.url)
      : [...bookmarks, article];
    setBookmarks(next);
    try {
      setSavingBookmarks(true);
      await saveBookmarks(next);
    } catch (e) {
      console.error("Failed to save bookmarks", e);
    } finally {
      setSavingBookmarks(false);
    }
  };

  const togglePin = async (url: string) => {
    const domain = getDomainFromUrl(url);
    if (!domain) return;
    const next = pinnedSources.includes(domain)
      ? pinnedSources.filter((d) => d !== domain)
      : [...pinnedSources, domain];
    setPinnedSources(next);
    try {
      await savePinnedSources(next);
    } catch (e) {
      console.error("Failed to save pinned sources", e);
    }
  };

  const loadNews = async (forceRefresh = false) => {
    const cacheKey = `${selectedTopic}__${searchTerm}`;
    if (!forceRefresh && cache.current[cacheKey]) {
      setArticles(cache.current[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchNews({ topic: selectedTopic, searchTerm });
      cache.current[cacheKey] = result;
      setArticles(result);
    } catch (e) {
      console.error(e);
      setError("Failed to load news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: Preset) => {
    setSelectedTopic(preset.topic as Topic);
    setSearchTerm(preset.searchTerm);
  };

  const saveCurrentAsPreset = async () => {
    if (!newPresetName.trim()) return;
    const preset: Preset = {
      id: `${Date.now()}`,
      name: newPresetName.trim(),
      topic: selectedTopic,
      searchTerm,
    };
    const next = [...presets, preset];
    setPresets(next);
    setNewPresetName("");
    setShowPresetInput(false);
    try {
      await savePresets(next);
    } catch (e) {
      console.error("Failed to save presets", e);
    }
  };

  const deletePreset = async (id: string) => {
    const next = presets.filter((p) => p.id !== id);
    setPresets(next);
    try {
      await savePresets(next);
    } catch (e) {
      console.error("Failed to delete preset", e);
    }
  };

  useEffect(() => {
    Promise.all([loadBookmarks(), loadPresets(), loadPinnedSources()])
      .then(([bm, pr, ps]) => {
        setBookmarks(bm);
        setPresets(pr);
        setPinnedSources(ps);
        setBookmarksLoaded(true);
      })
      .catch((e) => {
        console.error("Error loading from Firebase", e);
        setBookmarksLoaded(true);
      });
  }, []);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  const btn = (
    active: boolean,
    options?: { subtle?: boolean }
  ): React.CSSProperties => ({
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "999px",
    border: active
      ? `1px solid ${isDark ? "#60a5fa" : "#2563eb"}`
      : `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    background: active
      ? isDark
        ? "linear-gradient(to right, #1d4ed8, #3b82f6)"
        : "#2563eb"
      : options?.subtle
      ? "transparent"
      : isDark
      ? "#111827"
      : "#ffffff",
    color: active
      ? "#f9fafb"
      : isDark
      ? "#e5e7eb"
      : "#111827",
    fontSize: "12px",
    cursor: "pointer",
    marginRight: "6px",
    boxShadow: active
      ? "0 4px 12px rgba(37,99,235,0.45)"
      : "none",
    transition: "background 120ms ease, border-color 120ms ease, box-shadow 120ms ease, color 120ms ease",
  });

  const bgGradient = isDark
    ? "radial-gradient(circle at top left, #1f2937, #020617)"
    : "radial-gradient(circle at top left, #eff6ff, #f9fafb)";

  const headerBg = isDark
    ? "linear-gradient(to right, rgba(15,23,42,0.98), rgba(30,64,175,0.98))"
    : "linear-gradient(to right, #ffffff, #e5f0ff)";

  const headerBorder = isDark ? "#111827" : "#e5e7eb";

  const textMain = isDark ? "#e5e7eb" : "#111827";
  const textSub = isDark ? "#9ca3af" : "#4b5563";
  const cardBorder = isDark ? "#1f2933" : "#e5e7eb";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: bgGradient,
        color: textMain,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "14px 24px",
          borderBottom: `1px solid ${headerBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          background: headerBg,
          color: isDark ? "#f9fafb" : "#111827",
          boxShadow: "0 10px 30px rgba(15,23,42,0.55)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: isDark ? "#f9fafb" : "#111827",
            }}
          >
            Briefly4U
          </h1>
          <p
            style={{
              margin: 0,
              color: isDark ? "#e5e7eb" : "#374151",
              fontSize: "12px",
            }}
          >
            Curated headlines from mainstream and independent sources.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            style={btn(false, { subtle: true })}
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            {isDark ? "Light mode" : "Dark mode"}
          </button>
          <button
            style={btn(viewMode === "compact", { subtle: true })}
            onClick={() =>
              setViewMode((prev) => (prev === "compact" ? "comfy" : "compact"))
            }
          >
            {viewMode === "compact" ? "Comfy view" : "Compact view"}
          </button>
          {savingBookmarks && (
            <span style={{ fontSize: "11px", color: isDark ? "#e5e7eb" : "#4b5563" }}>
              Saving…
            </span>
          )}
          <button
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.7)",
              background: isDark ? "rgba(15,23,42,0.85)" : "#2563eb",
              color: "#e5e7eb",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
            onClick={() => loadNews(true)}
          >
            Refresh news
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Main */}
        <main
          style={{
            flex: 3,
            padding: "14px 24px",
            borderRight: `1px solid ${cardBorder}`,
            minWidth: 0,
          }}
        >
          {/* Control panel */}
          <div
            style={{
              marginBottom: "14px",
              padding: "10px 12px",
              borderRadius: "14px",
              background: isDark ? "#020617dd" : "#ffffffdd",
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            }}
          >
            {/* Topics */}
            <div
              style={{
                marginBottom: "8px",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  style={btn(selectedTopic === t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search row */}
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Search any topic (e.g. India, elections, Gaza)…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadNews(true);
                }}
                style={{
                  flex: 1,
                  minWidth: "220px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: `1px solid ${cardBorder}`,
                  fontSize: "13px",
                  background: isDark ? "#020617" : "#ffffff",
                  color: textMain,
                }}
              />
              <button style={btn(true)} onClick={() => loadNews(true)}>
                Search
              </button>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: textSub,
                  marginRight: "8px",
                }}
              >
                Presets:
              </span>
              {presets.map((p) => (
                <span
                  key={p.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: "6px",
                    marginBottom: "4px",
                  }}
                >
                  <button
                    style={btn(false)}
                    onClick={() => applyPreset(p)}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deletePreset(p.id)}
                    style={{
                      marginLeft: "-4px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: isDark ? "#6b7280" : "#9ca3af",
                      fontSize: "12px",
                      padding: "0 4px",
                    }}
                    title="Delete preset"
                  >
                    ×
                  </button>
                </span>
              ))}
              {showPresetInput ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Preset name…"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveCurrentAsPreset();
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      border: `1px solid ${cardBorder}`,
                      fontSize: "12px",
                      width: "140px",
                      background: isDark ? "#020617" : "#ffffff",
                      color: textMain,
                    }}
                    autoFocus
                  />
                  <button style={btn(true)} onClick={saveCurrentAsPreset}>
                    Save
                  </button>
                  <button
                    style={btn(false)}
                    onClick={() => setShowPresetInput(false)}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  style={btn(false)}
                  onClick={() => setShowPresetInput(true)}
                >
                  + Save current as preset
                </button>
              )}
            </div>

            {/* Filters */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "12px", color: textSub }}>
                Sources:
              </span>
              {(["all", "big", "independent"] as SourceGroup[]).map((g) => (
                <button
                  key={g}
                  style={btn(sourceGroup === g, { subtle: true })}
                  onClick={() => setSourceGroup(g)}
                >
                  {g === "all"
                    ? "All"
                    : g === "big"
                    ? "Big outlets"
                    : "Independent"}
                </button>
              ))}
              <span
                style={{
                  marginLeft: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: textSub,
                }}
              >
                <input
                  type="checkbox"
                  id="hidePaywall"
                  checked={hidePaywalled}
                  onChange={(e) => setHidePaywalled(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="hidePaywall" style={{ cursor: "pointer" }}>
                  Hide likely paywalled
                </label>
              </span>
            </div>
          </div>

          {/* Articles */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: viewMode === "compact" ? "6px" : "12px",
            }}
          >
            {loading && (
              <div style={{ fontSize: "13px", color: textSub }}>
                Loading news…
              </div>
            )}
            {error && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#fca5a5",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: isDark ? "#451a1add" : "#fee2e2",
                  border: "1px solid #f87171",
                }}
              >
                {error}
              </div>
            )}
            {!loading && !error && displayedArticles.length === 0 && (
              <div
                style={{
                  fontSize: "13px",
                  color: textSub,
                  padding: "14px",
                  borderRadius: "8px",
                  background: isDark ? "#020617dd" : "#f9fafb",
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <strong>No articles found.</strong>
                <br />
                Try:
                <ul
                  style={{
                    margin: "6px 0 0 16px",
                    padding: 0,
                  }}
                >
                  <li>Clearing your search term and pressing Refresh.</li>
                  <li>Switching to a different topic.</li>
                  <li>Changing Sources to "All".</li>
                  <li>Unchecking "Hide likely paywalled".</li>
                </ul>
              </div>
            )}

            {!loading &&
              !error &&
              displayedArticles.map((article) => {
                const pinned = isPinned(article);
                const compact = viewMode === "compact";

                return (
                  <div
                    key={article.id}
                    onClick={() =>
                      window.open(article.url, "_blank", "noopener")
                    }
                    style={{
                      borderRadius: "12px",
                      border: pinned
                        ? `1px solid ${isDark ? "#60a5fa" : "#2563eb"}`
                        : `1px solid ${cardBorder}`,
                      background: pinned
                        ? isDark
                          ? "#0b1120"
                          : "#eff6ff"
                        : isDark
                        ? "#020617cc"
                        : "#ffffffcc",
                      padding: compact ? "8px 12px" : "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                      boxShadow: pinned
                        ? "0 10px 25px rgba(37,99,235,0.4)"
                        : "0 8px 20px rgba(15,23,42,0.18)",
                      backdropFilter: "blur(4px)",
                      transition:
                        "transform 120ms ease, box-shadow 120ms ease, background 120ms ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    {/* Optional image in comfy view */}
                    {!compact && article.imageUrl && (
                      <div
                        style={{
                          width: 96,
                          height: 64,
                          borderRadius: "10px",
                          overflow: "hidden",
                          flexShrink: 0,
                          marginRight: "8px",
                          background: isDark ? "#020617" : "#e5e7eb",
                        }}
                      >
                        <img
                          src={article.imageUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {pinned && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            color: isDark ? "#93c5fd" : "#2563eb",
                            marginBottom: "3px",
                            display: "block",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          ★ Pinned source
                        </span>
                      )}
                      <div
                        style={{
                          fontSize: compact ? "13px" : "15px",
                          fontWeight: 500,
                          marginBottom: compact ? "2px" : "4px",
                          color: textMain,
                        }}
                      >
                        {article.title}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: textSub,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "2px",
                        }}
                      >
                        <span>
                          {article.source} •{" "}
                          {new Date(
                            article.publishedAt
                          ).toLocaleString()}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontSize: "10px",
                            border:
                              "1px solid " +
                              (article.isPaywalled
                                ? "#f97373"
                                : "#4ade80"),
                            color: article.isPaywalled
                              ? "#fecaca"
                              : "#bbf7d0",
                            background: article.isPaywalled
                              ? "rgba(127,29,29,0.4)"
                              : "rgba(22,101,52,0.4)",
                          }}
                        >
                          {article.isPaywalled
                            ? "May be paywalled"
                            : "Likely free"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: compact ? "row" : "column",
                        gap: "6px",
                        alignItems: "flex-end",
                        flexShrink: 0,
                      }}
                    >
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: "12px",
                          padding: compact ? "4px 8px" : "6px 10px",
                          borderRadius: "999px",
                          border: "1px solid #2563eb",
                          background: "#2563eb",
                          color: "#fff",
                          textDecoration: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Open
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article);
                        }}
                        style={{
                          fontSize: "12px",
                          padding: compact ? "4px 8px" : "4px 10px",
                          borderRadius: "999px",
                          border: `1px solid ${cardBorder}`,
                          background: isDark ? "#020617" : "#ffffff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          color: isBookmarked(article)
                            ? "#facc15"
                            : textMain,
                        }}
                      >
                        {isBookmarked(article) ? "★" : "☆"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(article.url);
                        }}
                        title={
                          isPinned(article)
                            ? "Unpin this source"
                            : "Pin this source"
                        }
                        style={{
                          fontSize: "12px",
                          padding: compact ? "4px 8px" : "4px 10px",
                          borderRadius: "999px",
                          border: isPinned(article)
                            ? "1px solid #2563eb"
                            : `1px solid ${cardBorder}`,
                          background: isPinned(article)
                            ? isDark
                              ? "#0b1120"
                              : "#eff6ff"
                            : isDark
                            ? "#020617"
                            : "#ffffff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          color: isPinned(article)
                            ? "#2563eb"
                            : textMain,
                        }}
                      >
                        {isPinned(article) ? "Unpin" : "Pin"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </main>

        {/* Sidebar */}
        <aside
          style={{
            flex: 1.2,
            padding: "14px 16px",
            minWidth: "240px",
            maxWidth: "320px",
            overflowY: "auto",
            borderLeft: `1px solid ${cardBorder}`,
            background: isDark ? "#020617f5" : "#f9fafb",
          }}
        >
          {/* Pinned sources */}
          <h2
            style={{
              fontSize: "14px",
              margin: "0 0 6px 0",
              color: textMain,
            }}
          >
            Pinned Sources
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: textSub,
              margin: "0 0 8px 0",
            }}
          >
            Click “Pin” on any article to float that source to the top.
          </p>
          <div style={{ marginBottom: "16px" }}>
            {pinnedSources.length === 0 ? (
              <div style={{ fontSize: "12px", color: textSub }}>
                No pinned sources yet.
              </div>
            ) : (
              pinnedSources.map((domain) => (
                <div
                  key={domain}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                    fontSize: "12px",
                    borderBottom: `1px solid ${cardBorder}`,
                  }}
                >
                  <span>{domain}</span>
                  <button
                    onClick={async () => {
                      const next = pinnedSources.filter((d) => d !== domain);
                      setPinnedSources(next);
                      try {
                        await savePinnedSources(next);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: textSub,
                      fontSize: "13px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bookmarks */}
          <h2
            style={{
              fontSize: "14px",
              margin: "0 0 6px 0",
              color: textMain,
            }}
          >
            Bookmarks
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: textSub,
              margin: "0 0 8px 0",
            }}
          >
            Synced across devices via Firebase.
          </p>
          {!bookmarksLoaded && (
            <div style={{ fontSize: "12px", color: textSub }}>
              Loading bookmarks…
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {bookmarksLoaded && bookmarks.length === 0 && (
              <div style={{ fontSize: "12px", color: textSub }}>
                No bookmarks yet. Click ★ on any article.
              </div>
            )}
            {bookmarks.map((article) => (
              <div
                key={article.id}
                style={{
                  borderRadius: "8px",
                  border: `1px solid ${cardBorder}`,
                  padding: "8px 10px",
                  fontSize: "12px",
                  background: isDark ? "#020617" : "#ffffff",
                  boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: "2px",
                    color: textMain,
                  }}
                >
                  {article.title}
                </div>
                <div
                  style={{
                    color: textSub,
                    marginBottom: "4px",
                  }}
                >
                  {article.source}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "12px",
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    Open
                  </a>
                  <button
                    onClick={() => toggleBookmark(article)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#f87171",
                      fontSize: "12px",
                      padding: 0,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
