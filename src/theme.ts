// src/theme.ts
export type ThemeMode = "light" | "dark";

export type Theme = {
  background: string;
  surface: string;
  headerBg: string;
  headerBorder: string;
  textMain: string;
  textSub: string;
  cardBorder: string;
  primary: string;
};

export const themes: Record<ThemeMode, Theme> = {
  dark: {
    background: "radial-gradient(circle at top left, #1f2937, #020617)",
    surface: "#020617dd",
    headerBg:
      "linear-gradient(to right, rgba(15,23,42,0.98), rgba(30,64,175,0.98))",
    headerBorder: "#111827",
    textMain: "#e5e7eb",
    textSub: "#9ca3af",
    cardBorder: "#1f2933",
    primary: "#2563eb",
  },
  light: {
    background: "radial-gradient(circle at top left, #eff6ff, #f9fafb)",
    surface: "#ffffffdd",
    headerBg: "linear-gradient(to right, #ffffff, #e5f0ff)",
    headerBorder: "#e5e7eb",
    textMain: "#111827",
    textSub: "#4b5563",
    cardBorder: "#e5e7eb",
    primary: "#2563eb",
  },
};
