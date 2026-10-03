<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI work

Before you add or change a component, a section, a style, a token, or copy on the page:
1. Read the token block at the top of `app/globals.css`. Every color, font, text size, space, radius and motion value is a token there, and each token's comment says its job.
2. Use a token. If none fits, ask before adding one. Raw colors and px lengths outside that block fail the check.
Before you finish: run `npm run check`, and look at the page at 390 and 1440 wide.
`node scripts/check-system.mjs --root . --explain <rule-id>` gives the fix for a finding.
