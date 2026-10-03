# Logo

## Description
Draws the Bravogram mark, four leaning ellipses, in the current text color.

`import { Logo } from "@/components/logo"`, source `components/logo.tsx`, status `ready-with-gaps`.
Foundation: `hand-rolled`. Traps checked: `trap/button-icon-name` (the link that holds the mark carries the name), `trap/icon-optical-size` (NEEDS REVIEW: not measured), `trap/icon-optical-align` (NEEDS REVIEW: not measured).

### Foundation
Not applicable: hand-rolled

## Examples
The mark at its default size: `docs/system/examples/logo/default.tsx`.

Real uses, 1 call sites (`rg -n "<Logo\b" app`):
- Nav: beside the wordmark inside the home link. `app/page.tsx:52`

Inside the component folder, HeroScene also renders it on top of each sprout, in the accent color, at 18 to 44px (`components/hero-scene.tsx:34`).

### Example files
| File | Covers | Caption |
|---|---|---|
| `docs/system/examples/logo/default.tsx` | default | The mark at its default 24px, in the current text color. |
| `docs/system/examples/logo/in-brand.tsx` | composition:Brand | The mark beside the wordmark in the home link, as in the nav. |

## Variants
Not applicable: the mark has one drawing and no variant prop. `size` is a number, covered under Props.

## States
| State | Trigger | What the user can do | Shown by, besides color | Checked by |
|---|---|---|---|---|
| default | render | nothing, the mark is not a control | the four ellipses | screenshot |

### State precedence
Not applicable: the mark has one state.

### Motion
Not applicable: no motion

## Props
`size` sets the svg's width and height attributes and defaults to 24. Inside `.brand` the CSS rule `.brand svg` also sets 24px, so the prop only matters elsewhere. `className` goes on the svg.

## Usage

### When to use
- The page names the product: the home link in the nav.
- A drawing is built from the mark, as HeroScene does.

### When not to use
- The mark would be the only content of a link or button. Add the wordmark or an `aria-label` on the parent instead, as coverage-gaps row "Links and navigation" describes.

### Rules
- `rule/logo-hidden-mark`: When the mark sits inside a link, keep `aria-hidden="true"` on the svg and put the name on the link with `aria-label`, because the drawing has no text and a name on both would be read twice. Evidence: single use app/page.tsx:52, the home link is named "Bravogram, home"; principle wcag: 1.1.1 Non-text Content, decoration is hidden from assistive technology. Check: probe the control `link "Bravogram, home"` in the capture's `.probe.json`.
  - Don't: `<a className="brand" href="#top"><Logo /></a>`
  - Do: `<a className="brand" href="#top" aria-label="Bravogram, home"><Logo />bravogram</a>`

### Content
Not applicable: the mark renders no text.

### Anti-slop
- `rule/logo-current-color`: When the mark needs a color, set `color` on its parent with a token instead of adding a `fill` value to the svg, because the svg draws in `currentColor` and a fixed fill stops following the text beside it. Evidence: app 2/2 uses color the mark through the parent, `--ink` from `.brand` and `--accent` from `.scene`, `rg -n "<Logo\b" app components`; principle platform: an svg with `fill="currentColor"` inherits the CSS `color` of its parent. Check: lint `rule/raw-value` fails a hex fill.
  - Don't: `<svg viewBox="0 0 1250 1250" fill="#2f5bff">`
  - Do: `<a className="brand" href="#top"><Logo />bravogram</a>`

### Limits
Not applicable: the sizes in use are 18 to 44px, and no smaller size has been measured.

## Accessibility
Rests on an inline `svg` with `aria-hidden="true"`.

Measured on the rendered page (`.design-system/review/home-after-390.probe.json`): the home link is named "Bravogram, home" and is 127x24. The mark takes `--ink`, 18.36:1 on white (`.design-system/evidence/install-button/limit-390.json`, the same color).

### Keyboard
| Key | Where focus is | Effect | Focus after | Checked by |
|---|---|---|---|---|
| Tab | the element before | focus skips the mark and lands on the link that holds it | the home link | by hand |

### ARIA
| Part | Role | Accessible name from | States and properties | Announced | Checked by |
|---|---|---|---|---|---|
| the svg | none, `aria-hidden` | none | none | nothing | snapshot |

## Tokens
| Part | State | Token |
|---|---|---|
| the ellipses | all | `--ink` in the nav and `--accent` in the hero scene, through `currentColor` |

## Related
- InstallButton: the page's action. The mark never acts on its own.
- HeroScene: the drawing that grows the mark on sprouts.
