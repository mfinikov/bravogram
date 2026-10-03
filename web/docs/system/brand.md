# Brand

## Description
The name, the mark and the typefaces of Bravogram on this page.

## Assets
| Asset | Where | Notes |
|---|---|---|
| Mark | `components/logo.tsx` | four leaning ellipses, drawn in the current text color (decision D2). Traced from the logo image: swap in the original vector file when there is one |
| Favicon | `app/icon.svg` | served by Next.js as the site icon |
| Wordmark | the text "bravogram" in `.brand` | lowercase, `--title` at weight 500 and `--font-size-brand`, beside the mark |
| Title face | Familjen Grotesk 500 | loaded in `app/layout.tsx` (decision D1) |
| Text face | Inter 400 | loaded in `app/layout.tsx` (decision D1) |
| Code face | Geist Mono | loaded in `app/layout.tsx` |

## Usage
The product is written "Bravogram" in sentences and "bravogram" in the wordmark and in commands. The accent blue `--accent` marks the second line of the h1 and nothing else in the text.
