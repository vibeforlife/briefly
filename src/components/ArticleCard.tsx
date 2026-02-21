// src/components/ArticleCard.tsx
import type { NewsArticle } from "../services/newsApiService";
import type { ThemeMode } from "../theme";
import { themes } from "../theme";
import styles from "./ArticleCard.module.css";

type Props = {
  article: NewsArticle;
  themeMode: ThemeMode;
  compact: boolean;
  pinned: boolean;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onTogglePin: () => void;
};

function ArticleCard({
  article,
  themeMode,
  compact,
  pinned,
  bookmarked,
  onToggleBookmark,
  onTogglePin,
}: Props) {
  const theme = themes[themeMode];
  const isDark = themeMode === "dark";

  const handleOpen = () => {
    window.open(article.url, "_blank", "noopener");
  };

  return (
    <div
      className={`${styles.card} ${compact ? styles.compact : styles.comfy}`}
      style={{
        border: pinned
          ? `1px solid ${isDark ? "#60a5fa" : theme.primary}`
          : `1px solid ${theme.cardBorder}`,
        background: pinned
          ? isDark
            ? "#0b1120"
            : "#eff6ff"
          : isDark
          ? "#020617cc"
          : "#ffffffcc",
        boxShadow: pinned
          ? "0 10px 25px rgba(37,99,235,0.4)"
          : "0 8px 20px rgba(15,23,42,0.18)",
      }}
      onClick={handleOpen}
    >
      {!compact && article.imageUrl && (
        <div
          className={styles.imageWrapper}
          style={{ background: isDark ? "#020617" : "#e5e7eb" }}
        >
          <img
            src={article.imageUrl}
            alt=""
            className={styles.image}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className={styles.main}>
        {pinned && (
          <span
            className={styles.pinnedLabel}
            style={{ color: isDark ? "#93c5fd" : theme.primary }}
          >
            ★ Pinned source
          </span>
        )}
        <div
          className={styles.title}
          style={{
            fontSize: compact ? "13px" : "15px",
            color: theme.textMain,
          }}
        >
          {article.title}
        </div>
        <div className={styles.metaRow} style={{ color: theme.textSub }}>
          <span>
            {article.source} •{" "}
            {new Date(article.publishedAt).toLocaleString()}
          </span>
          <span
            className={styles.paywallChip}
            style={{
              border:
                "1px solid " +
                (article.isPaywalled ? "#f97373" : "#4ade80"),
              color: article.isPaywalled ? "#fecaca" : "#bbf7d0",
              background: article.isPaywalled
                ? "rgba(127,29,29,0.4)"
                : "rgba(22,101,52,0.4)",
            }}
          >
            {article.isPaywalled ? "May be paywalled" : "Likely free"}
          </span>
        </div>
      </div>

      <div
        className={`${styles.actions} ${
          compact ? styles.actionsRow : ""
        }`}
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
            border: `1px solid ${theme.primary}`,
            background: theme.primary,
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
            onToggleBookmark();
          }}
          style={{
            fontSize: "12px",
            padding: compact ? "4px 8px" : "4px 10px",
            borderRadius: "999px",
            border: `1px solid ${theme.cardBorder}`,
            background: isDark ? "#020617" : "#ffffff",
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: bookmarked ? "#facc15" : theme.textMain,
          }}
        >
          {bookmarked ? "★" : "☆"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={pinned ? "Unpin this source" : "Pin this source"}
          style={{
            fontSize: "12px",
            padding: compact ? "4px 8px" : "4px 10px",
            borderRadius: "999px",
            border: pinned
              ? `1px solid ${theme.primary}`
              : `1px solid ${theme.cardBorder}`,
            background: pinned
              ? isDark
                ? "#0b1120"
                : "#eff6ff"
              : isDark
              ? "#020617"
              : "#ffffff",
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: pinned ? theme.primary : theme.textMain,
          }}
        >
          {pinned ? "Unpin" : "Pin"}
        </button>
      </div>
    </div>
  );
}

export default ArticleCard;
