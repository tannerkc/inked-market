"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

export interface UploadDropzoneProps {
  icon?: React.ReactNode;
  label?: string;
  hint?: string;
  onClick?: () => void;
  className?: string;
}

const UploadDropzone = React.forwardRef<HTMLDivElement, UploadDropzoneProps>(
  (
    {
      icon,
      label = "Drop files here or click to upload",
      hint = "JPG or PNG, max 10MB",
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "rounded-xl border-[1.5px] border-dashed p-6 text-center cursor-pointer transition-all hover:border-solid",
          isDark
            ? "border-ink-cream/[0.1] hover:border-ink-cream/20"
            : "border-ink-black/[0.1] hover:border-ink-black/20",
          className
        )}
        {...props}
      >
        {icon || (
          <svg
            className={cn(
              "w-6 h-6 mx-auto mb-2",
              isDark ? "text-ink-cream/15" : "text-ink-black/15"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
        <p
          className={cn(
            "text-[11px]",
            isDark ? "text-ink-cream/30" : "text-ink-black/30"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isDark ? "text-ink-cream/15" : "text-ink-black/15"
          )}
        >
          {hint}
        </p>
      </div>
    );
  }
);
UploadDropzone.displayName = "UploadDropzone";

export { UploadDropzone };
