import { useEffect } from "react";

export function InfoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/15 px-4"
      onPointerDown={onClose}
    >
      <div
        className="paper-edge relative max-w-md border-[3px] border-foreground bg-note p-7 pt-9 font-hand text-foreground"
        style={{ transform: "rotate(-1deg)", boxShadow: "6px 6px 0 var(--pencil)" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="tape absolute -top-4 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-2" />
        <button
          onClick={onClose}
          aria-label="close"
          className="absolute right-3 top-2 font-hand text-2xl leading-none text-foreground transition-transform duration-100 hover:rotate-6"
        >
          ✕
        </button>
        <h1 className="font-scrawl text-3xl font-bold">Moner Kotha</h1>
        <p className="mt-3 text-lg leading-snug">
          A place to leave something that&apos;s on your mind.
        </p>
        <p className="mt-2 text-lg leading-snug">
          Choose whether it&apos;s good or bad, write it down, and leave it here.
        </p>
        <p className="mt-3 text-lg leading-tight text-muted-foreground">
          No accounts.
          <br />
          No likes.
          <br />
          No replies.
          <br />
          No editing.
        </p>
        <p className="mt-3 text-lg leading-snug">
          Once you post something, it becomes a tiny piece of this wall.
        </p>
      </div>
    </div>
  );
}
