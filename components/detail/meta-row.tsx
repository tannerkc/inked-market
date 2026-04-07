import React from "react";

interface MetaRowProps {
  children: React.ReactNode;
}

function MetaRow({ children }: MetaRowProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.12em] text-ink-cream/35 uppercase mb-5 relative z-10">
      {children}
    </div>
  );
}
MetaRow.displayName = "MetaRow";

function MetaItem({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}
MetaItem.displayName = "MetaItem";

function MetaHighlight({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-red">{children}</span>;
}
MetaHighlight.displayName = "MetaHighlight";

export { MetaRow, MetaItem, MetaHighlight };
