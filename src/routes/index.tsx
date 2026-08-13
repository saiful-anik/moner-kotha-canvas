import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { InfoModal } from "@/components/InfoModal";
import { ThoughtItem } from "@/components/ThoughtItem";
import { makeThought, seedThoughts, type Thought } from "@/lib/thoughts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moner Kotha — an infinite wall of anonymous thoughts" },
      {
        name: "description",
        content:
          "Drag across a giant paper wall of tiny anonymous thoughts. Write yours, good or bad, and leave it here.",
      },
      { property: "og:title", content: "Moner Kotha — an infinite wall of anonymous thoughts" },
      {
        property: "og:description",
        content: "A quiet, hand-drawn canvas of anonymous thoughts. No accounts, no likes, no replies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Canvas,
});

const MIN_Z = 0.4;
const MAX_Z = 2.2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function Canvas() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newId, setNewId] = useState<string | null>(null);
  const [cam, setCam] = useState({ x: 0, y: 0, z: 1 });
  const [dragging, setDragging] = useState(false);
  const [info, setInfo] = useState(false);
  const [mood, setMood] = useState<"good" | "bad">("good");
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const camRef = useRef(cam);
  camRef.current = cam;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; d: number } | null>(null);

  useEffect(() => setThoughts(seedThoughts()), []);

  const zoomAt = useCallback((px: number, py: number, next: number) => {
    setCam((c) => {
      const z = clamp(next, MIN_Z, MAX_Z);
      const k = z / c.z;
      return { z, x: px - (px - c.x) * k, y: py - (py - c.y) * k };
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomAt(e.clientX - r.left, e.clientY - r.top, camRef.current.z * Math.exp(-dy * 0.0015));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const center = () => {
    const c = camRef.current;
    return {
      x: (window.innerWidth / 2 - c.x) / c.z,
      y: (window.innerHeight / 2 - c.y) / c.z,
      w: (window.innerWidth * 0.75) / c.z,
      h: (window.innerHeight * 0.6) / c.z,
    };
  };

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDragging(true);
    last.current = null;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const d =
      pts.length > 1 ? Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y) : 0;

    if (last.current) {
      const dx = cx - last.current.x;
      const dy = cy - last.current.y;
      setCam((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
      if (pts.length > 1 && last.current.d > 0) {
        const r = ref.current!.getBoundingClientRect();
        zoomAt(cx - r.left, cy - r.top, camRef.current.z * (d / last.current.d));
      }
    }
    last.current = { x: cx, y: cy, d };
  }

  function endPointer(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    last.current = null;
    if (pointers.current.size === 0) setDragging(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setThoughts((prev) => {
      const nt = makeThought(t, mood, prev, center());
      setNewId(nt.id);
      return [...prev, nt];
    });
    setText("");
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-background">
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        className="dots absolute inset-0 touch-none select-none"
        style={{
          cursor: dragging ? "grabbing" : "grab",
          backgroundPosition: `${cam.x}px ${cam.y}px`,
          backgroundSize: `${24 * cam.z}px ${24 * cam.z}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})` }}
        >
          {thoughts.map((t) => (
            <ThoughtItem key={t.id} t={t} isNew={t.id === newId} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setInfo(true)}
        aria-label="about moner kotha"
        className="paper-edge absolute right-5 top-5 h-11 w-11 -rotate-2 border-[2.5px] border-foreground bg-note font-scrawl text-xl font-bold text-foreground transition-transform duration-100 hover:rotate-2"
        style={{ boxShadow: "3px 3px 0 var(--pencil)" }}
      >
        i
      </button>

      <form
        onSubmit={submit}
        className="paper-edge absolute bottom-5 left-1/2 flex w-[min(560px,calc(100%-2rem))] -translate-x-1/2 flex-wrap items-center gap-2 border-[3px] border-foreground bg-note px-4 py-3"
        style={{ boxShadow: "4px 4px 0 var(--pencil)", transform: "translateX(-50%) rotate(-0.4deg)" }}
      >
        <div className="flex items-center gap-1">
          {(["good", "bad"] as const).map((m, i) => {
            const on = mood === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className="paper-edge-alt px-2.5 py-1 font-hand text-lg transition-transform duration-100 hover:rotate-1"
                style={{
                  transform: `rotate(${i ? 1.5 : -1.5}deg)`,
                  border: on
                    ? `2.5px solid ${m === "good" ? "var(--ink-blue)" : "var(--ink-red)"}`
                    : "2px dashed color-mix(in oklab, var(--pencil) 35%, transparent)",
                  color: on ? (m === "good" ? "var(--ink-blue)" : "var(--ink-red)") : "var(--pencil)",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        <input
          value={text}
          maxLength={150}
          onChange={(e) => setText(e.target.value)}
          placeholder="moner kotha likho..."
          className="paper-edge min-w-[10rem] flex-1 border-[2.5px] border-foreground bg-note px-3 py-1.5 font-hand text-lg text-foreground outline-none placeholder:text-muted-foreground focus:border-ink-blue"
          style={{ boxShadow: "none" }}
        />

        <button
          type="submit"
          className="paper-edge-alt border-[2.5px] border-foreground bg-note px-4 py-1.5 font-hand text-lg text-foreground transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-postit active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          style={{ boxShadow: "4px 4px 0 var(--pencil)" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "2px 2px 0 var(--pencil)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "4px 4px 0 var(--pencil)")}
          onMouseDown={(e) => (e.currentTarget.style.boxShadow = "none")}
          onMouseUp={(e) => (e.currentTarget.style.boxShadow = "2px 2px 0 var(--pencil)")}
        >
          send
        </button>
      </form>

      {info && <InfoModal onClose={() => setInfo(false)} />}
    </main>
  );
}
