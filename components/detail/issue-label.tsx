import React from "react";

interface IssueLabelProps {
  issueNumber: number;
  subtitle: string;
  font: string;
}

function IssueLabel({ issueNumber, subtitle, font }: IssueLabelProps) {
  return (
    <div className="flex items-center gap-2.5 mb-5 relative z-10">
      <span className={`${font} text-xs text-ink-rust`}>
        Issue No. {issueNumber} — {subtitle}
      </span>
      <div className="flex-1 h-px bg-ink-rust/30" />
    </div>
  );
}
IssueLabel.displayName = "IssueLabel";

export { IssueLabel };
