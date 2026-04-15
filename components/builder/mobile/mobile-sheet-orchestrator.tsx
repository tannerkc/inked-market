"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";

/* ── State ── */

interface MobileSheetState {
  isOpen: boolean;
  type: "section" | "global" | null;
  sectionId: string | null;
  globalTab: string | null;
}

const initialState: MobileSheetState = {
  isOpen: false,
  type: null,
  sectionId: null,
  globalTab: null,
};

/* ── Actions ── */

type MobileSheetAction =
  | { type: "OPEN_SECTION"; sectionId: string }
  | { type: "OPEN_GLOBAL"; tab: string }
  | { type: "CLOSE" };

function sheetReducer(
  state: MobileSheetState,
  action: MobileSheetAction,
): MobileSheetState {
  switch (action.type) {
    case "OPEN_SECTION":
      // Toggle close if same section
      if (state.isOpen && state.type === "section" && state.sectionId === action.sectionId) {
        return initialState;
      }
      return {
        isOpen: true,
        type: "section",
        sectionId: action.sectionId,
        globalTab: null,
      };

    case "OPEN_GLOBAL":
      // Toggle close if same tab
      if (state.isOpen && state.type === "global" && state.globalTab === action.tab) {
        return initialState;
      }
      return {
        isOpen: true,
        type: "global",
        sectionId: null,
        globalTab: action.tab,
      };

    case "CLOSE":
      return initialState;

    default:
      return state;
  }
}

/* ── Context ── */

interface MobileSheetContextValue {
  state: MobileSheetState;
  openSection: (sectionId: string) => void;
  openGlobal: (tab: string) => void;
  close: () => void;
}

const MobileSheetContext = createContext<MobileSheetContextValue | null>(null);

export function MobileSheetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sheetReducer, initialState);

  const openSection = useCallback(
    (sectionId: string) => dispatch({ type: "OPEN_SECTION", sectionId }),
    [],
  );
  const openGlobal = useCallback(
    (tab: string) => dispatch({ type: "OPEN_GLOBAL", tab }),
    [],
  );
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);

  return (
    <MobileSheetContext.Provider value={{ state, openSection, openGlobal, close }}>
      {children}
    </MobileSheetContext.Provider>
  );
}

export function useMobileSheet(): MobileSheetContextValue {
  const ctx = useContext(MobileSheetContext);
  if (!ctx) throw new Error("useMobileSheet must be used inside MobileSheetProvider");
  return ctx;
}
