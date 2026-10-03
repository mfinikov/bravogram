# HeroGraph

## Description
Draws a slowly drifting memory graph behind the hero text, as decoration.

`import { HeroGraph } from "@/components/hero-graph"`, source `components/hero-graph.tsx`, status `ready`.
Foundation: `hand-rolled`. Traps checked: `trap/reduced-motion-ignored`, `trap/loop-offscreen`, `trap/decor-pointer`, `trap/motion-linear` (n/a: it is a loop), `trap/motion-layout-property` (n/a: it draws on a canvas and moves no element).

### Foundation
Not applicable: hand-rolled

## Examples
The graph on its own: `docs/system/examples/hero-graph/default.tsx`.

Real uses, 1 call sites (`rg -n "<HeroGraph\b" app components`):
- Hero: behind the headline, faded out in the middle by a mask. `app/page.tsx:79`

### Example files
| File | Covers | Caption |
|---|---|---|
| `docs/system/examples/hero-graph/default.tsx` | default | The drifting graph. It fills the nearest positioned parent. |
| `docs/system/examples/hero-graph/in-hero.tsx` | composition:Hero | The graph behind the hero text, faded out in the middle so the headline stays readable. |
| Not applicable: the still state follows the reduced motion setting of the system, so no prop reaches it | state:still | One frame that does not move. |

## Variants
Not applicable: the component takes no props.

## States
| State | Trigger | What the user can do | Shown by, besides color | Checked by |
|---|---|---|---|---|
| moving | page load | nothing, it is decoration | 46 dots drift within 10px of their place | by hand |
| still | the system asks for reduced motion | nothing | one frame, redrawn only on resize | screenshot |
| paused | the canvas scrolls out of view | nothing | drawing stops and picks up when it is back in view | by hand |

### State precedence
- Still and paused: still wins. No frame loop runs, so there is nothing to pause.
- Moving and paused: paused wins. The loop keeps its clock and skips the drawing.

### Motion
| Trigger | Kind | Preset | Properties | Reduced motion |
|---|---|---|---|---|
| page load | announce | none: a script loop on `requestAnimationFrame`, no token | canvas pixels only | one still frame |

## Props
The component takes no props. The layout seed, the node count and the drift are constants in the source file.

## Usage

### When to use
- The hero needs its background.

### When not to use
- A section wants to show a graph the reader should read. Draw it as an inline `svg` inside a mock window instead, as coverage-gaps row "Cards and mock windows" describes.
- A second section wants a background. Leave it plain instead, per coverage-gaps row "Imagery".

### Rules
- `rule/hero-graph-decoration`: When the graph renders, keep `aria-hidden="true"` on the canvas and `pointer-events: none` in its CSS, because it carries no information and lies over the hero's text and button. Evidence: single use components/hero-graph.tsx:74 and app/globals.css:96; principle wcag: 1.1.1 Non-text Content, decoration is hidden from assistive technology. Check: review the canvas tag and the `.hero canvas` rule.
  - Don't: `<canvas ref={ref} role="img" />`
  - Do: `<canvas ref={ref} aria-hidden="true" />`
- `rule/hero-graph-token-colors`: When a node kind needs a color, read `--graph-{kind}` from the token block instead of a hex value in the script, because the card drawing in `app/page.tsx` uses the same six colors and they have to match. Evidence: app 2/2 graph drawings read the six tokens, `rg -n "graph-" app components`. Check: lint `rule/raw-value`.
  - Don't: `const COLORS = ['#7aa2ff', '#56c2a6']`
  - Do: `css.getPropertyValue("--graph-" + kind)`

### Content
Not applicable: it renders no text.

### Anti-slop
- `rule/hero-graph-once`: When a page already renders `HeroGraph`, give other sections no animated background instead of a second instance, because each instance redraws 46 nodes every frame. Evidence: single use app/page.tsx:79; measured 46 nodes per frame, components/hero-graph.tsx:14. Check: review `rg -c "<HeroGraph" app` returns 1.
  - Don't: `<section className="closing"><HeroGraph /></section>`
  - Do: `<section className="closing"><div className="pad">…</div></section>`

### Limits
Not applicable: the node count is fixed at 46 in the source and no prop changes it.

## Accessibility
Rests on a `canvas` with `aria-hidden="true"`. It takes no focus and no pointer events.

Under reduced motion the script draws one frame and starts no loop (`components/hero-graph.tsx:34`). Every capture in `.design-system/review/` was taken with reduced motion on and two captures of the same page match pixel for pixel. Off screen, an `IntersectionObserver` stops the drawing (`components/hero-graph.tsx:66`). Contrast of the text over the moving dots is not measured: NEEDS REVIEW.

### Keyboard
| Key | Where focus is | Effect | Focus after | Checked by |
|---|---|---|---|---|
| Tab | the nav | focus passes the canvas and lands on the install button | the install button | by hand |

### ARIA
| Part | Role | Accessible name from | States and properties | Announced | Checked by |
|---|---|---|---|---|---|
| the canvas | none, `aria-hidden` | none | none | nothing | snapshot |

## Tokens
| Part | State | Token |
|---|---|---|
| nodes | all | `--graph-project`, `--graph-system`, `--graph-decision`, `--graph-lesson`, `--graph-fact`, `--graph-note` |
| lines between nodes | all | `--soft` |

## Related
- Logo: the other drawing on the page, and the one that names the product.
