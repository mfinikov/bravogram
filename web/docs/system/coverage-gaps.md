# Coverage gaps

## Description
What the system has not decided yet, and what to do meanwhile. The page has four components (InstallButton, Logo, HeroScene, TerminalDemo). Everything else on it is plain markup in `app/page.tsx` styled by class in `app/globals.css`.

## Gaps
| Area | Gate | Meanwhile |
|---|---|---|
| Links and navigation | G-07 | Write an `a` with class `link` inside `.nav`, as `app/page.tsx:53-54` does: 14px, weight 500, `--text`, `--ink` on hover, no underline, 24px tall. The nav holds the brand and two links, which fit 390 wide. A third link needs measuring at 390 first. A link inside a paragraph keeps the browser underline and inherits its color. |
| Other buttons | G-07 | The page has one button, InstallButton. For a second action use a text link as above. If it has to be a button, copy the `.install` rule under a new class name, keep `type="button"` and the shared `:focus-visible` outline, and add a spec from `docs/system/spec-template.md` and a `registry.json` entry in the same change. |
| Cards and mock windows | G-07 | Copy an `article.card` with its `Mock` from `app/page.tsx:81-91`. A card holds an h3, one paragraph of two lines at most, and one mock window, inside `.grid.two`. The mock is `aria-hidden`, so say everything it shows in the paragraph too. |
| Steps | G-07 | Add an item to `STEPS` in `app/page.tsx:11-15`: a title ending in a full stop and one command. The number comes from a CSS counter. |
| Chips | G-07 | Add a string to `WORKS_WITH` in `app/page.tsx`. Chips are plain text in a hairline box: no logos, no links. |
| Comparison table | G-07 | Add a row to `NUMBERS` in `app/page.tsx:18-22`. Keep the plain `table` with `th scope="col"`, three columns, and the measurement note under it. Every number is measured, with the date and the sample in the note. |
| Questions and answers | G-07 | Add an item to `FAQ` in `app/page.tsx:24-34`. Each is a native `details` with the question in `summary`. An answer is two lines at most at 1440 wide. |
| A new section | G-07 | `section.pad` with an id, a `span.eyebrow` label, then a `.head` holding one h2 ending in a full stop, then the content. Use `.head.split` to put a short paragraph to the right of the h2 from 900px. No body paragraph runs past two lines at 1440 wide. |
| Dark theme | G-08 | There is one theme, light. Write no `prefers-color-scheme` rule and no second value for a color token. |
| Loading, error and empty states | G-08 | The page loads no data and has no form, so it has none. A new section that fetches data needs these decided first: say so in your final message and render the section's static content only. |
| Voice and copy rules | G-08 | There is no writing page yet. Match the page: plain short sentences, sentence case, headings end in a full stop, numbers come with what was measured and when, no exclamation marks, and dry wit in a section label at most. |
| Imagery | G-08 | The only drawings are the logo, the hero scene and the graph inside one card. The scene is one color, `--accent`. The six `--graph-*` colors stay in the graph card. Add no photos, icon sets, illustrations or third-party logos. |
