import { Logo } from '@/components/logo'

const GROUND = 200

// Each sprout is a memory: where it stands, how tall it grew, how far it leans and the size of its mark.
const SPROUTS = [
  { x: 96, h: 64, lean: 6, size: 20 },
  { x: 252, h: 104, lean: -8, size: 28 },
  { x: 404, h: 56, lean: 5, size: 18 },
  { x: 576, h: 148, lean: -6, size: 44 },
  { x: 742, h: 88, lean: 9, size: 26 },
  { x: 902, h: 118, lean: -7, size: 32 },
  { x: 1058, h: 60, lean: 6, size: 20 },
]
const SEEDS = [40, 170, 330, 486, 660, 830, 986, 1120]

const top = (s: (typeof SPROUTS)[number]) => ({ x: s.x + s.lean, y: GROUND - s.h })

// The hero scene: a field of dashed ground lines where memories sprout as small Bravogram marks,
// joined by dashed links. One color, drawn in strokes. Decorative, so it is hidden from assistive
// tech and takes no clicks. It sways only when motion is allowed (app/globals.css, .scene).
export function HeroScene() {
  return (
    <svg className="scene" viewBox="0 0 1152 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {SPROUTS.slice(1).map((s, i) => {
        const a = top(SPROUTS[i]), b = top(s)
        return <path className="link" key={s.x} d={`M${a.x} ${a.y - 4}Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 26} ${b.x} ${b.y - 4}`} />
      })}
      {SPROUTS.map((s) => {
        const t = top(s)
        return (
          <g className="sprout" key={s.x}>
            <path d={`M${s.x} ${GROUND}Q${s.x + s.lean * 1.6} ${GROUND - s.h * 0.5} ${t.x} ${t.y}`} />
            <g transform={`translate(${t.x - s.size / 2} ${t.y - s.size * 0.9})`}><Logo size={s.size} /></g>
          </g>
        )
      })}
      <path d="M0 200Q150 197 300 200T620 199T900 201T1152 199" />
      <path className="dots" d="M0 214Q288 211 576 214T1152 213" />
      <path className="dashes" d="M0 231Q288 228 576 231T1152 230" />
      <path className="strokes" d="M0 250Q288 247 576 250T1152 249" />
      {SEEDS.map((x) => <circle key={x} cx={x} cy={GROUND + 6} r="2.5" />)}
    </svg>
  )
}
