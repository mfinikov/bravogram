# Design system build: bravogram landing page

## Frame
Mode: build. Foundation: raw (base-raw.md)
Run branch: ds/2026-10-03-full, from main at c581378, worktree /Users/arsenii/Documents/bravogram-memory-ds. Nothing commits to main. Nothing is pushed. Merging is the person's call.
Bans: none named today (boss gate G-01 covers the 2026-10-01 bans, default not re-applied). Design source: boat.dev, tinyfish.ai, supermemory.ai, reference only. Exemplars: none named.
Target: web/ (CSS custom properties in app/globals.css)
Themes: light only
Viewports: 390, 1440
Pilot: the landing page itself, / (the only route). Uses the install button, cards with mock windows, steps, the numbers table, the FAQ disclosure, nav and footer.
Workers: 1 (small app, no fan-out)
Budget: build cap 17:11 on 2026-10-03, set by the boss.
Clearance: none, and none needed: one route.
Check command in CI: none yet for web/ (the repo's workflow covers the CLI only).
Footprint: full. The check scripts, specs and generated docs live in web/ (scripts/, docs/system/, docs/generated/). App root is web/, not the git root, so every script runs with `--root .`.
Complaint: the bare command, no complaint named. First visible answer: none wanted, the page was approved on 2026-10-03 as it looks, so the build changes no pixel except a named trap fix.
Skipped (small app): the two-agent rule tests, the review lenses, the fresh-agent trial and the project skills. No agent was started.
Not built (cut on purpose, each a found-not-fixed row): the HTML docs site (the brief), a writing page with copy-check, CI tiers (the root workflow is out of scope).

Done when: 3 canonical components cover 1 of 1 inventoried families (Button) and the page's two drawings, with 7 page sections kept as page markup (G-07),
every one of the 62 tokens has a role, the checks fail on 2 seeded violations and exit 0 on a clean clone,
and the pilot matches its baseline except for D-08.

Step 6, redesign (16:14 to 16:26): the person's direction at 16:02, "i want the simplicity of supermemory, the design of tinyfish, and vibe of boat", replaces the order that the page keeps its look. The design source is followed partially, in place. Brief: boss/briefs/redesign.1.md. Captures: review/redesign/.

## Standing orders
1. Write only inside your brief's SCOPE. Your scratch lives only in .design-system/tmp/<your worker id>/, deleted at close. Never read, apply or delete another worker's. Shared files (the token source, generated files, the barrel, registries, indexes, the migration map, the check's config, allowlist and drift list) belong to their one writer, so report the change you need.
2. Use only the colors, fonts, shadows, gradients, motion, logos and product names the app already has, or that the design source the Frame follows draws. The person's bans, quoted below, hold in code, copy, docs, examples and the showcase, except on a Don't: line.
3. Baselines, fixtures and checks stay as written, and so do repo-wide gates (lint flags, CI thresholds, warning limits, project instructions). Fix the code instead.
4. Commit only to the branch your brief names, locally. Never merge, deploy, publish, force-push, stash, reset or clean. No push or PR unless the person asked for one. Leave uncommitted changes and branches you did not create as they are.
5. Put a question in your report as a gate with a default, apply the default, and finish the work. Never wait on an answer.
6. Report with the REPORT block as your final message, as text, status first, commands and exit codes pasted, not summarized. Every claim that something is fixed, passes or works names the command that proved it this session and what that command covers. An audit that does not measure the reported defect is not evidence for it. Write no report file.
7. In a checkout other workers share, make small exact edits that fail when the file changed since you read it. Never rewrite a file whole, and never revert or tidy a change you did not make.
8. Start no agents unless your brief names you a coordinator, apart from the two fresh agents a two-agent test needs. A coordinator that is itself a subagent runs its workers as foreground calls and never returns while one runs.
- .design-system/boss/ belongs to the coordinator. Write nothing there.
- Project rule (web/AGENTS.md): "This version has breaking changes. Read the relevant guide in node_modules/next/dist/docs/ before writing any code. Heed deprecation notices."
- Project rule (~/.claude/CLAUDE.md): "Read the part of a file you need, not the whole file. Filter heavy output before it lands."
- Project rule (ponytail, session hook): the simplest solution that works; no new dependency for what a few lines can do; no speculative abstractions.
- The person's words (2026-10-03): titles are Familjen Grotesk 500, text is Inter 400; the logo is the four-ellipse mark in components/logo.tsx; references for the look are boat.dev, tinyfish.ai and supermemory.ai (reference only: never copy their text, images, logos or font files).
- Bans: none named today. The 2026-10-01 bans for the old Bravogram app are gate G-01, default "not re-applied", so do not restyle for them.

## Phases
| Phase | Status | Artifact | Notes |
|---|---|---|---|
| 1 Frame | done | run.md#frame, scripts/check-system.config.json | no complaint named; the page keeps its approved look |
| 2 Inventory | done | boss/triage/, review/home-before-*.probe.json, inventory/delete-plan.md, delete commit df3286b | control capture diffs at 0% on 6 captures; traps measured before any edit |
| 3 Foundations | done | app/globals.css token block, AGENTS.md block, commits 41a8cf3 and f7f8e96 | 82 raw values swapped for tokens of the same value, 6 captures at 0% |
| 4 Components | done | registry.json, docs/system/install-button.md, logo.md, hero-graph.md, commit 7370786 | 3 registry components; page sections stay markup (G-07); no codemod, nothing to move |
| 5 Checks | done | scripts/, scripts/check-allowlist.json, scripts/check-ratchet.json, package.json check | self-test 76 fixtures pass; 2 seeded violations fail; not in CI |
| 6 Pilot, then surfaces | done | review/index.html, review/traces.tsv, evidence/home/walk.json, commit 3ca4ffb | 1 trap fixed (D-08), 2 gated with measurements (G-04, G-05); no surface outside the pilot exists |
| 7 Docs | done | docs/system/, docs/generated/, AGENTS.md index, commit 7370786 | 9 pages pass check-spec; no writing page and no HTML site (G-08, the brief) |
| 8 Handoff | done | close.md, run.md#handoff-report | clean clone check exit 0 |
| 9 Redesign (step 6) | done | review/redesign/index.html, review/redesign/traces.tsv, evidence/home/walk-redesign.json, commits 62e6097 to 68de533 | 2 new components with specs, 1 removed; 0 probe findings and 0 texts under 4.5:1; check exit 0 |

## Decisions
| ID | Phase | Decision | Why | Evidence | Reversible |
|---|---|---|---|---|---|
| D-01 | 1 | Full footprint: check-system, check-spec, gen-docs, props-table and oklch copied to web/scripts. copy-check not kept | The brief asks for the check, specs and generated docs. oklch.mjs is imported by check-system (its self-test fails without it). copy-check needs a writing page, which this run does not write, and it added a lint warning | scripts/, `npm run lint` exit 0 | yes |
| D-02 | 2 | Delete the `.term` rules and the tokens --term, --term-text, --term-dim | Nothing uses them: 4 searches return 0 | inventory/delete-plan.md, `node .design-system/scripts/validate-delete.mjs` exit 0, commit df3286b | yes |
| D-03 | 3 | The token source stays one hand-written block in app/globals.css: 62 tokens, each with a role comment (the 15 space steps share one) | One theme, no utility framework, no build step for tokens. 62 is past the usual 40 cutoff for a hand-kept file, and a generator would be a second source for one page | app/globals.css, token count by script (62 tokens, 0 unused), docs/system/decisions.md D3 | yes |
| D-04 | 3 | Existing token names stay. New ones are named by job; space steps are named by pixel value | The 12 names were in correct use. Every space value keeps its exact pixel, so the name says the value | docs/system/decisions.md D4 | yes |
| D-05 | 3 | 82 raw values swapped for tokens holding the same value (14 colors, 68 px lengths), plus type sizes inside `font:` shorthands | Identical-value swaps need no clearance | `pixdiff.mjs review tmp/build/swap --surface home`: 6 compared, 0 over 0%, tolerance 0, exit 0, at commit f7f8e96. Computed transitions after: `transform 0.12s, box-shadow 0.12s` and `opacity 0.15s` (evidence/home/walk.json), equal to the source values at c581378 | yes |
| D-06 | 3 | 16 one-off values stay raw and sit in scripts/check-allowlist.json: `#000` twice (a mask's alpha), `#ffffff` in layout.tsx (metadata cannot read a CSS variable), `left: -999px`, `height: 56px`, `gap: 9px`, `width` and `height` of 24px, 16px and 8px, `max-width` 400px and 440px, and the two `clamp()` paddings of the hero and the section head | Each places one thing once. A token for each would be a name with one reader | `check-system.mjs --left`: 16 allowlisted, close.md; docs/system/colors.md and layout.md, Not tokens | yes |
| D-07 | 4 | Registry: InstallButton (the Button family's canonical), Logo, HeroGraph, in components/ (uiDir). No file moved | The three files are the app's only components and each has call sites | registry.json, `rg -n` for the three tags in app and components: 4 call sites (2, 1 and 1) | yes |
| D-08 | 6 | `.step p { max-width: var(--measure) }` | trap/text-measure at 1440: the step text ran 97 characters a line (probe: 95ch), now 60. Every other paragraph kind was already capped, and 640px is the page's own value | evidence/home/walk-before-fix.json and walk.json, review/home-after-1440.probe.json (no text-measure finding), commit 3ca4ffb, traces.tsv | yes |
| D-09 | 2 | No-change control: a second capture of the same build matches the baseline at 0% on 6 captures | Proves the captures are stable: reduced motion on, so the hero graph draws one still frame | `pixdiff.mjs review tmp/build/control`: 6 compared, 0 over 0%, exit 0 | yes |
| D-10 | 5 | `npm run check` runs check-system twice (allowlist, then ratchet), check-spec, gen-docs --check, `next typegen`, `tsc --noEmit` and eslint | The ratchet alone would pass a new literal that replaces an allowed one | package.json; seeded `.seeded { color: #123456; padding: 13px; }` fails both runs with exit 1 | yes |
| D-11 | 7 | The AGENTS.md block tells agents to add `--root .` to script commands and to use `npm run check` and `npm run docs` | web/ is not the git root, and the generated index prints the commands without the flag | AGENTS.md, `node scripts/gen-docs.mjs --check` without the flag prints "no source folder" | yes |
| D-12 | 6 | The pilot review used the capture probes and a scripted keyboard walk, not a separate ui-review pass | One coordinator, no agents (small app) | evidence/home/walk.json, review/*.probe.json | yes |
| D-13 | 9 | Page order: hero, what it does, live demo, numbers, questions, footer. The closing section is gone and the footer carries the second install box. Each section opens with a mono label. Copy cut so no body paragraph runs past two lines at 1440 | The direction's first part, structure and copy | review/redesign/home-after-1440.png (local), app/page.tsx, commit 2c5fd6f | yes |
| D-14 | 9 | HeroScene replaces HeroGraph: an inline svg in the one accent color, seven sprouts carrying the Logo on dashed ground with dashed links, CSS sway and dash flow. HeroGraph, its spec, examples, rule tests and registry entry are deleted | The direction's third part. Built from the mark and a memory graph, nothing from the reference sites | components/hero-scene.tsx, docs/system/hero-scene.md, walk-redesign.json: 13 animations running, 0 under reduced motion | yes |
| D-15 | 9 | TerminalDemo types `bravogram remember` and `bravogram recall` with the real output of bravogram 0.1.1, once, in 4.1 seconds, and renders finished first. The three steps stay as text beside it, without their sentences | The brief's live demo. Output pasted from a real run on a throwaway database (BRAVOGRAM_DB in /tmp), the person's memory.db untouched | evidence/terminal-demo/cli-output.txt, walk-redesign.json: 1 box height, 0 hidden characters under reduced motion | yes |
| D-16 | 9 | Tokens: 66 (was 62), 0 unused. Added --target-min, --hero-top, --scene-height, --motion-sway, --motion-flow. Removed --font-size-closing with the closing h2. Allowlist 13 (was 16), ratchet lowered | New parts read tokens, and the hero padding and the canvas mask left the allowlist | token count by script, `check-system.mjs --left` exit 0: css-px 12, raw-value 1 | yes |
| D-17 | 9 | Decided defaults landed, one commit each: G-06 --soft at 56% black (62e6097), F-01 links 24px tall (c8b51a7), F-02 accent ring on focusable code blocks (6ebf1b2), F-08 table units at --font-size-caption (e704580), G-05 step number above its text under 521px (8f310fe) | The brief | probe: 0 of 98 texts under 4.5:1; walk-redesign.json: every tab stop 24px or taller with the accent ring (17 of 17 at 390, 15 of 15 at 1440), step text 32 characters a line at 390 | yes |
| D-18 | 9 | The redesign commit 2c5fd6f does not pass `npm run check` on its own: a lint error in terminal-demo.tsx and an orphaned twin. 68de533 fixes both | Found by running the check after the commit, fixed forward since history is not rewritten | `npm run check` exit 1 at 2c5fd6f and 8f310fe, exit 0 at 68de533 | yes |

## Gates
| ID | Question | Default | Status | Commit | From |
|---|---|---|---|---|---|
| G-04 | Under 521px the nav hides "How it works" and shows no menu button (trap/narrow-hidden-nav, measured at 390). Show a cue? The four items need about 399px at the nav's 20px gap, so they do not fit 390, and a real fix is a menu button or a two-row header | keep it hidden: the link is an in-page anchor to a section two screens down, and the page was approved today. Step 6: the link is removed from the nav instead, so nothing is hidden (G-12) | done | 2c5fd6f | probe.mjs on review/home-before-390.probe.json |
| G-05 | At 390 wide the step text runs 26 characters a line (probe: 24ch, wants 30 to 75), because the step number takes a 44px column. Stack the number above the text on phones? | keep the two columns. Step 6, decided by the boss: stack the number above the text under 521px | done | 8f310fe | probe.mjs, evidence/home/walk.json |
| G-06 | Text in --soft (black at 40%) is 2.85:1 on white, under 4.5:1, on 15 small texts at 12 to 14px: eyebrow, meta line, table headers and units, the note, the footer, and 5 mock title bars hidden from assistive technology. Darken it? --text (55%) measures 4.74:1 | keep --soft as approved. Step 6, decided by the boss: raise it to pass 4.5:1 | done | 62e6097 | review/home-after-1440.probe.json |
| G-07 | Should the page's sections (card and mock window, steps, numbers table, questions, nav, footer, section head) become components with specs? | no: each is used in one place, so they stay markup in app/page.tsx with a Meanwhile row each | default (unanswered) | 7370786 | D-07 |
| G-08 | Areas with no decision: a dark theme, loading, error and empty states, imagery beyond the three drawings, and a writing page with voice rules | none decided: coverage-gaps.md gives a Meanwhile for each | default (unanswered) | 7370786 | docs/system/coverage-gaps.md |
| G-09 | Merge the near-duplicates the token block now shows? Text sizes 12.5, 13 and 13.5px; three line heights for 16px text (25px, 26px, 1.7); space steps 9, 14, 18, 22, 26px off a 4px grid; a 16px mock corner inside a 14px card | not merged: every token holds the value the approved page used | default (unanswered) | f7f8e96 | D-05 |
| G-10 | Should the generated docs and llms.txt be served by the live site at /system/*.md and /llms.txt? | no: they are written to docs/generated/, which the site does not serve. An llms.txt at the root of a product site would describe the design system, not the product | default (unanswered) | 7370786 | gen-docs |
| G-11 | With --soft raised to 56% black it would sit level with body text at 55%. Darken --text to 70% (8.59:1) so body text still reads above captions? | yes, --text is 70% black | default (unanswered) | 2c5fd6f | step 6 |
| G-12 | Copy and structure cuts in the redesign: the closing h2 "Give your agents a memory." and the "How it works" nav link are gone, the step sentences and the "what it does" intro paragraph are cut, answers are shortened, and three section labels carry the wit ("Receipts", "You were going to ask", "That's the whole pitch"). The headline sits above the scene, not inside it. Keep these? | keep them | default (unanswered) | 2c5fd6f | step 6 |
| G-13 | The hero scene sways for as long as the page is open, and its CSS loops keep running off screen. It stops only under the system's reduced motion setting. Add a pause control, or stop the loop after a few seconds (WCAG 2.2.2)? | keep it looping | default (unanswered) | 2c5fd6f | step 6 |

G-01, G-02 and G-03 are the boss's gates, in boss/state.md.

## Ledger
| Unit | Owner | Branch | Commit | Status | Verdict | Evidence |
|---|---|---|---|---|---|---|
| setup | coordinator | ds/2026-10-03-full | 552e5ec | done | verified | check-system --self-test with the skill's fixtures: 76 fixtures and 13 checks, exit 0 |
| delete:term | coordinator | ds/2026-10-03-full | df3286b | done | verified | validate-delete.mjs exit 0; pixdiff 0% on 6 captures |
| tokens | coordinator | ds/2026-10-03-full | 41a8cf3 | done | verified | 62 tokens, 0 unused (script) |
| swaps | coordinator | ds/2026-10-03-full | f7f8e96 | done | verified | pixdiff 6 compared, 0 over 0%, tolerance 0 |
| check | coordinator | ds/2026-10-03-full | 7370786 | done | verified | npm run check exit 0; seeded violations exit 1 |
| family:install-button | coordinator | ds/2026-10-03-full | 7370786 | done | verified with gaps | check-spec 0 failures; gap: no interaction test file, keyboard rows walked by script |
| component:logo | coordinator | ds/2026-10-03-full | 7370786 | done | verified with gaps | check-spec 0 failures; gap: optical size and alignment not measured |
| component:hero-graph | coordinator | ds/2026-10-03-full | 7370786 | done | verified with gaps | check-spec 0 failures; gap: contrast of text over moving dots not measured |
| docs generator | coordinator | ds/2026-10-03-full | 7370786 | done | verified | gen-docs --check: 16 outputs, all fresh; a stale twin fails it |
| pilot:home | coordinator | ds/2026-10-03-full | 3ca4ffb | done | verified | montage --diff exit 0; 390 at 0%; 1440 taller by 26px, traced to D-08 |
| clean clone | coordinator | ds/2026-10-03-full | d96b4ac | done | verified | fresh `git clone` of the branch at d96b4ac, `npm ci` exit 0, `npm run check` exit 0, `npm run build` exit 0. The clone holds the committed .design-system/evidence and review probe files, which the spec check reads for cited paths |
| redesign:home | coordinator | ds/2026-10-03-full | 68de533 | done | verified with gaps | review/redesign: montage exit 0, probe 0 findings, walk exit 0; gap: G-13 |
| component:hero-scene | coordinator | ds/2026-10-03-full | 68de533 | done | verified with gaps | check-spec 0 failures; gap: no pause control, loops run off screen |
| component:terminal-demo | coordinator | ds/2026-10-03-full | 68de533 | done | verified | check-spec 0 failures; walk-redesign.json |

## Handoff report

### Summary
Asked: a design system for the Bravogram landing page (the bare command, no complaint named). Answered: the page's 98 raw values are now 62 named tokens in app/globals.css plus 16 listed one-off values, three components have specs, and `npm run check` fails on a new raw color or px length. The page looks the same at 390 wide (0% pixel difference). At 1440 wide one thing changed: the step text stops at 640px.
Predicate: met on all four parts (3 components for 1 of 1 families and the two drawings, 62 of 62 tokens with a role, checks fail on 2 seeded violations and exit 0 on a clean clone, pilot matches except D-08).

### Gates, unanswered first
G-04 default (unanswered), nav link stays hidden under 521px. G-05 default (unanswered), steps keep two columns at 390. G-06 default (unanswered), --soft stays at 2.85:1. G-07 default (unanswered), sections stay page markup. G-08 default (unanswered), no dark theme, data states, imagery or writing rules decided. G-09 default (unanswered), near-duplicate values not merged. G-10 default (unanswered), generated docs not served by the site.

### Checks
npm run check → exit 0 in web/ and on a clean clone (allowlist: 16 entries in 2 files, scripts/check-allowlist.json; ratchet: scripts/check-ratchet.json)
npm run lint → exit 0. npm run build → exit 0. capture.mjs --status on the production server → / answers 200, exit 0
node <skills>/build-design-system/scripts/montage.mjs --root . --diff --widths 390,1440 → exit 0, 1 surface: 1 changed (traced to D-08), 0 unchanged
Pilot traps: trap/text-measure at 1440 fixed, 97 to 60 characters a line (evidence/home/walk-before-fix.json, walk.json). trap/narrow-hidden-nav gated (G-04). trap/text-measure at 390 gated, 26 characters a line (G-05)
CI: runs locally, not in CI. The repo's workflow covers the CLI only and is outside this run's scope

### Screens
Changed on ds/2026-10-03-full: / (D-08, at 1440 wide only). There is no other route. Review page: .design-system/review/index.html (the PNGs beside it are local, not committed).

### What exists
- Token source: the block at the top of app/globals.css (62 tokens, hand-written, no generator)
- Components components/ (install-button, logo, hero-graph), registry.json, specs docs/system/, changelog docs/system/changelog.md
- Twins, rules, index and llms.txt in docs/generated/ (npm run docs), checks in npm run check
- AGENTS.md block and generated index. No codemod and no migration map: one route, nothing to migrate

### Readiness
| Component | Grade | Reason |
|---|---|---|
| InstallButton | ready | |
| Logo | ready with gaps | optical size and alignment not measured; traced from an image, no original vector |
| HeroGraph | ready with gaps | contrast of the hero text over the moving dots not measured |

### Next screen
The next likely change is a new section on the same page. It hits coverage gap "A new section" (Meanwhile: `section.pad` with a `.head` and one h2) and, if it needs a second action, "Other buttons".

### Trial
skipped (small app): no agent was started in this run.

### The check cannot see
Copied from `node scripts/check-system.mjs --list-blind-spots`: rendered contrast, behavior (click, Enter, Escape, focus order), layout at each viewport and target sizes, visual overrides built at runtime, loading states shown without a label ternary, class names and values built at runtime, bg-white and text-black, files outside app/ and components/, whether a token's role comment still matches its use, rules marked review, motion that is only measured, and whether a pressed style covers a removed tap highlight.

### Next
From .design-system/close.md. Raw values left: 16 on 1 route (was 98), all listed one-offs. Tokens: 62 (was 15). Nothing is left to migrate: the one route is the pilot.

### Redesign (step 6)
The page is redesigned in the person's direction on the same branch, head 68de533. What changed, by section, is the one row of review/redesign/traces.tsv. Checks at 68de533: npm run check exit 0, npm run lint exit 0, npm run build exit 0, capture.mjs --status exit 0 (/ answers 200), montage.mjs on review/redesign exit 0, probe.mjs 0 findings on the six after captures, walk.mjs exit 0. Tokens 66, allowlist 13, registry: InstallButton, Logo, HeroScene, TerminalDemo. The sections above this one describe the build as it closed at 15244fa.

### Found, not fixed
After step 6. G-04, G-05, G-06, F-01, F-02 and F-08 from the build are fixed (D-17, G-12).

| ID | Severity | Route | What | Why not fixed | Fix |
|---|---|---|---|---|---|
| G-13 | should-fix | / | The hero scene loops with no pause control, and keeps running off screen | gate | Stop the sway after a few cycles, or add a pause button |
| G-09 | note | / | Near-duplicate values: 12.5, 13 and 13.5px text; 25px, 26px and 1.7 line heights for 16px text; space steps 9, 14, 18, 22 and 26px; a 16px corner inside a 14px card | gate | Merge each group to one value and delete the spare tokens |
| F-03 | note | / | No interaction test file: the keyboard, copy and terminal behavior were walked by script, in .design-system/scripts/walk.mjs | out of scope | A test runner is a new dependency. With one, port walk.mjs to a test |
| F-04 | note | shared | `npm run check` is not in CI | out of scope | A web job in the root workflow: `npm ci && npm run check` in web/ |
| F-05 | note | shared | No writing page, so no copy check (G-08) | gate | Write docs/system/writing.md and add copy-check.mjs to the check |
| F-06 | note | / | Not measured: Logo optical size and alignment, zoom to 200%, reflow at 320px, the scene and the typing with motion on in a real browser by eye | out of scope | Measure each on the running page and fill the NEEDS REVIEW lines in the docs |
| F-07 | note | shared | The token tables in the foundation pages are hand-written copies of the token block, with no drift check | out of scope | Generate the tables from the role comments, or delete the Value column |
| F-09 | note | shared | Not done on this small app: the fresh-agent trial, the review lenses, the two-agent rule tests, the four project skills, a CODEOWNERS line, a separate ui-review pass | out of scope | Run them when a second person or agent starts working on the page |
| F-10 | note | shared | The generated AGENTS.md index prints script commands without `--root .`, which web/ needs | out of scope | Kept as generated. The hand-written block above it says to add the flag (D-11) |
| F-11 | note | / | The terminal demo and every mock window are hidden from assistive technology; the same facts are in the card text and the three commands | out of scope | Give the terminal a text alternative if its content ever says more than the page does |
| F-12 | note | / | The Remember and Recall cards show memory #24 in a stylized form, and the terminal shows the real output with #1 and bracketed hits | out of scope | Paste real output into the two card mocks as well |
Rows past 30: none
