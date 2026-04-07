import { Permanent_Marker } from "next/font/google";

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
});

/** @deprecated Use HeroHeading from hero-heading.tsx (mixed tattoo fonts) instead */
export function HeroHeadingDeprecated() {
  return (
    <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-ink-black leading-tight ${permanentMarker.className}`}>
      Discover Your Next
      <span className="text-ink-red"> Tattoo Artist</span>
    </h1>
  );
}
