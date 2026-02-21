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
import layout from "./AppLayout.module.css";
import Header from "./components/Header";
import ControlsBar from "./components/ControlsBar";
import ArticleList from "./components/ArticleList";
import type { ThemeMode } from "./theme";
import { themes } from "./theme";

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
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [pinnedSources, setPinnedSources] = useState<string[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const cache = useRef<Record<string, NewsArticle[]>>({});

  const theme = themes[themeMode];
  const isDark = themeMode === "dark";

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
        console.error("Error loading saved data", e);
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
      ? `1px solid ${isDark ? "#60a5fa" : theme.primary}`
      : `1px solid ${isDark ? "#374151" : theme.cardBorder}`,
    background: active
      ? isDark
        ? "linear-gradient(to right, #1d4ed8, #3b82f6)"
        : theme.primary
      : options?.subtle
      ? "transparent"
      : isDark
      ? "#111827"
      : "#ffffff",
    color: active ? "#f9fafb" : theme.textMain,
    fontSize: "12px",
    cursor: "pointer",
    marginRight: "6px",
    boxShadow: active ? "0 4px 12px rgba(37,99,235,0.45)" : "none",
    transition:
      "background 120ms ease, border-color 120ms ease, box-shadow 120ms ease, color 120ms ease",
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={layout.appRoot}
      style={{
        background: theme.background,
        color: theme.textMain,
      }}
    >
      <Header
        themeMode={themeMode}
        viewMode={viewMode}
        savingBookmarks={savingBookmarks}
        onToggleTheme={() =>
          setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))
        }
        onToggleViewMode={() =>
          setViewMode((prev) => (prev === "compact" ? "comfy" : "compact"))
        }
        onRefresh={() => loadNews(true)}
        onJumpToPinned={() => scrollToSection("pinned-section")}
        onJumpToBookmarks={() => scrollToSection("bookmarks-section")}
        btn={btn}
      />

      <div className={layout.shell}>
        {/* Main */}
        <main
          className={layout.main}
          style={{
            borderRight: `1px solid ${theme.cardBorder}`,
          }}
        >
          <ControlsBar
            themeMode={themeMode}
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSearch={() => loadNews(true)}
            presets={presets}
            showPresetInput={showPresetInput}
            newPresetName={newPresetName}
            onPresetNameChange={setNewPresetName}
            onTogglePresetInput={() => setShowPresetInput((v) => !v)}
            onSavePreset={saveCurrentAsPreset}
            onApplyPreset={applyPreset}
            onDeletePreset={deletePreset}
            sourceGroup={sourceGroup}
            hidePaywalled={hidePaywalled}
            onChangeSourceGroup={setSourceGroup}
            onToggleHidePaywalled={setHidePaywalled}
            btn={btn}
          />

          <ArticleList
            articles={displayedArticles}
            loading={loading}
            error={error}
            viewMode={viewMode}
            themeMode={themeMode}
            isPinned={isPinned}
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
            onTogglePin={togglePin}
          />
        </main>

        {/* Sidebar */}
        <aside
          className={layout.sidebar}
          style={{
            borderLeft: `1px solid ${theme.cardBorder}`,
            background: isDark ? "#020617f5" : "#f9fafb",
          }}
        >

{/* Optional: small label on mobile */}
  <div
    style={{
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "6px",
      color: theme.textSub,
      display: "block",
    }}
  >
    Saved items
  </div>

          {/* Pinned sources */}
          <section id="pinned-section">
            <h2
              style={{
                fontSize: "14px",
                margin: "0 0 6px 0",
                color: theme.textMain,
              }}
            >
              Pinned Sources
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: theme.textSub,
                margin: "0 0 8px 0",
              }}
            >
              Click “Pin” on any article to float that source to the top.
            </p>
            <div style={{ marginBottom: "16px" }}>
              {pinnedSources.length === 0 ? (
                <div style={{ fontSize: "12px", color: theme.textSub }}>
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
                      borderBottom: `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <span>{domain}</span>
                    <button
                      onClick={async () => {
                        const next = pinnedSources.filter(
                          (d) => d !== domain
                        );
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
                        color: theme.textSub,
                        fontSize: "13px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Bookmarks */}
          <section id="bookmarks-section">
            <h2
              style={{
                fontSize: "14px",
                margin: "0 0 6px 0",
                color: theme.textMain,
              }}
            >
              Bookmarks
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: theme.textSub,
                margin: "0 0 8px 0",
              }}
            >
              Synced across devices via Firebase.
            </p>
            {!bookmarksLoaded && (
              <div style={{ fontSize: "12px", color: theme.textSub }}>
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
                <div style={{ fontSize: "12px", color: theme.textSub }}>
                  No bookmarks yet. Click ★ on any article.
                </div>
              )}
              {bookmarks.map((article) => (
                <div
                  key={article.id}
                  style={{
                    borderRadius: "8px",
                    border: `1px solid ${theme.cardBorder}`,
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
                      color: theme.textMain,
                    }}
                  >
                    {article.title}
                  </div>
                  <div
                    style={{
                      color: theme.textSub,
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
                        color: theme.primary,
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
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
