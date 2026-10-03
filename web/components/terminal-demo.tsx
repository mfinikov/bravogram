'use client'

import { useEffect, useRef, useState } from 'react'

// Real commands and the real output of bravogram 0.1.1, run on an empty database.
const LINES = [
  {
    cmd: 'bravogram remember "Ship on Fridays only after the smoke test passes" --type decision',
    out: 'saved #1 Ship on Fridays only after the smoke test passes',
  },
  {
    cmd: 'bravogram recall "smoke test"',
    out: '#1 Ship on Fridays only after the smoke test passes [decision]\n    Ship on Fridays only after the [smoke] [test] passes',
  },
]
const PAUSE = 10 // ticks between the end of a command and its output
// The tick each line starts at, and the tick the whole script ends at.
const STARTS = LINES.map((_, i) => LINES.slice(0, i).reduce((n, l) => n + l.cmd.length + PAUSE, 0))
const DONE = LINES.reduce((n, l) => n + l.cmd.length + PAUSE, 0)

// The live demo: types two commands and shows what the CLI prints. It renders finished, so it reads
// the same with scripts off or reduced motion on, then plays once when it scrolls into view.
// Text not typed yet is hidden but still takes its space, so the box never changes size.
export function TerminalDemo() {
  const ref = useRef<HTMLPreElement>(null)
  const [tick, setTick] = useState(DONE)

  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setInterval>
    const seen = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      seen.disconnect()
      let t = 0
      setTick(0)
      timer = setInterval(() => { setTick(++t); if (t >= DONE) clearInterval(timer) }, 30)
    }, { threshold: 0.6 })
    seen.observe(el)
    return () => { seen.disconnect(); clearInterval(timer) }
  }, [])

  return (
    <pre ref={ref}>
      {LINES.map((l, i) => {
        const left = tick - STARTS[i]
        const typed = Math.max(0, Math.min(l.cmd.length, left))
        const shown = left >= l.cmd.length + PAUSE
        return (
          <span key={l.cmd}>
            <b>$ {l.cmd.slice(0, typed)}</b><b className="ghost">{l.cmd.slice(typed)}</b>{'\n'}
            <span className={shown ? undefined : 'ghost'}>{l.out}</span>{'\n'}
          </span>
        )
      })}
    </pre>
  )
}
