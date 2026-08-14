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

const SEED_TEXTS: Array<{ text: string; mood: "good" | "bad" }> = [
  { text: "ajke mon ta bhalo", mood: "good" },
  { text: "i miss someone i shouldn't", mood: "bad" },
  { text: "finally something went right", mood: "good" },
  { text: "kichui bhalo lagtese na", mood: "bad" },
  { text: "she texted back :)", mood: "good" },
  { text: "tired of everything", mood: "bad" },
  { text: "maybe tomorrow will be better", mood: "good" },
  { text: "ajke peaceful lagse", mood: "good" },
  { text: "i think i'm healing", mood: "good" },
  { text: "ami ar pari na", mood: "bad" },
  { text: "cha khete ichhe korche", mood: "good" },
  { text: "nobody asked how i was", mood: "bad" },
  { text: "the sky looked kind today", mood: "good" },
  { text: "amar ghum ashe na", mood: "bad" },
  { text: "i laughed for real", mood: "good" },
  { text: "everything feels heavy", mood: "bad" },
  { text: "ma call korechilo", mood: "good" },
  { text: "i keep pretending i'm fine", mood: "bad" },
  { text: "walked home slowly", mood: "good" },
  { text: "bhitore fanka lage", mood: "bad" },
  { text: "someone smiled at me", mood: "good" },
  { text: "i wish i said it back", mood: "bad" },
  { text: "chotto ekta jinis bhalo laglo", mood: "good" },
  { text: "still overthinking at 3am", mood: "bad" },
  { text: "old song, old memory", mood: "bad" },
  { text: "i finished the thing :)", mood: "good" },
  { text: "brishti holo ajke", mood: "good" },
  { text: "i don't want to explain again", mood: "bad" },
  { text: "amar kono kotha nei", mood: "bad" },
  { text: "small joy, still joy", mood: "good" },
];

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

export function seedThoughts(): Thought[] {
  const out: Thought[] = [];
  const pool = [...SEED_TEXTS, ...SEED_TEXTS.map((s) => ({ ...s }))].slice(0, 44);
  for (const s of pool) {
    out.push(makeThought(s.text, s.mood, out, { x: 0, y: 0, w: 1700, h: 1200 }));
  }
  return out;
}
