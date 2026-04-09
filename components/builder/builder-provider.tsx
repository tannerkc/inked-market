"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  useThemeEditor,
  type UseThemeEditorReturn,
} from "@/lib/hooks/use-theme-editor";
import type { StudioThemeConfig } from "@/lib/types/builder";
import { useStudio } from "@/lib/providers/studio-provider";
import type { StudioData } from "@/lib/repositories";

interface BuilderContextValue extends UseThemeEditorReturn {
  replayKey: number;
  triggerReplay: () => void;
  studio: StudioData | null;
  useMockData: boolean;
  toggleMockData: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilder(): BuilderContextValue {
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
  const { studio } = useStudio();
  const [replayKey, setReplayKey] = useState(0);
  const triggerReplay = useCallback(() => setReplayKey((k) => k + 1), []);
  const [useMockData, setUseMockData] = useState(false);
  const toggleMockData = useCallback(() => setUseMockData((v) => !v), []);

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
    <BuilderContext.Provider value={{ ...editor, replayKey, triggerReplay, studio, useMockData, toggleMockData }}>
      {children}
    </BuilderContext.Provider>
  );
}
