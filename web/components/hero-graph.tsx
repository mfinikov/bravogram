'use client'

import { useEffect, useRef } from 'react'

// Same colors as the real graph view, read from the --graph-* tokens in app/globals.css.
const KINDS = ['project', 'system', 'decision', 'lesson', 'fact', 'note']

interface Node { x: number; y: number; r: number; p: number; s: number; c: string }

// A fixed seed gives the same layout on every load, so the hero doesn't reshuffle.
function layout() {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const nodes: Node[] = Array.from({ length: 46 }, (_, i) => ({
    x: rand(), y: rand(), r: 2.5 + rand() * 5, p: rand() * 6.28, s: 0.25 + rand() * 0.5, c: KINDS[i % KINDS.length],
  }))
  const links: [Node, Node][] = []
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (j > i && Math.hypot(a.x - b.x, (a.y - b.y) * 0.6) < 0.15) links.push([a, b])
  }))
  return { nodes, links }
}

// The hero background: a slow drifting memory graph. Decorative, so it is hidden from
// assistive tech, stops when off screen, and holds still for reduced motion.
export function HeroGraph() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { nodes, links } = layout()
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const css = getComputedStyle(document.documentElement)
    const line = css.getPropertyValue('--soft')
    const color = Object.fromEntries(KINDS.map((k) => [k, css.getPropertyValue(`--graph-${k}`).trim()]))
    let w = 0, h = 0, visible = true, frame = 0

    const size = () => {
      const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2)
      w = r.width; h = r.height
      canvas.width = w * d; canvas.height = h * d
      ctx.setTransform(d, 0, 0, d, 0, 0)
    }
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const at = (n: Node) => [n.x * w + Math.cos(t * n.s + n.p) * 10, n.y * h + Math.sin(t * n.s * 0.8 + n.p) * 10]
      ctx.strokeStyle = line; ctx.globalAlpha = 0.5; ctx.lineWidth = 1
      for (const [a, b] of links) {
        const [x1, y1] = at(a), [x2, y2] = at(b)
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      }
      ctx.globalAlpha = 0.85
      for (const n of nodes) {
        const [x, y] = at(n)
        ctx.fillStyle = color[n.c]; ctx.beginPath(); ctx.arc(x, y, n.r, 0, 6.2832); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    const loop = (ms: number) => { if (visible) draw(ms / 1000); frame = requestAnimationFrame(loop) }
    const onResize = () => { size(); if (still) draw(0) }

    size()
    addEventListener('resize', onResize)
    const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    seen.observe(canvas)
    if (still) draw(0)
    else frame = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(frame); removeEventListener('resize', onResize); seen.disconnect() }
  }, [])

  return <canvas ref={ref} aria-hidden="true" />
}
