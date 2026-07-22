import * as React from "react";

interface InkCursorProps {
  color: string;
  visible: boolean;
}

const InkCursor = React.forwardRef<HTMLDivElement, InkCursorProps>(
  ({ color, visible }, ref) => {
    return (
      <div
        ref={ref}
        className="fixed top-0 left-0 pointer-events-none z-[60]"
        style={{
          willChange: "transform",
          opacity: visible ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      >
        <svg
          width="14"
          height="16"
          viewBox="0 0 14 16"
          style={{ transform: "translate(-7px, -15.5px)" }}
        >
          <path d="M7,15 L2,5 Q2,0 7,0 Q12,0 12,5 Z" fill="#0A0A0A" />
          <line
            x1="7"
            y1="15"
            x2="7"
            y2="7"
            stroke="#F5F0EB"
            strokeWidth="0.8"
          />
          <circle cx="7" cy="15.5" r="1.5" fill={color} />
        </svg>
      </div>
    );
  }
);

InkCursor.displayName = "InkCursor";

export { InkCursor };
