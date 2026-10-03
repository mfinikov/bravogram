# Colors

## Description
The colors the page uses and the job of each. One theme, light. The source is the token block at the top of `app/globals.css`.

## Tokens
| Token | Value | Role |
|---|---|---|
| `--bg` | `#ffffff` | page background, and text on the dark skip link |
| `--card` | `#f5f5f4` | card and command block background |
| `--panel` | `#ffffff` | raised white surface: install box, mock window |
| `--ink` | `rgb(0 0 0 / .92)` | headings, strong text, the install box border and its hover shadow |
| `--text` | `rgb(0 0 0 / .55)` | body text |
| `--soft` | `rgb(0 0 0 / .4)` | captions, labels, table headers, graph lines |
| `--line` | `rgb(0 0 0 / .08)` | hairline borders and dividers |
| `--accent` | `#2f5bff` | headline accent, focus ring, search-hit tint |
| `--accent-ink` | `#1f3fc4` | text on the accent tint |
| `--graph-project` | `#7aa2ff` | project node |
| `--graph-system` | `#56c2a6` | system node |
| `--graph-decision` | `#f7b955` | decision node |
| `--graph-lesson` | `#ef6f6c` | lesson node |
| `--graph-fact` | `#b48cf2` | fact node |
| `--graph-note` | `#a3abbd` | note node |

## Usage
- `rule/colors-token-only`: When a style or an svg attribute needs a color, read a token with `var(--name)` instead of writing a hex or `rgb()` value, because the token block is the one place the palette is defined. Evidence: measured 3 raw color literals left, all listed under Not tokens, `node scripts/check-system.mjs --root . --no-self-test --left`. Check: lint `rule/raw-value`.
  - Don't: `<circle r="13" fill="#7aa2ff" />`
  - Do: `<circle r="13" fill="var(--graph-project)" />`
- Gated: `rule/colors-soft-contrast` (G-06). Should text in `--soft` be darkened to reach 4.5:1 on white?

The six graph colors are for graph nodes only. They are the node kinds of the real graph view, so they stay in step with the product.

## Accessibility
Rendered contrast, from `.design-system/review/home-after-1440.probe.json` (written by the capture script on the production build):

| Text | On | Ratio | Where |
|---|---|---|---|
| `--ink` | `--bg` | 18.42:1 | headings, brand, command |
| `--ink` | `--card` | 17:1 | card headings |
| `--text` | `--bg` | 4.74:1 | body text, nav links |
| `--text` | `--card` | 4.64:1 | card text |
| `--accent` | `--bg` | 5.17:1 | the second line of the h1, and the focus ring |
| `--accent-ink` | the accent tint | 6.53:1 | search hits in a mock window |
| `--soft` | `--bg` | 2.85:1 | 15 small texts at 12 to 14px: eyebrow, meta line, table headers and units, the note, footer, mock title bars |

`--soft` on white is under 4.5:1. It is open as G-06 and unchanged. Five of the 15 texts are mock title bars, which are hidden from assistive technology.

## Not tokens
- `#000` in the `mask-image` of `.hero canvas` (twice, with its `-webkit-` twin): a mask reads only alpha, so this is "fully visible", not a color.
- `themeColor: "#ffffff"` in `app/layout.tsx`: page metadata cannot read a CSS variable. Keep it equal to `--bg`.
- `color-mix(in srgb, var(--bg) 88%, transparent)` for the sticky header and `color-mix(in srgb, var(--accent) 16%, transparent)` for the search-hit tint: math on tokens.
