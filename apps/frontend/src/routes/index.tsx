import { useCallback, useEffect, useRef, useState } from "react";
import { InfoModal } from "@/components/InfoModal";
import { ThoughtItem } from "@/components/ThoughtItem";
import { api } from "@/lib/api";
import { makeThought, type Thought } from "@/lib/thoughts";

const MIN_Z = 0.4;
const MAX_Z = 2.2;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
type StoredThought = Omit<Thought, "rot" | "opacity"> & { rotation: number; opacity: number };
const fromStored = (thought: StoredThought): Thought => ({ ...thought, rot: thought.rotation, opacity: thought.opacity / 100 });

export function Canvas() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newId, setNewId] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });
  const [dragging, setDragging] = useState(false);
  const [info, setInfo] = useState(false);
  const [mood, setMood] = useState<"good" | "bad">("good");
  const [text, setText] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    api<StoredThought[]>("/api/thoughts").then((rows) => setThoughts(rows.map(fromStored))).catch(() => setThoughts([]));
  }, []);

  const zoomAt = useCallback((x: number, y: number, nextZoom: number) => {
    setCamera((current) => {
      const z = clamp(nextZoom, MIN_Z, MAX_Z);
      const scale = z / current.z;
      return { z, x: x - (x - current.x) * scale, y: y - (y - current.y) * scale };
    });
  }, []);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, cameraRef.current.z * Math.exp(-event.deltaY * 0.0015));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const current = cameraRef.current;
    const thought = makeThought(value, mood, thoughts, {
      x: (rect.width / 2 - current.x) / current.z,
      y: (rect.height / 2 - current.y) / current.z,
      w: (rect.width * 0.75) / current.z,
      h: (rect.height * 0.6) / current.z,
    });
    try {
      const saved = await api<StoredThought>("/api/thoughts", {
        method: "POST",
        body: JSON.stringify({
          text: thought.text,
          mood: thought.mood,
          x: Math.round(thought.x),
          y: Math.round(thought.y),
          rotation: Math.round(thought.rot),
          size: Math.round(thought.size),
          opacity: Math.round(thought.opacity * 100),
          accent: thought.accent,
        }),
      });
      setThoughts((currentThoughts) => [...currentThoughts, fromStored(saved)]);
      setNewId(saved.id);
      setText("");
    } catch {
      // Thoughts are only shown after the Worker confirms they were saved.
    }
  };

  return <main className="fixed inset-0 overflow-hidden bg-background">
    <div ref={canvasRef} className="dots absolute inset-0 touch-none select-none" style={{ cursor: dragging ? "grabbing" : "grab", backgroundPosition: `${camera.x}px ${camera.y}px`, backgroundSize: `${24 * camera.z}px ${24 * camera.z}px` }}
      onPointerDown={(event) => { pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }}
      onPointerMove={(event) => { if (pointer.current?.id !== event.pointerId) return; const dx = event.clientX - pointer.current.x; const dy = event.clientY - pointer.current.y; pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; setCamera((current) => ({ ...current, x: current.x + dx, y: current.y + dy })); }}
      onPointerUp={() => { pointer.current = null; setDragging(false); }} onPointerCancel={() => { pointer.current = null; setDragging(false); }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})` }}>{thoughts.map((thought) => <ThoughtItem key={thought.id} t={thought} isNew={thought.id === newId} />)}</div>
    </div>
    <button onClick={() => setInfo(true)} aria-label="About Moner Kotha" className="paper-edge absolute right-5 top-5 h-11 w-11 -rotate-2 border-[2.5px] border-foreground bg-note font-scrawl text-xl font-bold text-foreground">i</button>
    <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
    <form onSubmit={submit} className="paper-edge flex w-full max-w-[560px] flex-wrap items-center gap-2 border-[3px] border-foreground bg-note px-4 py-3" style={{ boxShadow: "4px 4px 0 var(--pencil)", transform: "rotate(-0.4deg)" }}>
      <div className="flex items-center gap-1">{(["good", "bad"] as const).map((value) => <button key={value} type="button" onClick={() => setMood(value)} className="paper-edge-alt px-2.5 py-1 font-hand text-lg" style={{ border: mood === value ? `2.5px solid ${value === "good" ? "var(--ink-blue)" : "var(--ink-red)"}` : "2px dashed var(--pencil)" }}>{value}</button>)}</div>
      <input value={text} maxLength={150} onChange={(event) => setText(event.target.value)} placeholder="moner kotha likho..." className="paper-edge min-w-[10rem] flex-1 border-[2.5px] border-foreground bg-note px-3 py-1.5 font-hand text-lg text-foreground outline-none" />
      <button type="submit" className="paper-edge-alt border-[2.5px] border-foreground bg-note px-4 py-1.5 font-hand text-lg text-foreground" style={{ boxShadow: "4px 4px 0 var(--pencil)" }}>send</button>
    </form>
    </div>
    {info && <InfoModal onClose={() => setInfo(false)} />}
  </main>;
}
