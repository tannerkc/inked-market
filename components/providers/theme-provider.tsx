"use client";

import { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("inked-theme");
    return stored === "dark" ? "dark" : "light";
  });

  // Persist to localStorage and sync data-theme attribute
  useEffect(() => {
    localStorage.setItem("inked-theme", mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const isDark = mode === "dark";
  const isLight = mode === "light";

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
}
