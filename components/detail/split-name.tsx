import React from "react";

interface SplitNameProps {
  name: string;
  primaryFont: string;
  accentFont: string;
  splitAt?: "first" | "last";
}

function SplitName({
  name,
  primaryFont,
  accentFont,
  splitAt = "first",
}: SplitNameProps) {
  const words = name.split(" ");
  const primary =
    splitAt === "first" ? words[0] : words.slice(0, -1).join(" ");
  const accent =
    splitAt === "first" ? words.slice(1).join(" ") : words.slice(-1).join(" ");

  return (
    <h1 className="relative z-10 leading-[1.05] mb-1.5">
      <span
        className={`${primaryFont} text-[clamp(36px,5vw,56px)] text-ink-cream`}
      >
        {primary}{" "}
      </span>
      <span
        className={`${accentFont} text-[clamp(36px,5vw,56px)] text-ink-red text-glow-red`}
      >
        {accent}
      </span>
    </h1>
  );
}
SplitName.displayName = "SplitName";

export { SplitName };
