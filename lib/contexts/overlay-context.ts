"use client";

import { createContext, useContext } from "react";

export const OverlayContext = createContext<HTMLElement | null>(null);

export function useOverlayContainer(): HTMLElement | null {
  return useContext(OverlayContext);
}
