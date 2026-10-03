STEP         6, redesign. You are the same worker that built the system on this branch. One worker, no fan-out, start no agents.
GOAL         The landing page at / redesigned in the person's direction, built only from the system you made (tokens, InstallButton, Logo, and new components where a family needs one), with `npm run check` and `npm run build` exiting 0, the docs regenerated, and before and after captures at 390 and 1440.
DIRECTION    The person's words: "i want the simplicity of supermemory, the design of tinyfish, and vibe of boat". Read as three separate jobs:

  Simplicity of supermemory (structure and copy):
  - Fewer sections and far fewer words. Target order: hero; what it does; a live demo; the numbers; common questions; footer. Drop the separate closing section, the footer may carry one install box.
  - One plain statement as the headline. Short paragraphs: at 1440 no body paragraph over two lines. Small mono labels (the eyebrow style) name each section. Hairline rules, lots of white space, nothing decorative that does not explain the product.
  - Every claim on the page stays true and measured. Keep the numbers and their honest note (19-note vault, small sample). No invented customers, quotes, logos or stats.

  Design of tinyfish (the visual system, mostly already in place):
  - Keep Familjen Grotesk 500 for titles at the current scale and tightness, Inter 400 for text, the bordered 1152 column with hairline dividers, the soft grey cards with a product mock window inside, the plus and minus FAQ, one accent color.
  - A "works with" line under the hero install box, as plain text chips (Claude Code, Hermes, any MCP client, any shell). Text only: no third-party logos.

  Vibe of boat (personality):
  - Replace the multi-color dot canvas with a hand-drawn, animated line-art hero scene in ONE ink color (the existing accent) on white, drawn in SVG: thin dashed and solid strokes, gentle looping motion, the large "bravogram" wordmark or the headline sitting in the scene the way boat's wordmark sits on its sea. Build the scene from Bravogram's own things: the four-ellipse logo mark and a memory graph (for example a field of thin dashed ground lines where memories sprout as small four-ellipse marks, joined by dashed links, swaying slightly). Do not draw a sea, waves, barrels, a ship or anything else from boat's page.
  - Keep the square mono install box with the hard border.
  - A small animated terminal demo in the "live demo" section: it types `bravogram remember ...`, shows the saved line, types `bravogram recall ...`, shows the snippet result. Real command names and the real output format from the CLI (see the README at the repo root). It replaces the three static step blocks; keep the three commands readable as text for people who turn motion off.
  - A little dry wit in two or three labels at most. No exclamation marks, no emoji.

MUST         - Reduced motion: every animation holds still under prefers-reduced-motion, and the terminal shows its finished state.
             - Nothing third-party: no text, images, logos, icons or font files from boat.dev, tinyfish.ai or supermemory.ai. They are a reference for the look only.
             - No new dependencies. Plain CSS and small client components, as now.
             - Land these decided defaults while you are in the files, each as its own commit: G-06 raise --soft so small text passes 4.5:1 on white; G-05 stack the step or list number above its text under 521px if steps survive the redesign; F-01 nav and footer links at least 24px tall; F-02 the accent focus ring on any focusable code block; F-08 give `td small` a named text size.
             - The graph card may keep the six graph colors, because they are the product's own legend. Everywhere else: neutrals plus the one accent.
             - Update the specs, registry and generated docs for every component you add or change, so the spec check passes with freshness on.
SCOPE        Write only under /Users/arsenii/Documents/bravogram-memory-ds/web/ (app/, components/, docs/, scripts/, registry.json, package.json scripts, .design-system/ except .design-system/boss/). Branch ds/2026-10-03-full, local commits only.
BUDGET       Stop starting new work at 17:10 local time (check with `date`), then close what is open.
EVIDENCE     Capture / before your first edit and after your last at 390 and 1440 (default, FAQ open, copied), and write the after captures to /tmp/bravo-redesign-1440.png and /tmp/bravo-redesign-390.png as well (full page), so the coordinator can look at them. Run the keyboard walk again. Stop any server you start.
RETURN       Final message: status line; `Commit: <sha>`; files written; then the report as text with commands and exit codes pasted, what changed on screen section by section, and every open question as a gate with the default you applied.

STANDING
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
- Bans: none named today. The 2026-10-01 bans for the old Bravogram app are gate G-01, default "not re-applied".
- Design direction, the person at 16:02, word for word: "i want the simplicity of supermemory, the design of tinyfish, and vibe of boat". This is the design source followed partially, in place. It replaces the earlier order that the page must look the same.

