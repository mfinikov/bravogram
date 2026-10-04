# Layout

## Description
The page is one open column, 1280px at most with its gutters, and sections are split by space, not rules (decision D10). This page lists its widths and its space values.

## Tokens
| Token | Value | Role |
|---|---|---|
| `--page-width` | `1280px` | the page column and the nav, gutters included |
| `--gutter` | `clamp(20px, 6vw, 96px)` | left and right padding of the column |
| `--section-y` | `clamp(40px, 6vw, 88px)` | space above a section |
| `--measure` | `640px` | widest reading text |
| `--scene-height` | `clamp(96px, 14vw, 180px)` | the field band in the footer |
| `--rule` | `1.5px` | the strong border: install box, tiles, demo, call to action |
| `--bar-height` | `12px` | a comparison bar |
| `--target-min` | `24px` | smallest height of a link or control |
| `--mock-height` | `190px` | a mock window and the graph drawing inside it |
| `--space-2` to `--space-48` | `2, 4, 6, 8, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 48px` | padding, margin and gap. The number is the pixel value |

Breakpoints, written in the media queries of `app/globals.css`: 520px (a step's number sits above its text below it), 720px (cards go two across from it), 900px (a section intro sits right of its h2, and the live demo goes two across, from it).

## Usage
- `rule/layout-measure`: When a paragraph is reading text, cap its width at `var(--measure)` or less, because a line past 75 characters loses the eye on the way back. Evidence: measured 0 text-measure findings at 390 and 1440 wide, .design-system/review/redesign/home-after-1440.probe.json; app 6/6 paragraph kinds are capped (lede, section intro, card text, step, answer, note), `rg -n "max-width" app/globals.css`. Check: probe `trap/text-measure` in the capture's `.probe.json`.
  - Don't: `.step p { max-width: none; }`
  - Do: `.step p { max-width: var(--measure); }`
- `rule/layout-space-token`: When a rule sets padding, margin or gap, read a `--space-{pixels}` token, `--gutter` or `--section-y` instead of a px value, because the scale already has 15 steps and a raw value adds one nobody chose. Evidence: measured 2 raw spacing values left, both listed under Not tokens, `node scripts/check-system.mjs --root . --no-self-test --left`. Check: lint `rule/css-px`.
  - Don't: `.card { padding: 30px; }`
  - Do: `.card { padding: var(--space-28) var(--space-28) 0; }`
- `rule/layout-target-size`: When a link or control is added, give it a height of `var(--target-min)` or more, because a target under 24px is easy to miss by touch. Evidence: app 7/7 nav and footer links carry `a.link`, which sets `min-height: var(--target-min)` in `app/globals.css`; principle wcag: 2.5.8 Target Size (Minimum), 24 by 24 CSS pixels. Check: probe the control boxes in the capture's `.probe.json`.
  - Don't: `a.link { display: inline; }`
  - Do: `a.link { min-height: var(--target-min); display: inline-flex; align-items: center; }`

## Accessibility
Looked at on 2026-10-03 after the rework (decision D10), in screenshots at 390 and 1440 wide: nothing runs off the side. The earlier probe file predates the rework, so tab stops and `scrollWidth` are not re-measured: NEEDS REVIEW. The nav and footer links are 24px tall. Under 521px a step's number sits above its text, so the text runs 32 characters a line at 390 wide. Reflow at 320px is not measured: NEEDS REVIEW.

## Not tokens
One-off sizes that place a single thing, listed in `scripts/check-allowlist.json`:
- `left: -999px`: parks the skip link off screen until it has focus.
- `height: 56px`: the nav bar.
- `gap: 9px`: between the mark and the wordmark.
- `24px` and `16px` and `8px` squares: the mark, the copy icon, the dots in a mock title bar.
- `max-width: 440px`: card text.
- `margin-top: -14%` and `-25%` on the hero text, and `width: 130%` on the scene under 721px: they place the text in the hole of the field.
- `10ch`, `11ch` and `26ch` columns: the bar rows and the command list.

Off-grid steps kept as approved (decision D5, gate G-09): 9, 14, 18, 22 and 26px.
