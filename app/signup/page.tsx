import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { TypeCard } from "@/components/signup";

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-sage">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-red">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="m2 2 7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-rust">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function SignupPage() {
  return (
    <div className="text-center pointer-events-none">
      <Eyebrow text="Get Inked" color="red" />

      <Headline
        variant="mixed"
        words={[
          { text: "Join", font: "pirata" },
          { text: "The", font: "marker", color: "text-ink-red" },
          { text: "Scene", font: "cook", color: "text-ink-black" },
        ]}
      />

      <Subtitle text="Choose your path. You can always change this later." className="mb-8" />

      <div className="flex flex-col gap-2.5 pointer-events-auto">
        <TypeCard
          href="/signup/customer"
          icon={<SearchIcon />}
          iconColor="sage"
          title="Tattoo Collector"
          description="Find artists, save inspo, book sessions"
          features={["Browse", "Save", "Book"]}
        />
        <TypeCard
          href="/signup/artist"
          icon={<PenIcon />}
          iconColor="red"
          title="Tattoo Artist"
          description="Showcase your portfolio, get discovered, grow your client base"
          features={["Portfolio", "Discover", "Bookings"]}
        />
        <TypeCard
          href="/signup/studio"
          icon={<HouseIcon />}
          iconColor="rust"
          title="Studio Owner"
          description="List your studio, manage artists, attract new clients"
          features={["Listing", "Team", "Analytics"]}
        />
      </div>

      <p className="font-mono text-xs tracking-[0.15em] text-ink-black/30 pt-7 pointer-events-auto">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
