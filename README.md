# Moner Kotha Canvas

Anonymous thoughts on an infinite canvas, built as a pnpm workspace.

## Stack

- Frontend: Vite, React, React Router, React Query, Tailwind CSS
- Backend: Hono on Cloudflare Workers
- Database: Neon Postgres with Drizzle ORM

Authentication and Docker are intentionally not included.

## Development

1. Copy `apps/backend/.dev.vars.example` to `apps/backend/.dev.vars` and set your Neon `DATABASE_URL`.
2. Copy `apps/frontend/.env.example` to `apps/frontend/.env` if the API is not at `http://localhost:8787`.
3. Install dependencies with `pnpm install`.
4. Start both applications with `pnpm dev`.

Use `pnpm db:generate` and `pnpm db:migrate` after changing the database schema. For Cloudflare deployment, add `DATABASE_URL` with `wrangler secret put DATABASE_URL` from `apps/backend`.

---

Build the frontend for a web app called “Moner Kotha” using:

React

Vite

TypeScript

Tailwind CSS

The whole app is a single infinite draggable canvas filled with anonymous thoughts.

Do not create a normal website layout.

No navbar.
No hero section.
No footer.
No cards grid.
No dashboard UI.

The canvas itself is the product.

Visual Direction

Use a hand-drawn sketchbook / paper wall aesthetic.

The UI should feel imperfect, human, casual, emotional, and slightly messy.

Use these colors:

Background: #fdfbf7

Main text: #2d2d2d

Muted: #e5e0d8

Red accent: #ff4d4d

Blue accent: #2d5da1

Optional post-it yellow: #fff9c4

Use:

Kalam for headings / emphasized text

Patrick Hand for thoughts, buttons, inputs, and body text

Avoid normal clean corporate UI.

Everything should feel slightly drawn by hand.

Background

The infinite canvas should look like warm paper.

Use a subtle dotted paper texture:

background-image: radial-gradient(#e5e0d8 1px, transparent 1px);
background-size: 24px 24px;


Keep the texture subtle.

Do not use gradients, glassmorphism, or modern SaaS-style backgrounds.

Infinite Canvas

Make the entire viewport draggable.

Desktop:

click and drag anywhere on empty canvas

cursor becomes grabbing while moving

Mobile:

one-finger drag

smooth touch movement

Optional:

mouse wheel zoom

pinch zoom

The canvas should have no visible edges.

Disable browser scrolling.

Do not let dragging accidentally select text.

The initial camera should start around coordinates 0,0.

Thoughts

Scatter many tiny anonymous sentences around the center of the canvas.

Example thoughts:

ajke mon ta bhalo

i miss someone i shouldn't

finally something went right

kichui bhalo lagtese na

she texted back :)

tired of everything

maybe tomorrow will be better

ajke peaceful lagse

i think i'm healing

ami ar pari na

Thoughts must:

appear at random positions

never overlap

not follow a visible grid

have different small rotations such as -2deg to 2deg

mostly use Patrick Hand

feel like someone casually wrote something on a huge sheet of paper

Do NOT place thoughts inside normal cards.

Most thoughts should simply be text directly on the canvas.

Add very subtle variation such as:

slightly different font sizes

tiny rotation

different opacity

occasional underline

occasional scribble

occasional tiny hand-drawn circle

Do not overdecorate.

The canvas should still feel quiet.

Good / Bad Thoughts

Each thought has:

type Thought = {
  id: string
  text: string
  mood: "good" | "bad"
  x: number
  y: number
}


Good and bad thoughts should be visually different but subtle.

Suggested approach:

Good:

mostly pencil black

occasional blue ballpoint accent

tiny blue underline or mark

Bad:

mostly pencil black

occasional correction-marker red accent

tiny red underline, cross, or scribble

Do NOT make all good thoughts green or all bad thoughts red.

Avoid bright emotional color coding.

Input Area

Place one compact floating input area at the bottom center.

Make it look like a piece of paper or handwritten note sitting over the canvas.

Use:

white or warm-paper background

irregular wobbly border

2px or 3px pencil-black border

hard offset shadow

Example shadow:

box-shadow: 4px 4px 0px #2d2d2d;


Do not use soft shadows.

Use an irregular border radius, for example:

border-radius:
255px 15px 225px 15px /
15px 225px 15px 255px;


Input contains:

Good / Bad selector

text input

send button

Placeholder:

moner kotha likho...

Max characters:

150

Good / Bad Selector

Make it feel hand-made.

Options:

good
bad

Selected good:

blue hand-drawn underline / border

Selected bad:

red hand-drawn underline / border

Avoid standard polished segmented controls.

Use slightly irregular borders and tiny rotation differences.

Text Input

Use Patrick Hand.

White background.

Wobbly border.

Focus:

blue border

subtle blue ring

Do not use normal Tailwind rounded-xl styling.

The border should look imperfect.

Send Button

Make the send button look hand-drawn.

Use:

thick pencil border

irregular shape

hard offset shadow

Patrick Hand font

Normal:

box-shadow: 4px 4px 0 #2d2d2d;


Hover:

move 2px right/down

shadow becomes 2px 2px

optional red background

Active:

move 4px right/down

remove shadow completely

It should feel physically pressed.

Posting Interaction

Frontend demo only.

When submitting:

prevent empty text

create a new thought

place it randomly somewhere around the currently visible area

check nearby thought bounding boxes

retry placement if overlapping

give it a random rotation between -2deg and 2deg

fade it in subtly

clear the input

Store data only in React state for now.

No backend.

No editing.

No deleting.

No reactions.

No comments.

Info Button

Place a small handwritten-style i button in the top-right.

It should look like somebody drew a rough circle around the letter.

Use:

irregular circular border

pencil-black stroke

tiny rotation

hard shadow only if needed

Click opens a modal.

Info Modal

Make the modal look like a piece of paper taped onto the screen.

Use:

warm white background

wobbly pencil border

hard offset shadow

slight rotation, around -1deg

small translucent tape strip at the top

Heading:

Moner Kotha

Use Kalam bold.

Body:

A place to leave something that's on your mind.

Choose whether it's good or bad, write it down, and leave it here.

No accounts.
No likes.
No replies.
No editing.

Once you post something, it becomes a tiny piece of this wall.

Close with:

outside click

Escape

small hand-drawn X button

Hand-Drawn Details

Use these carefully:

tiny dashed scribbles

short hand-drawn arrows

rough circles

imperfect underlines

tiny tape pieces

random 1–2 degree rotations

hard offset shadows

Do not spam decorations.

The thoughts themselves should remain the main visual content.

Motion

Animations should be fast and subtle.

Use:

transition-transform duration-100


Hover interactions can use tiny rotations like:

hover:rotate-1


New thoughts can use:

opacity 0 → 1

scale 0.96 → 1

Avoid large animations.

The site should feel calm, not cartoonish.

Important

Do not accidentally turn this into a generic landing page.

The final experience should feel like:

a giant messy notebook page floating in space, filled with tiny things strangers wanted to get off their chest.

Prioritize:

infinite canvas feel

typography

natural spacing

hand-drawn imperfection

smooth dragging

Keep everything else minimal.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
