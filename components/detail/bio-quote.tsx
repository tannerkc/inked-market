import React from "react";

interface BioQuoteProps {
  bio: string;
  sentenceCount?: number;
}

function BioQuote({ bio, sentenceCount = 2 }: BioQuoteProps) {
  const excerpt = bio.split(". ").slice(0, sentenceCount).join(". ");

  return (
    <blockquote className="text-[14px] md:text-[15px] text-ink-cream/60 leading-[1.8] italic border-l-2 border-ink-red/35 pl-5 max-w-[420px] relative z-10">
      &ldquo;{excerpt}.&rdquo;
    </blockquote>
  );
}
BioQuote.displayName = "BioQuote";

export { BioQuote };
