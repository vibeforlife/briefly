// src/components/ArticleList.tsx
import type { NewsArticle } from "../services/newsApiService";
import type { ThemeMode } from "../theme";
import { themes } from "../theme";
import ArticleCard from "./ArticleCard";
import styles from "./ArticleList.module.css";

type Props = {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  viewMode: "comfy" | "compact";
  themeMode: ThemeMode;
  isPinned: (article: NewsArticle) => boolean;
  isBookmarked: (article: NewsArticle) => boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  onTogglePin: (url: string) => void;
};

function ArticleList({
  articles,
  loading,
  error,
  viewMode,
  themeMode,
  isPinned,
  isBookmarked,
  onToggleBookmark,
  onTogglePin,
}: Props) {
  const theme = themes[themeMode];
  const isDark = themeMode === "dark";
  const compact = viewMode === "compact";

  return (
    <div
      className={`${styles.list} ${
        compact ? styles.compact : styles.comfy
      }`}
    >
      {loading && (
        <div className={styles.status} style={{ color: theme.textSub }}>
          Loading news…
        </div>
      )}

      {error && (
        <div
          className={styles.status}
          style={{
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

      {!loading && !error && articles.length === 0 && (
        <div
          className={styles.emptyBox}
          style={{
            color: theme.textSub,
            background: isDark ? "#020617dd" : "#f9fafb",
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <strong>No articles found.</strong>
          <br />
          Try:
          <ul className={styles.emptyList}>
            <li>Clearing your search term and pressing Refresh.</li>
            <li>Switching to a different topic.</li>
            <li>Changing Sources to "All".</li>
            <li>Unchecking "Hide likely paywalled".</li>
          </ul>
        </div>
      )}

      {!loading &&
        !error &&
        articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            themeMode={themeMode}
            compact={compact}
            pinned={isPinned(article)}
            bookmarked={isBookmarked(article)}
            onToggleBookmark={() => onToggleBookmark(article)}
            onTogglePin={() => onTogglePin(article.url)}
          />
        ))}
    </div>
  );
}

export default ArticleList;
