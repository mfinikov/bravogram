# TerminalDemo

## Description
Types two Bravogram commands and shows what the CLI prints, once, when it scrolls into view.

`import { TerminalDemo } from "@/components/terminal-demo"`, source `components/terminal-demo.tsx`, status `ready`.
Foundation: `hand-rolled`. Traps checked: `trap/reduced-motion-ignored`, `trap/loading-layout-shift`, `trap/loop-offscreen` (n/a: it plays once and stops), `trap/motion-blocks-input` (n/a: it takes no input).

### Foundation
Not applicable: hand-rolled

## Examples
The demo on its own: `docs/system/examples/terminal-demo/default.tsx`.

Real uses, 1 call sites (`rg -n "<TerminalDemo\b" app components`):
- Live demo section: inside a mock window on a card, left of the three commands. `app/page.tsx:141`

### Example files
| File | Covers | Caption |
|---|---|---|
| `docs/system/examples/terminal-demo/default.tsx` | default | The two commands and their output, typed once when scrolled into view. |
| `docs/system/examples/terminal-demo/in-mock.tsx` | composition:Mock | The demo inside a mock window on a card, as in the live demo section. |
| Not applicable: typing starts when the block scrolls into view and ends 4 seconds later, so no prop reaches it | state:typing | A command half typed, with the rest hidden. |

## Variants
Not applicable: the component takes no props. The commands and their output are the constant `LINES` in the source file.

## States
| State | Trigger | What the user can do | Shown by, besides color | Checked by |
|---|---|---|---|---|
| finished | first render, scripts off, reduced motion, or the end of typing | read it | both commands and their output | screenshot |
| typing | 60% of the block scrolls into view, once, when motion is allowed | read along | each command appears a character at a time, then its output at once | by hand |

### State precedence
Not applicable: the two states exclude each other, since typing ends in finished and never starts again.

### Motion
| Trigger | Kind | Preset | Properties | Reduced motion |
|---|---|---|---|---|
| scrolls into view | announce | none: a script timer, one character every 30ms | text visibility | no typing, the finished text shows from the start |

## Props
The component takes no props.

## Usage

### When to use
- A section shows what using the CLI looks like.

### When not to use
- The reader should copy the command. Use InstallButton instead.
- The block shows a file, a list or a graph, not a terminal session. Use a static mock window instead, per coverage-gaps row "Cards and mock windows".

### Rules
- `rule/terminal-demo-finished-first`: When the component first renders, show every line (`tick` starts at `DONE`), because people with scripts off or reduced motion on never get the typing and would see an empty box. Evidence: measured 0 hidden characters under reduced motion, .design-system/evidence/home/walk-redesign.json; single use components/terminal-demo.tsx:26. Check: probe `node .design-system/scripts/walk.mjs`.
  - Don't: `const [tick, setTick] = useState(0)`
  - Do: `const [tick, setTick] = useState(DONE)`
- `rule/terminal-demo-keep-box`: When text is not typed yet, render it with the class `ghost` instead of leaving it out, because text that is left out makes the box grow line by line and pushes the page down. Evidence: measured 1 height from the first tick to the last, 255px at 390 wide and 189px at 1440, .design-system/evidence/home/walk-redesign.json. Check: probe `node .design-system/scripts/walk.mjs`.
  - Don't: `<b>$ {l.cmd.slice(0, typed)}</b>`
  - Do: `<b>$ {l.cmd.slice(0, typed)}</b><b className="ghost">{l.cmd.slice(typed)}</b>`

### Content
- `rule/terminal-demo-real-output`: When a line in `LINES` changes, paste the command and its output from a real run of the CLI on an empty database (`BRAVOGRAM_DB` set to a temp file) instead of writing the output by hand, because the section is called a live demo and invented output drifts from the product. Evidence: measured 2 of 2 commands match the output of bravogram 0.1.1 character for character, .design-system/evidence/terminal-demo/cli-output.txt. Check: review `LINES` against a fresh run.
  - Don't: `out: 'Saved! (id 24)'`
  - Do: `out: 'saved #1 Ship on Fridays only after the smoke test passes'`

### Anti-slop
- `rule/terminal-demo-once`: When the typing has finished, call `clearInterval(timer)` and leave the text finished instead of starting over in a loop, because a loop retypes the text under someone who is reading it. Evidence: single use components/terminal-demo.tsx:34, the observer disconnects on first sight; measured 1 play of 4.1 seconds, .design-system/evidence/home/walk-redesign.json. Check: review that the interval clears at `DONE` and nothing restarts it.
  - Don't: `if (t >= DONE) t = 0`
  - Do: `if (t >= DONE) clearInterval(timer)`

### Limits
- `rule/terminal-demo-length`: When the script grows past 160 ticks, cut a line instead of adding more, because past 5 seconds moving text needs a pause control. Evidence: measured 136 ticks played in 4.1 seconds, .design-system/evidence/home/walk-redesign.json; principle wcag: 2.2.2 Pause, Stop, Hide, motion that ends within 5 seconds needs no control. Check: review `DONE` in `components/terminal-demo.tsx`.
  - Don't: `const PAUSE = 60`
  - Do: `const PAUSE = 10`

## Accessibility
Rests on a `pre`. On the page it sits inside a mock window, which is `aria-hidden`, so assistive technology does not read it. The three commands beside it and the cards above it say the same in real text.

Measured on the production build (`.design-system/evidence/home/walk-redesign.json`): the typing takes 4.1 seconds, the box keeps one height, and under reduced motion no character is hidden. The text does not scroll sideways, so it takes no focus.

### Keyboard
| Key | Where focus is | Effect | Focus after | Checked by |
|---|---|---|---|---|
| Tab | the install button | focus passes the demo and lands on the next control | the next control | by hand |

### ARIA
| Part | Role | Accessible name from | States and properties | Announced | Checked by |
|---|---|---|---|---|---|
| the `pre` | none inside the `aria-hidden` mock window | none | none | nothing | snapshot |

## Tokens
| Part | State | Token |
|---|---|---|
| text | all | `--mono`, `--font-size-mock`, `--text` |
| commands | all | `--ink` |
| padding | all | `--space-14`, `--space-16`, `--space-22` |

## Related
- InstallButton: copies the install command.
- HeroScene: the other thing on the page that moves.
