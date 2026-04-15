"use client";

// Re-export from shared source. Mobile sheets and desktop flyouts use the same component.
export { GlobalTabContent as GlobalSheetContent } from "@/components/builder/builder-global-controls";
export { getGlobalTabTitle as getGlobalTitle } from "@/lib/config/builder-toolbar-tabs";
