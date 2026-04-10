"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  StudioThemeConfig,
  ResolvedThemeVars,
  ThemePreset,
  TemplateSlug,
  Vibe,
} from "@/lib/types/builder";
import { defaultThemeConfig, themePresets } from "@/lib/data/theme-presets";
import { templates } from "@/lib/data/templates";
import { vibeOptions } from "@/lib/data/builder-options";
import { resolveTheme } from "@/lib/utils/resolve-theme";

const MAX_HISTORY = 50;
const STORAGE_KEY = "inked-builder-draft";

export interface UseThemeEditorReturn {
  config: StudioThemeConfig;
  resolvedVars: ResolvedThemeVars;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  applyChange: (partial: Partial<StudioThemeConfig>) => void;
  applyPreset: (preset: ThemePreset) => void;
  applyTemplate: (slug: TemplateSlug) => void;
  applyVibe: (vibe: Vibe) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  saveDraft: () => void;
  loadDraft: () => StudioThemeConfig | null;
}

export function useThemeEditor(
  initial?: StudioThemeConfig,
): UseThemeEditorReturn {
  const startConfig = initial ?? defaultThemeConfig;

  const [config, setConfig] = useState<StudioThemeConfig>(startConfig);
  const [history, setHistory] = useState<StudioThemeConfig[]>([startConfig]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [savedConfig, setSavedConfig] = useState<StudioThemeConfig | null>(
    null,
  );

  const resolvedVars = useMemo(() => resolveTheme(config), [config]);

  const isDirty = useMemo(() => {
    if (!savedConfig) return historyIndex > 0;
    return JSON.stringify(config) !== JSON.stringify(savedConfig);
  }, [config, savedConfig, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushHistory = useCallback(
    (newConfig: StudioThemeConfig) => {
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        const next = [...truncated, newConfig];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
      setHistoryIndex((prev) => {
        const newIndex = prev + 1;
        return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
      });
      setConfig(newConfig);
    },
    [historyIndex],
  );

  const applyChange = useCallback(
    (partial: Partial<StudioThemeConfig>) => {
      const newConfig = { ...config, ...partial };
      pushHistory(newConfig);
    },
    [config, pushHistory],
  );

  const applyPreset = useCallback(
    (preset: ThemePreset) => {
      const presetDef = themePresets[preset];
      const newConfig: StudioThemeConfig = {
        ...defaultThemeConfig,
        preset,
        headingFont: config.headingFont,
        bodyFont: config.bodyFont,
        heroLayout: config.heroLayout,
        galleryLayout: config.galleryLayout,
        galleryPhotosPerArtist: config.galleryPhotosPerArtist,
        detailsLayout: config.detailsLayout,
        footerLayout: config.footerLayout,
        tagStyle: config.tagStyle,
        builderMode: config.builderMode,
        builderTier: config.builderTier,
        vibe: config.vibe,
        density: config.density,
        borderShape: config.borderShape,
        dividerStyle: config.dividerStyle,
        animationStyle: config.animationStyle,
        surfaceTexture: config.surfaceTexture,
        textureOpacity: config.textureOpacity,
        imageTreatment: config.imageTreatment,
        headingLetterSpacing: config.headingLetterSpacing,
        headingTextTransform: config.headingTextTransform,
        headingFontWeight: config.headingFontWeight,
        gradientDirection: config.gradientDirection,
        glowIntensity: config.glowIntensity,
        logoUrl: config.logoUrl,
        logoPlacement: config.logoPlacement,
        galleryWatermarks: config.galleryWatermarks,
        customSocialPreview: config.customSocialPreview,
        accentColor: undefined,
        backgroundColor: undefined,
        backgroundMode: presetDef.mode,
      };
      pushHistory(newConfig);
    },
    [config, pushHistory],
  );

  const applyVibe = useCallback(
    (vibe: Vibe) => {
      const vibeDef = vibeOptions.find((v) => v.value === vibe);
      if (!vibeDef) return;
      const newConfig: StudioThemeConfig = {
        ...config,
        vibe,
        density: vibeDef.defaults.density,
        borderShape: vibeDef.defaults.borderShape,
        dividerStyle: vibeDef.defaults.dividerStyle,
        animationStyle: vibeDef.defaults.animationStyle,
        imageTreatment: vibeDef.defaults.imageTreatment,
        surfaceTexture: vibeDef.defaults.surfaceTexture,
        headingTextTransform: vibeDef.defaults.headingTextTransform,
        headingLetterSpacing: vibeDef.defaults.headingLetterSpacing,
        headingFontWeight: vibeDef.defaults.headingFontWeight,
        tagStyle: vibeDef.defaults.tagStyle,
        ctaStyle: vibeDef.defaults.ctaStyle,
      };
      pushHistory(newConfig);
    },
    [config, pushHistory],
  );

  const applyTemplate = useCallback(
    (slug: TemplateSlug) => {
      const tmpl = templates[slug];
      const newConfig: StudioThemeConfig = {
        ...tmpl.defaults,
        builderMode: config.builderMode,
        builderTier: config.builderTier,
      };
      pushHistory(newConfig);
    },
    [config, pushHistory],
  );

  const undo = useCallback(() => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setConfig(history[newIndex]);
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setConfig(history[newIndex]);
  }, [canRedo, historyIndex, history]);

  const reset = useCallback(() => {
    const resetConfig: StudioThemeConfig = {
      ...defaultThemeConfig,
      builderMode: config.builderMode,
      builderTier: "flash",
      vibe: "void",
      density: "balanced",
      borderShape: "rounded",
      dividerStyle: "solid",
      animationStyle: "fade-up",
      surfaceTexture: "none",
      imageTreatment: "none",
      headingLetterSpacing: "normal",
      headingTextTransform: "uppercase",
      headingFontWeight: "bold",
      gradientDirection: "none",
      glowIntensity: "none",
    };
    pushHistory(resetConfig);
  }, [config.builderMode, pushHistory]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSavedConfig(config);
    } catch {
      // localStorage may be unavailable
    }
  }, [config]);

  const loadDraft = useCallback((): StudioThemeConfig | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as StudioThemeConfig;
      setSavedConfig(parsed);
      return parsed;
    } catch {
      return null;
    }
  }, []);

  return {
    config,
    resolvedVars,
    isDirty,
    canUndo,
    canRedo,
    applyChange,
    applyPreset,
    applyTemplate,
    applyVibe,
    undo,
    redo,
    reset,
    saveDraft,
    loadDraft,
  };
}
