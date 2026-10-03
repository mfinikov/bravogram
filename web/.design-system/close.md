# Close numbers

Written 2026-10-03 16:06 on ds/2026-10-03-full. Every count in the handoff comes from this file.

## What the allowlist still holds

`node scripts/check-system.mjs --root . --no-self-test --left` (exit 0)

```
left: 16 allowlisted finding(s) in 2 file(s): rule/css-px 13, rule/raw-value 3
left	app/globals.css	rule/css-px	13
left	app/globals.css	rule/raw-value	2
left	app/layout.tsx	rule/raw-value	1
check-system: 12 file(s) under /Users/arsenii/Documents/bravogram-memory-ds/web, 0 failing, 16 allowlisted
```

## Review page

`node <skills>/build-design-system/scripts/montage.mjs --root . --diff --widths 390,1440` (exit 0). No warning sits on an open gate: the two traps it lists "(as before)" are G-04 and G-05, unchanged from the baseline.

```
home	changed	390:0% 1440:size 1440x4787 vs 1440x4813 faq-open@390:0% faq-open@1440:size 1440x4867 vs 1440x4894 copied@390:0% copied@1440:size 1440x4787 vs 1440x4813	D-08	nav link "How it works" out of reach at 390px: hidden, and no visible menu button, no cue (trap/narrow-hidden-nav) (as before); p "Connect your agent . Any MCP client u e " lines measure 24ch (29 characters), 5 lines in a 284px column (trap/text-measure) (as before); faq-open: nav link "How it works" out of reach at 390px: hidden, and no visible menu button, no cue (trap/narrow-hidden-nav) (as before); faq-open: p "Connect your agent . Any MCP client u e " lines measure 24ch (29 characters), 5 lines in a 284px column (trap/text-measure) (as before); copied: nav link "How it works" out of reach at 390px: hidden, and no visible menu button, no cue (trap/narrow-hidden-nav) (as before); copied: p "Connect your agent . Any MCP client u e " lines measure 24ch (29 characters), 5 lines in a 284px column (trap/text-measure) (as before)
montage: 1 surfaces: 1 changed, 0 unchanged. Wrote /Users/arsenii/Documents/bravogram-memory-ds/web/.design-system/review/index.html
Coverage: 1 surface(s) at widths 390,1440, first theme only, pixels by pixdiff.mjs at tolerance 0, behavior from the .probe.json pairs. Not compared: other themes (pixdiff.mjs on the folders proves those), widths outside --widths, hover, focus and motion in flight
```

## Pixels

`node <skills>/build-design-system/scripts/pixdiff.mjs .design-system/review .design-system/review --surface home` (exit 1, as expected: the three 1440 captures are 26px taller, D-08)

```
home-before-1440.png	1440x4787 vs 1440x4813	-	-	max delta -	tolerance 0
home-before-390.png	same size	0%	no change	max delta 0	tolerance 0
home.copied-before-1440.png	1440x4787 vs 1440x4813	-	-	max delta -	tolerance 0
home.copied-before-390.png	same size	0%	no change	max delta 0	tolerance 0
home.faq-open-before-1440.png	1440x4867 vs 1440x4894	-	-	max delta -	tolerance 0
home.faq-open-before-390.png	same size	0%	no change	max delta 0	tolerance 0
6 compared, 3 over 0%, tolerance 0, 0 of other surfaces skipped
Coverage: 6 pair(s) compared pixel by pixel on every channel including alpha, every before file in /Users/arsenii/Documents/bravogram-memory-ds/web/.design-system/review for home. Not compared: after files with no before file, accessibility trees, probe files, motion, and any state or width that was not captured
```

## Inventory by route

From `node scripts/check-system.mjs --root . --no-self-test --no-allowlist` at the start (commit c581378 plus the copied scripts) and at the close.

| Route | Raw colors before | Raw colors now | Raw px lengths before | Raw px lengths now | Tokens before | Tokens now | Registry components |
|---|---|---|---|---|---|---|---|
| / | 17 | 3 | 81 | 13 | 15 | 62 | 3 |

All 16 values left are one-off values named in decision D-06 and listed in scripts/check-allowlist.json. Tokens: 62 in app/globals.css, 0 unused, 47 with their own role comment and the 15 space steps under one shared role comment (counted by script, run.md D-03).
