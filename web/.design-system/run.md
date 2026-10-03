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
## Decisions
## Gates
## Ledger
## Handoff report
