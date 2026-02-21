// src/components/ControlsBar.tsx
import type { SourceGroup } from "../data/sourceGroups";
import type { Preset } from "../services/presetService";
import type { ThemeMode } from "../theme";
import { themes } from "../theme";
import styles from "./ControlsBar.module.css";

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

type Props = {
  themeMode: ThemeMode;
  topics: { id: Topic; label: string }[];
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;

  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;

  presets: Preset[];
  showPresetInput: boolean;
  newPresetName: string;
  onPresetNameChange: (value: string) => void;
  onTogglePresetInput: () => void;
  onSavePreset: () => void;
  onApplyPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;

  sourceGroup: SourceGroup;
  hidePaywalled: boolean;
  onChangeSourceGroup: (group: SourceGroup) => void;
  onToggleHidePaywalled: (value: boolean) => void;

  btn: (active: boolean, options?: { subtle?: boolean }) => React.CSSProperties;
};

function ControlsBar({
  themeMode,
  topics,
  selectedTopic,
  onSelectTopic,
  searchTerm,
  onSearchTermChange,
  onSearch,
  presets,
  showPresetInput,
  newPresetName,
  onPresetNameChange,
  onTogglePresetInput,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
  sourceGroup,
  hidePaywalled,
  onChangeSourceGroup,
  onToggleHidePaywalled,
  btn,
}: Props) {
  const theme = themes[themeMode];
  const isDark = themeMode === "dark";

  return (
    <div
      className={styles.wrapper}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.cardBorder}`,
      }}
    >
      {/* Topics */}
      <div className={styles.topicsRow}>
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTopic(t.id)}
            style={btn(selectedTopic === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search row */}
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Search any topic (e.g. India, elections, Gaza)…"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
          className={styles.searchInput}
          style={{
            border: `1px solid ${theme.cardBorder}`,
            background: isDark ? "#020617" : "#ffffff",
            color: theme.textMain,
          }}
        />
        <button style={btn(true)} onClick={onSearch}>
          Search
        </button>
      </div>

      {/* Presets */}
      <div className={styles.presetsRow}>
        <span
          className={styles.presetsLabel}
          style={{ color: theme.textSub }}
        >
          Presets:
        </span>
        {presets.map((p) => (
          <span key={p.id} className={styles.presetChip}>
            <button style={btn(false)} onClick={() => onApplyPreset(p)}>
              {p.name}
            </button>
            <button
              onClick={() => onDeletePreset(p.id)}
              className={styles.presetDelete}
              style={{
                color: isDark ? "#6b7280" : "#9ca3af",
              }}
              title="Delete preset"
            >
              ×
            </button>
          </span>
        ))}
        {showPresetInput ? (
          <span className={styles.presetInputRow}>
            <input
              type="text"
              placeholder="Preset name…"
              value={newPresetName}
              onChange={(e) => onPresetNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSavePreset();
              }}
              className={styles.presetInput}
              style={{
                border: `1px solid ${theme.cardBorder}`,
                background: isDark ? "#020617" : "#ffffff",
                color: theme.textMain,
              }}
              autoFocus
            />
            <button style={btn(true)} onClick={onSavePreset}>
              Save
            </button>
            <button style={btn(false)} onClick={onTogglePresetInput}>
              Cancel
            </button>
          </span>
        ) : (
          <button style={btn(false)} onClick={onTogglePresetInput}>
            + Save current as preset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <span
          className={styles.filtersLabel}
          style={{ color: theme.textSub }}
        >
          Sources:
        </span>
        {(["all", "big", "independent"] as SourceGroup[]).map((g) => (
          <button
            key={g}
            style={btn(sourceGroup === g, { subtle: true })}
            onClick={() => onChangeSourceGroup(g)}
          >
            {g === "all"
              ? "All"
              : g === "big"
              ? "Big outlets"
              : "Independent"}
          </button>
        ))}
        <span
          className={styles.hidePaywall}
          style={{ color: theme.textSub }}
        >
          <input
            type="checkbox"
            id="hidePaywall"
            checked={hidePaywalled}
            onChange={(e) => onToggleHidePaywalled(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <label htmlFor="hidePaywall" style={{ cursor: "pointer" }}>
            Hide likely paywalled
          </label>
        </span>
      </div>
    </div>
  );
}

export default ControlsBar;
