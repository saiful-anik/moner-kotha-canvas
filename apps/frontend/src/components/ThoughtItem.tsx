import type { Thought } from "@/lib/thoughts";

export function ThoughtItem({ t, isNew }: { t: Thought; isNew?: boolean }) {
  const accentColor = t.mood === "good" ? "var(--ink-blue)" : "var(--ink-red)";
  const width = t.text.length * (t.size * 0.46) + 8;

  return (
    <div
      className="absolute select-none"
      style={{
        left: t.x,
        top: t.y,
        transform: `translate(-50%, -50%) rotate(${t.rot}deg)`,
        opacity: t.opacity,
        animation: isNew ? "thought-in 260ms ease-out" : undefined,
      }}
    >
      <span
        className="relative whitespace-nowrap font-hand text-foreground"
        style={{ fontSize: t.size, lineHeight: 1.2 }}
      >
        {t.text}
        {t.accent === "underline" && (
          <svg
            className="pointer-events-none absolute -bottom-2 left-0"
            width={width}
            height="8"
            viewBox={`0 0 ${width} 8`}
            fill="none"
          >
            <path
              d={`M2 5 Q ${width * 0.3} 1.5 ${width * 0.55} 4.5 T ${width - 3} 3`}
              stroke={accentColor}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
        {t.accent === "scribble" && (
          <svg
            className="pointer-events-none absolute -right-7 -top-2"
            width="26"
            height="16"
            viewBox="0 0 26 16"
            fill="none"
          >
            <path
              d="M2 12 L10 3 L6 12 L15 4 L11 13 L21 5"
              stroke={accentColor}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        )}
        {t.accent === "cross" && (
          <svg
            className="pointer-events-none absolute -left-7 top-0"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M3 3 L13 13 M13 3.5 L3.5 13" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        {t.accent === "circle" && (
          <svg
            className="pointer-events-none absolute -left-3 -top-2"
            width={width + 24}
            height={t.size * 2.2}
            viewBox={`0 0 ${width + 24} ${t.size * 2.2}`}
            fill="none"
          >
            <ellipse
              cx={(width + 24) / 2}
              cy={t.size * 1.1}
              rx={(width + 18) / 2}
              ry={t.size * 0.95}
              stroke={accentColor}
              strokeWidth="1.3"
              opacity="0.55"
              strokeDasharray="2 0"
              transform={`rotate(-1 ${(width + 24) / 2} ${t.size * 1.1})`}
            />
          </svg>
        )}
      </span>
    </div>
  );
}
