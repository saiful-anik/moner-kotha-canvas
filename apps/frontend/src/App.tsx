import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, PointerEvent, WheelEvent } from 'react'
import { api } from './lib/api'

type Mood = 'good' | 'bad'
type Accent = 'none' | 'underline' | 'scribble' | 'circle' | 'cross'
type Thought = { id: string; text: string; mood: Mood; x: number; y: number; rotation: number; size: number; width: number; align: 'left' | 'center' | 'right'; accent: Accent; fresh?: boolean }
type StoredThought = Omit<Thought, 'align' | 'fresh'> & { alignment: Thought['align']; opacity: number; createdAt: string }

const accentStyles: Record<Accent, number> = { none: 0, underline: 3, scribble: 6, circle: 12, cross: 15 }
const accents: Accent[] = ['none', 'underline', 'scribble', 'circle', 'cross']
const toThought = (thought: StoredThought): Thought => ({ ...thought, align: thought.alignment })

const between = (min:number, max:number) => Math.random() * (max-min) + min
const collides = (x:number, y:number, text:string, thoughts:Thought[]) => thoughts.some(t => Math.abs(t.x-x) < (text.length * 4.3 + t.text.length * 4.3 + 54) && Math.abs(t.y-y) < 52)
const noteWidth = (text: string, fontSize: number) => Math.max(fontSize * 3, Math.ceil(fontSize * Math.sqrt(text.length * 0.9)))

export default function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [mood, setMood] = useState<Mood>('good')
  const [text, setText] = useState('')
  const [camera, setCamera] = useState({x: 0, y: 0})
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [info, setInfo] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const drag = useRef<{x:number;y:number;cx:number;cy:number}|null>(null)

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setInfo(false)
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [])

  useEffect(() => {
    api<StoredThought[]>('/api/thoughts').then(rows => setThoughts(rows.map(toThought))).catch(() => setNotice('Could not load the thought wall. Please try again shortly.'))
  }, [])

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button,input,form,.modal')) return
    drag.current = { x:e.clientX, y:e.clientY, cx:camera.x, cy:camera.y }
    setDragging(true); e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moveDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    setCamera({ x: drag.current.cx + e.clientX-drag.current.x, y: drag.current.cy + e.clientY-drag.current.y })
  }
  const endDrag = () => { drag.current=null; setDragging(false) }
  const zoomCanvas = (e: WheelEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button,input,form,.modal')) return
    e.preventDefault()
    const next = Math.max(.55, Math.min(2.2, zoom * (e.deltaY > 0 ? .9 : 1.1)))
    const px = e.clientX - window.innerWidth / 2
    const py = e.clientY - window.innerHeight / 2
    setCamera({ x: px - (px - camera.x) * next / zoom, y: py - (py - camera.y) * next / zoom })
    setZoom(next)
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const clean=text.trim(); if(!clean) return
    let x=between(-window.innerWidth/2-camera.x,window.innerWidth/2-camera.x), y=between(-window.innerHeight/2-camera.y+50,window.innerHeight/2-camera.y-90), tries=0
    while(collides(x,y,clean,thoughts) && tries++<80) { x=between(-window.innerWidth/2-camera.x,window.innerWidth/2-camera.x); y=between(-window.innerHeight/2-camera.y+50,window.innerHeight/2-camera.y-90) }
    const thought: Omit<StoredThought, 'id' | 'createdAt'> = { text:clean, mood, x:Math.round(x), y:Math.round(y), rotation:Math.round(between(-2,2)), size:Math.floor(between(17,31)), width:Math.floor(between(145,241)), alignment:(['left', 'center', 'right'] as const)[Math.floor(between(0,3))], opacity:88, accent:accents[Math.floor(between(0, accents.length))] }
    setIsSubmitting(true); setNotice('')
    try {
      const saved = await api<StoredThought>('/api/thoughts', { method:'POST', body:JSON.stringify(thought) })
      setThoughts(old => [...old, { ...toThought(saved), fresh:true }]); setText('')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not post your thought. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  return <main className={`wall ${dragging ? 'is-dragging' : ''}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={zoomCanvas}>
    <div className="canvas" style={{transform:`translate(${camera.x}px, ${camera.y}px) scale(${zoom})`}}>
      {thoughts.map(t => <p key={t.id} className={`thought ${t.mood} s${accentStyles[t.accent]} ${t.fresh ? 'fresh' : ''}`} style={{ left:`calc(50% + ${t.x}px)`, top:`calc(50% + ${t.y}px)`, fontSize:`${t.size}px`, maxWidth:`${noteWidth(t.text, t.size)}px`, textAlign:t.align, '--thought-rotation': `${t.rotation}deg` } as CSSProperties}>{t.text}</p>)}
    </div>
    <div className="brand-mark" aria-label="Moner Kotha"><span>Moner Kotha</span><i /></div>
    <button className="info-button" aria-label="What is Moner Kotha?" onClick={()=>setInfo(true)}>i</button>
    <form className="composer" onSubmit={submit} onPointerDown={e=>e.stopPropagation()}>
      <div className="mood-picker" aria-label="Mood">
        <button type="button" className={mood==='good'?'selected good-choice':''} onClick={()=>setMood('good')} aria-label="Positive mood" title="Positive mood">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M8.5 14c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2M9 9.5h.01M15 9.5h.01" /></svg>
        </button>
        <button type="button" className={mood==='bad'?'selected bad-choice':''} onClick={()=>setMood('bad')} aria-label="Heavy mood" title="Heavy mood">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M8.5 16c.9-1.3 2.1-2 3.5-2s2.6.7 3.5 2M9 9.5h.01M15 9.5h.01" /></svg>
        </button>
      </div>
      <input value={text} onChange={e=>setText(e.target.value)} maxLength={150} placeholder="moner kotha likho..." aria-label="Write a thought" />
      <button className="send" type="submit" disabled={isSubmitting}>{isSubmitting ? 'posting...' : 'put it here ↗'}</button>
      <small>{text.length}/150</small>
    </form>
    {notice && <p className="notice" role="status">{notice}</p>}
    {info && <div className="overlay" onPointerDown={()=>setInfo(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="info-title" onPointerDown={e=>e.stopPropagation()}>
      <div className="tape" /><button className="close" onClick={()=>setInfo(false)} aria-label="Close">×</button>
      <h1 id="info-title">Moner Kotha</h1><div className="pencil-line" />
      <p>A place to leave something that&apos;s on your mind.</p><p>Choose whether it&apos;s good or bad, write it down, and leave it here.</p><p>No accounts. No likes. No replies. No editing.</p><p className="last">Once you post something, it becomes a tiny piece of this wall.</p>
    </section></div>}
  </main>
}
