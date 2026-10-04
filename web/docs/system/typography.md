# Typography

## Description
The typefaces and text sizes of the page. Titles are Familjen Grotesk 500 and text is Inter 400 (decision D1). Code and small labels are Geist Mono. `app/layout.tsx` loads all three through `next/font`, which serves them from the site itself.

## Tokens
| Token | Value | Role |
|---|---|---|
| `--title` | Familjen Grotesk, then Inter | h1 to h3 and the brand, weight 500 |
| `--body` | Inter | all other text, weight 400, and 500 for emphasis |
| `--mono` | Geist Mono | commands, code, small labels |
| `--font-size-display` | `clamp(28px, 3.4vw, 44px)` | h1, the hero headline |
| `--font-size-h2` | `clamp(22px, 2.4vw, 30px)` | tile and section titles |
| `--font-size-h3` | `20px` | card h3, and the plus and minus sign of a question |
| `--font-size-brand` | `21px` | the wordmark in the nav |
| `--font-size-command` | `clamp(15px, 2.2vw, 21px)` | the install command |
| `--font-size-question` | `clamp(18px, 2vw, 21px)` | a question |
| `--font-size-lede` | `clamp(17px, 1.6vw, 20px)` | hero paragraph |
| `--font-size-body` | `17px` | default text |
| `--font-size-text` | `16px` | tile intro, card text, answer |
| `--font-size-small` | `14px` | nav and footer links, bar rows, the command list, the note |
| `--font-size-code` | `13.5px` | command blocks in the steps |
| `--font-size-caption` | `13px` | hero meta line, footer |
| `--font-size-mock` | `12.5px` | text inside a mock window |
| `--font-size-label` | `12px` | mono labels: section labels, chips, mock title bar, step number |
| `--leading-h3` | `26px` | line height of h3 |
| `--leading-intro` | `26px` | line height of a tile intro |
| `--leading-card` | `25px` | line height of card text |

Headings set tight: line height 1.1 to 1.15 and letter spacing -.03em on h1 and h2, -.02em on h3. The large wordmark in the hero scene is svg text at -.055em. Body text is 1.55.

## Usage
- `rule/typography-title-face`: When text is an h1, h2, h3 or the wordmark, set it in `var(--title)` at weight `500`, and set other text in `var(--body)`, because the two faces are what tells a title from text on this page. Evidence: person D1; app 11/11 headings are h1 to h3 at weight 500 under the one `h1, h2, h3` rule in `app/globals.css`. Check: review the `h1, h2, h3` and `.brand` rules in `app/globals.css`.
  - Don't: `h2 { font-family: var(--body); font-weight: 700; }`
  - Do: `h1, h2, h3 { font-family: var(--title); font-weight: 500; }`
- `rule/typography-size-token`: When a rule sets `font-size`, read a `--font-size-{role}` token instead of a px value, because the page already has 14 sizes and a new raw one adds a 15th nobody chose. Evidence: measured 0 raw font sizes left in `app/globals.css`, `node scripts/check-system.mjs --root . --no-self-test --left`. Check: lint `rule/css-px`.
  - Don't: `.note { font-size: 15px; }`
  - Do: `.note { font-size: var(--font-size-small); }`

## Accessibility
The smallest rendered text is 12px (chips, mock title bars, step numbers), by the token values; the probe file predates the 2026-10-03 rework (decision D10). Zoom to 200% is not measured: NEEDS REVIEW.

## Not tokens
- Line heights and letter spacing written as plain numbers or em (`1.1`, `1.55`, `-.03em`): they scale with the size beside them.
- Near-duplicates kept as they were approved (decision D5, gate G-09): 12.5, 13 and 13.5px, and three line heights for 16px text (25px, 26px and 1.7).
