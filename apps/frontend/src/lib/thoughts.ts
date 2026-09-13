export type Thought = {
  id: string;
  text: string;
  mood: "good" | "bad";
  x: number;
  y: number;
  rot: number;
  size: number;
  opacity: number;
  accent: "none" | "underline" | "scribble" | "circle" | "cross";
};
export const CHAR_W = 9.2;

export function boxOf(t: { text: string; x: number; y: number; size: number }) {
  const w = t.text.length * (CHAR_W * (t.size / 20)) + 24;
  const h = t.size * 1.9;
  return { l: t.x - w / 2, r: t.x + w / 2, t: t.y - h / 2, b: t.y + h / 2 };
}

function overlaps(a: Thought, others: Thought[]) {
  const ba = boxOf(a);
  return others.some((o) => {
    const bo = boxOf(o);
    return !(ba.r < bo.l || ba.l > bo.r || ba.b < bo.t || ba.t > bo.b);
  });
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function accentFor(): Thought["accent"] {
  const r = Math.random();
  if (r < 0.62) return "none";
  if (r < 0.78) return "underline";
  if (r < 0.87) return "scribble";
  if (r < 0.94) return "circle";
  return "cross";
}

export function makeThought(
  text: string,
  mood: "good" | "bad",
  existing: Thought[],
  area: { x: number; y: number; w: number; h: number },
): Thought {
  const size = rand(17, 25);
  let candidate: Thought | null = null;
  for (let i = 0; i < 400; i++) {
    const spread = 1 + i / 120;
    const t: Thought = {
      id: Math.random().toString(36).slice(2),
      text,
      mood,
      x: area.x + rand(-area.w / 2, area.w / 2) * spread,
      y: area.y + rand(-area.h / 2, area.h / 2) * spread,
      rot: rand(-2, 2),
      size,
      opacity: rand(0.72, 1),
      accent: accentFor(),
    };
    if (!overlaps(t, existing)) return t;
    candidate = t;
  }
  return candidate!;
}
