"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PillToggle } from "./pill-toggle";

interface ThemeToggleProps {
  mode: "light" | "dark";
  onToggle: (mode: "light" | "dark") => void;
  className?: string;
}

const THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(
  ({ mode, onToggle, className }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center", className)}>
      <PillToggle
        options={THEME_OPTIONS}
        value={mode}
        onChange={(v) => onToggle(v as "light" | "dark")}
        isDark={mode === "dark"}
      />
    </div>
  )
);
ThemeToggle.displayName = "ThemeToggle";

export { ThemeToggle };
