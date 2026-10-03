# Bravogram

Local memory shared by all your AI agents. Claude, Hermes, or anything that speaks MCP or can run a shell command reads and writes the same memory on your machine. A built-in graph view lets you see how it all connects.

- **One file:** everything lives in `~/.bravo/memory.db` (SQLite).
- **Fast, lean recall:** full-text search returns short snippets, not whole notes, so agents spend fewer tokens.
- **Safe for many agents at once:** concurrent writes don't clobber each other.
- **Links:** `[[wikilinks]]` like Obsidian, plus a record of which agent wrote what.
- **Zero dependencies.** Needs Node 24 or newer.

## Install

```sh
npm install -g bravogram
```

## Use

```sh
bravo remember "Bravogram stores memory for agents" --type fact --project bravogram
bravo recall "agents memory"
bravo show bravogram
bravo link "plan" "roadmap" --kind part_of
bravo forget 12
bravo graph                        # opens the graph in your browser
bravo import ~/path/to/obsidian    # bring in an existing vault
bravo export ./backup              # write everything back out as markdown
```

Saving the same title again updates that memory instead of creating a duplicate. Add `--json` to any command for machine-readable output.

## Connect your agents (MCP)

Claude Code:

```sh
claude mcp add bravo -- bravo mcp
```

Any other MCP client uses the same command (`bravo mcp`) in its config. Agents get four tools: `recall`, `remember`, `show` and `link`. Deleting is left to you on purpose: agents can't call `forget`.

Agents without MCP can call the CLI directly, for example `bravo recall "query" --json`.

## Graph

`bravo graph` serves a page on `127.0.0.1` only. Dots are memories, colored by type and sized by how many links they have. Hollow dots are notes that something links to but nobody has written yet. You can search, filter by project or by agent, and click a dot to read the memory.

## Safety

- Text that looks like an API key or private key is refused, unless you pass `--force`.
- The graph server only listens on localhost, and memory text is escaped before it is shown.

## Develop

```sh
npm test
```

Pushing to `main` runs the tests. If the version in `package.json` isn't on npm yet, CI publishes it. To release, bump the version and push.

MIT license.
