import React from "react";
import { EditorPanel } from "@/components/builder/editor-panel";
import { PreviewPane } from "@/components/builder/preview-pane";

export function SplitScreenBuilder() {
  return (
    <div className="flex h-full">
      <EditorPanel />
      <PreviewPane />
    </div>
  );
}
