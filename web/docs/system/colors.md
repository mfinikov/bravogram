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
| `--text` | `rgb(0 0 0 / .7)` | body text |
| `--soft` | `rgb(0 0 0 / .56)` | captions, labels, the grep bar, links in the scene and the graph card. 4.5:1 or more on white |
| `--line` | `rgb(0 0 0 / .08)` | hairline borders and dividers |
| `--accent` | `#2f5bff` | the Bravogram bar, focus ring, search-hit tint |
| `--accent-ink` | `#1f3fc4` | text on the accent tint |
| `--graph-project` | `#7aa2ff` | project node |
| `--graph-system` | `#56c2a6` | system node |
| `--graph-decision` | `#f7b955` | decision node |
| `--graph-lesson` | `#ef6f6c` | lesson node |
| `--graph-fact` | `#b48cf2` | fact node |
| `--graph-note` | `#a3abbd` | note node |

## Usage
- `rule/colors-token-only`: When a style or an svg attribute needs a color, read a token with `var(--name)` instead of writing a hex or `rgb()` value, because the token block is the one place the palette is defined. Evidence: measured 1 raw color literal left, listed under Not tokens, `node scripts/check-system.mjs --root . --no-self-test --left`. Check: lint `rule/raw-value`.
  - Don't: `<circle r="13" fill="#7aa2ff" />`
  - Do: `<circle r="13" fill="var(--graph-project)" />`
- `rule/colors-soft-contrast`: When text is set in `--soft`, put it on `--bg` or `--panel` and never on `--card`, and use `--text` on a card instead, because `--soft` is tuned to pass 4.5:1 on white only. Evidence: measured 4.95:1 on white for 22 texts and 0 texts under 4.5:1 on the page, .design-system/review/redesign/home-after-1440.probe.json. Check: probe the `texts` ratios in the capture's `.probe.json`.
  - Don't: `.card p { color: var(--soft); }`
  - Do: `.card p { color: var(--text); }`

The six graph colors are for the scene and the graph card (decision D11), always as dots, never as text. They are the node kinds of the real graph view, so they stay in step with the product. Everything else is the neutrals plus `--accent`.

## Accessibility
Rendered contrast, from `.design-system/review/redesign/home-after-1440.probe.json` (written by the capture script on the production build):

| Text | On | Ratio | Where |
|---|---|---|---|
| `--ink` | `--bg` | 18.42:1 | headings, brand, command |
| `--ink` | `--card` | 17:1 | card headings |
| `--text` | `--bg` | 8.59:1 | body text, nav links, chips |
| `--text` | `--card` | 8.25:1 | card text |
| `--accent` | `--bg` | 5.17:1 | the focus ring and the Bravogram bar |
| `--accent-ink` | the accent tint | 6.53:1 | search hits in a mock window |
| `--accent-ink` | `--bg` | 8.2:1, computed, not probed | the "5.5x less" line beside a bar |
| `--soft` | `--bg` | 4.95:1 | 22 small texts at 12 to 14px: meta line, the notes, footer column titles, mock title bars |

No text on the page is under 4.5:1 (0 of 98 at 1440 wide).

## Not tokens
- `themeColor: "#ffffff"` in `app/layout.tsx`: page metadata cannot read a CSS variable. Keep it equal to `--bg`.
- `color-mix(in srgb, var(--accent) 16%, transparent)` for the search-hit tint: math on a token.
