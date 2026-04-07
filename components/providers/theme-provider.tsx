"use client";

import { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("inked-theme");
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    }
  }, []);

  // Persist to localStorage and sync data-theme attribute
  useEffect(() => {
    localStorage.setItem("inked-theme", mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
