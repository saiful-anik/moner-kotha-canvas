# Hyperframes Composition Brief: Moner Kotha Canvas

## Objective

Create a short launch-style brag video for Moner Kotha Canvas.

## Output

- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material

- Project root: `D:\Projects\moner-kotha-canvas`
- Primary files read: `README.md`, `apps/frontend/index.html`, `apps/frontend/src/App.tsx`, `apps/frontend/src/styles.css`
- Product name: Moner Kotha
- Tagline / strongest claim: “A place to leave something that’s on your mind.”
- Key UI or visual moment to recreate: the hand-drawn bottom composer adding “maybe tomorrow will be better” to the dotted infinite thought wall.
- Copy that must appear verbatim:
  - `moner kotha likho...`
  - `put it here ↗`
  - `no accounts. no likes. no replies.`

## Creative Direction

- Tone preset: polished
- Creative direction: a warm, handcrafted quiet-product film
- Interpretation: restrained movement and tactile paper details, never conventional SaaS chrome.
- Angle: a private thought becomes a tiny, lasting part of a shared anonymous wall.
- Hook: “some thoughts just need somewhere to go.”
- Outro / punchline: “leave it here.” then the product promise.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Any polished-card redesign that loses the handmade visual language

## Visual Identity

- Background: `#fdfbf7` with `radial-gradient(#e5e0d8 1px, transparent 1px)` at 24px
- Text: `#2d2d2d`
- Accent: `#2d5da1`, `#ff4d4d`, `#fff9c4`
- Display font: Kalam (fallback cursive)
- Body font: Patrick Hand (fallback cursive)
- Visual references from the project: dotted paper, hand-written rotated thoughts, wobbly outline, hard pencil shadow, blue/red emotional markings.

## Storyboard

Use the storyboard in `../brag-plan.md` as the creative contract.

1. A place to put it — 4s — a single thought lands on an empty paper wall.
2. The wall — 5s — scattered real product-style thought copy creates an infinite canvas.
3. Put it here — 6s — mood selection, typing, button press, and posted thought.
4. Leave it here — 5s — the full wall holds with the Moner Kotha promise.

## Audio

- Audio role: warm bed with sparse professional accents.
- Audio arc: an inviting low bed grows slightly into the post interaction and fades under the final promise.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`.
- Music treatment: volume around 0.28, gentle entry and fade under the final scene.
- Music cue guidance: bundled preset copied to `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; target 8.74s, 13.11s, and 17.47s only when they preserve readable holds.
- Audio-reactive treatment: subtle paper warmth and thought presence; no waveform/equalizer treatment.
- Audio-coupled moments:
  - thought arrival — `drop_001.ogg`
  - composer press — `click_002.ogg`
  - final wordmark — `bong_001.ogg`
- SFX selection guidance: warm and restrained; no sharp or busy sounds.
- Exact files are local in `assets/sfx/interface/`.

## Hyperframes Instructions

Use a standalone, seekable GSAP composition with timed clips. Keep all text readable and show actual product UI/copy. Use local assets only, run `npx hyperframes check` before rendering, and hold the strongest product frame at the end for poster selection.
