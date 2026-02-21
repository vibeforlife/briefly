// src/TestSyncPanel.tsx
import { useEffect, useState } from "react";
import { loadTestNote, saveTestNote } from "./services/firestoreTestService";

function TestSyncPanel() {
  const [value, setValue] = useState("");
  const [loadedValue, setLoadedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadTestNote()
      .then((note) => {
        setLoadedValue(note);
        setValue(note);
      })
      .catch((e) => {
        console.error("loadTestNote error", e);
        setError("Failed to load test note");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveTestNote(value);
      setLoadedValue(value);
    } catch (e) {
      console.error("saveTestNote error", e);
      setError("Failed to save test note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #4b5563",
        background: "#020617cc",
        color: "#e5e7eb",
        fontSize: "12px",
        maxWidth: "360px",
      }}
    >
      <div style={{ marginBottom: "6px", fontWeight: 600 }}>
        Firestore sync test (test/owner)
      </div>
      {loading ? (
        <div>Loading note…</div>
      ) : (
        <>
          <div style={{ marginBottom: "6px" }}>
            <div style={{ marginBottom: "2px" }}>Stored value:</div>
            <div
              style={{
                minHeight: "18px",
                padding: "4px 6px",
                borderRadius: "4px",
                background: "#111827",
              }}
            >
              {loadedValue || <span style={{ opacity: 0.6 }}>(empty)</span>}
            </div>
          </div>
          <div style={{ marginBottom: "6px" }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type a note and save…"
              style={{
                width: "100%",
                padding: "4px 6px",
                borderRadius: "4px",
                border: "1px solid #4b5563",
                background: "#020617",
                color: "#e5e7eb",
              }}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid #60a5fa",
              background: "#1d4ed8",
              color: "#f9fafb",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {saving ? "Saving…" : "Save note"}
          </button>
          {error && (
            <div style={{ marginTop: "6px", color: "#fca5a5" }}>{error}</div>
          )}
        </>
      )}
    </div>
  );
}

export default TestSyncPanel;
