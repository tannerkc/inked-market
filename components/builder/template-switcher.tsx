"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { templates, templateList } from "@/lib/data/templates";
import { TemplateSwitchDialog } from "@/components/builder/template-switch-dialog";
import type { TemplateSlug } from "@/lib/types/builder";

export function TemplateSwitcher() {
  const { config, applyTemplate } = useBuilder();
  const [showList, setShowList] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateSlug | null>(
    null,
  );
  const [showDialog, setShowDialog] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const currentTemplate = templates[config.template];

  // Close dropdown on outside click
  useEffect(() => {
    if (!showList) return;
    function handlePointerDown(e: PointerEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    }
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [showList]);

  const handleTemplateSelect = useCallback(
    (slug: TemplateSlug) => {
      if (slug === config.template) {
        setShowList(false);
        return;
      }
      setPendingTemplate(slug);
      setShowList(false);
      setShowDialog(true);
    },
    [config.template],
  );

  const handleConfirm = useCallback(() => {
    if (pendingTemplate) {
      applyTemplate(pendingTemplate);
    }
    setShowDialog(false);
    setPendingTemplate(null);
  }, [pendingTemplate, applyTemplate]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
    setPendingTemplate(null);
  }, []);

  return (
    <>
      <div className="relative" ref={listRef}>
        {/* Current template + Change button */}
        <div className="flex items-center justify-between rounded-lg border border-chrome-border bg-ink-black px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            {/* Color dots for current template */}
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTemplate.previewAccent }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTemplate.previewBg }}
              />
            </div>
            <span className="text-[13px] font-medium text-chrome-text-primary">
              {currentTemplate.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowList((prev) => !prev)}
            className="text-[12px] font-medium text-chrome-text-secondary hover:text-chrome-text-primary transition-colors"
          >
            Change
          </button>
        </div>

        {/* Dropdown list */}
        {showList && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-chrome-border bg-chrome-surface shadow-xl overflow-hidden">
            {templateList.map((tmpl) => {
              const isCurrent = tmpl.slug === config.template;
              return (
                <button
                  key={tmpl.slug}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl.slug)}
                  className={cn(
                    "flex items-center w-full px-3 py-2.5 text-left transition-colors",
                    isCurrent
                      ? "bg-chrome-raised text-chrome-text-primary"
                      : "text-chrome-text-secondary hover:bg-chrome-raised hover:text-chrome-text-primary",
                  )}
                >
                  {/* Color dots */}
                  <div className="flex items-center gap-1 mr-2.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tmpl.previewAccent }}
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tmpl.previewBg }}
                    />
                  </div>

                  {/* Name */}
                  <span className="text-[13px] font-medium flex-1">
                    {tmpl.name}
                  </span>

                  {/* Checkmark for current */}
                  {isCurrent && (
                    <svg
                      className="w-4 h-4 text-ink-red"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      <TemplateSwitchDialog
        isOpen={showDialog}
        targetTemplate={pendingTemplate}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
