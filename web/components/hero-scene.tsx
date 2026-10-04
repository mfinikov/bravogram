import { Logo } from '@/components/logo'

// A small seeded generator, so the field is the same drawing on every build.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}
const r1 = (n: number) => Math.round(n * 10) / 10

// One row of the field: broken horizontal strokes from x0 to x1. Depth 0 is the horizon
// (short strokes, wide gaps) and depth 1 is the front (long strokes, narrow gaps).
function row(rand: () => number, y: number, x0: number, x1: number, depth: number) {
  let d = ''
  let x = x0 + rand() * 20
  while (x < x1) {
    const end = Math.min(x + (4 + rand() * 10) * (1 + depth * 8), x1)
    d += `M${r1(x)} ${r1(y)}H${r1(end)}`
    x = end + (8 + rand() * 22) * (1 - depth * 0.6)
  }
  return d
}

const BASELINE = 150 // where the wordmark stands: rows above it are drawn behind the letters, rows below in front

// The hero field: 64 rows that spread out and widen toward the front.
const FIELD = (() => {
  const rand = seeded(7)
  return Array.from({ length: 64 }, (_, i) => {
    const depth = i / 63
    const y = 100 + 418 * depth ** 2.2
    return { y, opacity: r1((0.15 + 0.35 * depth) * 10) / 10, d: row(rand, y, 154 - 190 * depth, 1046 + 190 * depth, depth) }
  })
})()

// The footer band: 19 even rows.
const BAND = (() => {
  const rand = seeded(11)
  return Array.from({ length: 19 }, (_, i) => ({ y: 8 + i * 8, opacity: 0.44, d: row(rand, 8 + i * 8, 0, 1200, 0.6) }))
})()

// Each mark is a memory floating in the field: where its waterline is, its size and its lean.
const FIELD_MARKS = [
  { x: 150, y: 160, size: 38, tilt: -6 },
  { x: 1062, y: 172, size: 44, tilt: 7 },
  { x: 118, y: 400, size: 62, tilt: 12 },
  { x: 1072, y: 438, size: 72, tilt: -10 },
]
const BAND_MARKS = [
  { x: 110, y: 30, size: 60, tilt: -6 },
  { x: 350, y: 26, size: 66, tilt: 5 },
  { x: 600, y: 32, size: 58, tilt: -8 },
  { x: 850, y: 26, size: 68, tilt: 7 },
  { x: 1090, y: 30, size: 62, tilt: -5 },
]

const rows = (list: typeof FIELD) =>
  list.map((r) => <path key={r.y} d={r.d} strokeOpacity={r.opacity} />)

// The scene: the wordmark standing in a field of broken horizontal lines, with Bravogram marks
// floating in it. With `band` it is the footer's strip of the same field, without the wordmark.
// Decorative, so it is hidden from assistive tech and takes no clicks. The marks bob only when
// motion is allowed (app/globals.css, .scene).
export function HeroScene({ band = false }: { band?: boolean }) {
  const field = band ? BAND : FIELD
  return (
    <svg className={band ? 'scene band' : 'scene'} viewBox={band ? '0 -40 1200 200' : '0 0 1200 520'} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {!band && (
        <>
          {rows(field.filter((r) => r.y < BASELINE))}
          <text className="word" x="600" y={BASELINE} textAnchor="middle" fontSize="160">bravogram</text>
        </>
      )}
      {rows(band ? field : field.filter((r) => r.y >= BASELINE))}
      {(band ? BAND_MARKS : FIELD_MARKS).map((m, i) => {
        const id = `${band ? 'band' : 'field'}-mark-${i}`
        const s = m.size
        return (
          <g key={id} transform={`translate(${m.x} ${m.y})`}>
            <clipPath id={id}><rect x={-s} y={-2 * s} width={2 * s} height={2 * s} /></clipPath>
            <g clipPath={`url(#${id})`}>
              <g className="bob" style={{ animationDelay: `${-1.7 * i}s` }}>
                <g className="mark" transform={`rotate(${m.tilt}) translate(${-s / 2} ${-0.72 * s})`}><Logo size={s} /></g>
              </g>
            </g>
            <path className="water" d={`M${r1(-0.68 * s)} 0H${r1(-0.3 * s)}M${r1(-0.14 * s)} 0H${r1(0.26 * s)}M${r1(0.38 * s)} 0H${r1(0.7 * s)}M${r1(-0.44 * s)} ${r1(0.07 * s)}H${r1(-0.24 * s)}M${r1(0.16 * s)} ${r1(0.07 * s)}H${r1(0.4 * s)}`} />
          </g>
        )
      })}
    </svg>
  )
}
