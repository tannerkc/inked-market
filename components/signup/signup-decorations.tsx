"use client";

import Image from "next/image";

const decorations = [
  {
    src: "/tattoos/rose-illustration-4-svgrepo-com.svg",
    alt: "Rose",
    w: 130,
    h: 130,
    className: "top-[10%] left-[5%] opacity-[0.05] -rotate-[15deg]",
  },
  {
    src: "/tattoos/bird-of-paradise-svgrepo-com.svg",
    alt: "Bird of Paradise",
    w: 100,
    h: 100,
    className: "top-[18%] right-[8%] opacity-[0.04] rotate-[8deg]",
  },
  {
    src: "/tattoos/ghost-svgrepo-com.svg",
    alt: "Ghost",
    w: 70,
    h: 70,
    className: "bottom-[22%] left-[7%] opacity-[0.045] -rotate-12",
  },
  {
    src: "/tattoos/sailor-tattoo-svgrepo-com.svg",
    alt: "Sailor Tattoo",
    w: 120,
    h: 120,
    className: "bottom-[8%] right-[5%] opacity-[0.05] rotate-[10deg]",
  },
];

export function SignupDecorations() {
  return (
    <>
      {decorations.map((d) => (
        <div key={d.alt} className={`absolute ${d.className} hidden md:block`}>
          <Image
            src={d.src}
            alt=""
            width={d.w}
            height={d.h}
            className="brightness-0"
          />
        </div>
      ))}
    </>
  );
}
