"use client";

import React, { createContext, useContext, useEffect } from "react";
import {
  useThemeEditor,
  type UseThemeEditorReturn,
} from "@/lib/hooks/use-theme-editor";
import type { StudioThemeConfig } from "@/lib/types/builder";

const BuilderContext = createContext<UseThemeEditorReturn | null>(null);

export function useBuilder(): UseThemeEditorReturn {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
}

interface BuilderProviderProps {
  children: React.ReactNode;
  initial?: StudioThemeConfig;
}

export function BuilderProvider({ children, initial }: BuilderProviderProps) {
  const editor = useThemeEditor(initial);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      } else if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        editor.redo();
      } else if (isMod && e.key === "s") {
        e.preventDefault();
        editor.saveDraft();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  return (
    <BuilderContext.Provider value={editor}>{children}</BuilderContext.Provider>
  );
}
