import { Logo } from '@/components/logo'

// A small seeded generator, so the graph is the same drawing on every build.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}
const r1 = (n: number) => Math.round(n * 10) / 10

// The six memory kinds of the real graph view. A node's color is its kind's token.
const KINDS = ['project', 'system', 'decision', 'lesson', 'fact', 'note']

type Hub = { x: number; y: number; size: number }
type Node = { x: number; y: number; r: number; kind?: string; size?: number }

// A memory graph: the hubs are Bravogram marks, the rest are memories scattered where `free`
// allows, and every node links to its two nearest neighbours.
function graph(seed: number, hubs: Hub[], count: number, w: number, h: number, free: (x: number, y: number) => boolean) {
  const rand = seeded(seed)
  const nodes: Node[] = hubs.map((hub) => ({ ...hub, r: hub.size / 2 }))
  for (let tries = 0; nodes.length < hubs.length + count && tries < 5000; tries++) {
    const x = r1(30 + rand() * (w - 60))
    const y = r1(20 + rand() * (h - 40))
    if (!free(x, y) || nodes.some((n) => Math.hypot(n.x - x, n.y - y) < 46)) continue
    nodes.push({ x, y, r: r1(4 + rand() * 5), kind: KINDS[nodes.length % KINDS.length] })
  }
  const links = new Set<string>()
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach((o) => links.add(i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`))
  })
  const d = [...links]
    .map((k) => k.split('-').map(Number))
    .map(([i, j]) => `M${nodes[i].x} ${nodes[i].y}L${nodes[j].x} ${nodes[j].y}`)
    .join('')
  return { nodes, d }
}

const BASELINE = 150 // where the wordmark stands

// The hero graph keeps clear of the wordmark and of the hole at the bottom centre, where the hero text sits.
const FIELD = graph(
  7,
  [{ x: 150, y: 150, size: 40 }, { x: 1062, y: 172, size: 46 }, { x: 118, y: 400, size: 60 }, { x: 1072, y: 438, size: 68 }],
  28, 1200, 520,
  (x, y) => !(x > 200 && x < 1000 && y < 300) && ((x - 600) / 470) ** 2 + ((520 - y) / 290) ** 2 >= 1,
)
// The footer band: one strip of the same graph.
const BAND = graph(11, [{ x: 200, y: 84, size: 44 }, { x: 600, y: 70, size: 52 }, { x: 1000, y: 88, size: 44 }], 24, 1200, 160, () => true)

// The scene: the wordmark with a memory graph around it. Memories are dots in the six colors of
// the real graph view, hubs are Bravogram marks, and thin lines link them. With `band` it is the
// footer's strip of the same graph, without the wordmark. Decorative, so it is hidden from assistive
// tech and takes no clicks. The dots swell only when motion is allowed (app/globals.css, .scene).
export function HeroScene({ band = false }: { band?: boolean }) {
  const { nodes, d } = band ? BAND : FIELD
  return (
    <svg className={band ? 'scene band' : 'scene'} viewBox={band ? '0 0 1200 160' : '0 0 1200 520'} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d={d} />
      {!band && <text className="word" x="600" y={BASELINE} textAnchor="middle" fontSize="160">bravogram</text>}
      {nodes.map((n, i) =>
        n.size ? (
          <g className="mark" key={i} transform={`translate(${n.x - n.size / 2} ${n.y - n.size / 2})`}><Logo size={n.size} /></g>
        ) : (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={`var(--graph-${n.kind})`} style={{ animationDelay: `${-0.37 * i}s` }} />
        ),
      )}
    </svg>
  )
}
