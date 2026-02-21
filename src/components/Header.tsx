// src/components/Header.tsx
import type { ThemeMode } from "../theme";
import { themes } from "../theme";
import styles from "./Header.module.css";

type Props = {
  themeMode: ThemeMode;
  viewMode: "comfy" | "compact";
  savingBookmarks: boolean;
  onToggleTheme: () => void;
  onToggleViewMode: () => void;
  onRefresh: () => void;
  onJumpToPinned: () => void;
  onJumpToBookmarks: () => void;
  btn: (active: boolean, options?: { subtle?: boolean }) => React.CSSProperties;
};

function Header({
  themeMode,
  viewMode,
  savingBookmarks,
  onToggleTheme,
  onToggleViewMode,
  onRefresh,
  onJumpToPinned,
  onJumpToBookmarks,
  btn,
}: Props) {
  const theme = themes[themeMode];
  const isDark = themeMode === "dark";

  return (
    <header
      className={styles.header}
      style={{
        borderBottom: `1px solid ${theme.headerBorder}`,
        background: theme.headerBg,
        color: isDark ? "#f9fafb" : "#111827",
      }}
    >
      <div className={styles.titleBlock}>
        <h1 className={styles.title} style={{ color: isDark ? "#f9fafb" : "#111827" }}>
          Briefly4U
        </h1>
        <p
          className={styles.subtitle}
          style={{ color: isDark ? "#e5e7eb" : "#374151" }}
        >
          Curated headlines from mainstream and independent sources.
        </p>
      </div>

      <div className={styles.controls}>
        <button
          style={btn(false, { subtle: true })}
          onClick={onJumpToPinned}
        >
          Pinned
        </button>
        <button
          style={btn(false, { subtle: true })}
          onClick={onJumpToBookmarks}
        >
          Bookmarks
        </button>

        <button
          style={btn(false, { subtle: true })}
          onClick={onToggleTheme}
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button
          style={btn(viewMode === "compact", { subtle: true })}
          onClick={onToggleViewMode}
        >
          {viewMode === "compact" ? "Comfy view" : "Compact view"}
        </button>
        {savingBookmarks && (
          <span
            style={{
              fontSize: "11px",
              color: isDark ? "#e5e7eb" : "#4b5563",
            }}
          >
            Saving…
          </span>
        )}
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.7)",
            background: isDark ? "rgba(15,23,42,0.85)" : themes.light.primary,
            color: "#e5e7eb",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
          onClick={onRefresh}
        >
          Refresh news
        </button>
      </div>
    </header>
  );
}

export default Header;
