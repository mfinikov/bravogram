# Bravogram memory: plan

One local memory that every agent on your machine shares: Claude, Hermes, anything else.
CLI first, MCP for agents, a graph page so you can see it. Open source on GitHub and npm.

Written 2026-10-03. Idea locked until 2026-11-02 (see vault note `bravogram`).

## What it is in one sentence

`bravo remember` saves a memory, `bravo recall` finds it in milliseconds from any agent, `bravo graph` shows how everything connects.

## Why it beats Obsidian, for agents

Obsidian is great for a human writing notes. For agents it is a pile of files they have to grep and read whole.

| Problem with the vault today | Bravo |
|---|---|
| Agents grep folders and read whole notes, which burns tokens | Indexed full text search returns short snippets, top 5 by default |
| No index, search gets slower as the vault grows | SQLite FTS5 index, recall stays in milliseconds at 10,000+ memories |
| Two agents writing the same file at once can clobber each other | One database file with safe concurrent writes (SQLite WAL) |
| Links are text that each agent has to parse | Links are real rows, so "what connects to X" is one query |
| No record of which agent wrote what | Every memory stores its source agent and time |
| Graph view is inside the Obsidian app only | `bravo graph` opens a graph in any browser |

Honest limit: for a human writing long notes, Obsidian stays better. Bravo can export to markdown, so you are never locked in.

## Data model (the whole thing)

```
memories: id, title, body, type, project, tags, source, created, updated
links:    from_id, to_id, kind
```

- `type`: fact, decision, lesson, state, person, reference.
- `source`: which agent wrote it (claude, hermes, you).
- `[[wikilinks]]` inside a body become `links` rows automatically.
- Stored in `~/.bravo/memory.db`, one file, easy to back up.

## Commands (v1)

```
bravo remember "text" [--title --type --project --tags]   save a memory
bravo recall "query" [--project --type --limit 5]         search, short snippets
bravo show <id|title>                                     one full memory and its links
bravo link <a> <b> [--kind]                               connect two memories
bravo forget <id>                                         delete one
bravo graph                                               open the graph in the browser
bravo import <folder>                                     pull in an Obsidian vault (markdown, frontmatter, wikilinks)
bravo export <folder>                                     write everything back out as markdown
bravo mcp                                                 run as an MCP server for agents
```

## How agents connect

- **MCP server** (`bravo mcp`) with the tools `remember`, `recall`, `show`, `link`. Claude Code, Claude Desktop and any MCP client plug in with one config line.
- **CLI fallback**: any agent that can run a shell command can call `bravo recall` directly. Check Hermes's MCP support on day 1; if it has none, the CLI covers it.
- All agents read and write the same `~/.bravo/memory.db`, so they share one memory.

## The graph page

- `bravo graph` starts a tiny local server and opens `http://localhost:4747`.
- Dots are memories, lines are links. Colour shows type, size shows how many links.
- Search box highlights matches. Click a dot to read the memory and jump to its neighbours.
- Filter by project and by agent ("show me only what Hermes wrote").
- Read only in v1. Editing happens in the CLI.

## Stack

- **Node 24+**. Built in `node:sqlite` with FTS5, so no database dependency. Tested 2026-10-03: Node 24 and 26 work, Node 22.13 lacks FTS5.
- **Zero dependencies:** the MCP server is a small hand-written stdio JSON-RPC loop, because the official SDK pulls in about 17 packages. Switch to the SDK if we ever need resources, prompts or HTTP transport.
- **Graph:** one HTML file using the `force-graph` library from a CDN.
- npm name `bravogram` is free as of 2026-10-03. The command is `bravo`.

## Build order (one build per session, you explain each back)

1. **Store:** `remember`, `recall`, `show`, `forget`. Check: save 3 memories, find each by keyword.
2. **Links and import:** `link`, wikilinks, `bravo import` of the real vault. Check: every vault note and link arrives.
3. **MCP:** `bravo mcp`, connect Claude Code. Check: a fresh Claude session recalls a vault fact through bravo.
4. **Graph:** `bravo graph`. Check: your vault shows as a graph and clicking works.
5. **Ship:** README, `export`, publish to npm, push to GitHub. Check: `npm install -g bravogram` works on a clean shell.

**Done means:** for one full week, your agents use bravo instead of the Obsidian vault and nothing gets lost.

## Before build 1: 20 minutes on the neighbours

Look at basic-memory, mem0, Letta and Zep. To check: what each one stores, whether it is local, whether it has a graph view. Write one line each on what bravo does differently. If one already does exactly this, we use it or narrow bravo down; we don't build a copy.

## Technical spec: every feature to build

### Files (kept few on purpose)

```
bin/bravo.js        CLI entry, argument parsing with node:util parseArgs
src/db.js           open the database, schema, migrations
src/memory.js       remember, recall, show, link, forget, wikilink parsing
src/markdown.js     import and export (frontmatter, wikilinks)
src/mcp.js          MCP server over stdio
src/graph.js        local web server for the graph
src/graph.html      the graph page
test/bravo.test.js  node:test checks
```

### F1. Database (`src/db.js`)
- File at `~/.bravo/memory.db`, created on first use. `BRAVO_DB` env var overrides it (tests, multiple memories).
- WAL mode plus a 5 second busy timeout, so several agents can write at once without "database is locked".
- Schema version kept in `PRAGMA user_version`, with migrations run on open, so v2 can change tables without breaking v1 databases.
- Tables:
  - `memories`: id, title (unique, case insensitive), body, type (one of fact, decision, lesson, state, person, reference, note), project, tags, source, created, updated.
  - `memories_fts`: FTS5 index over title, body and tags, kept in sync by triggers.
  - `links`: from_id, to_id, to_title, kind. `to_title` keeps links to memories that don't exist yet ("ghost" links, like Obsidian's unresolved links). They resolve automatically when that title gets created.
- Deleting a memory removes its outgoing links. Incoming links turn back into ghosts.

### F2. Remember
- `bravo remember "text"`, or `-` to read long text from stdin.
- Title defaults to the first line, cut to 60 characters.
- **Same title means update, not duplicate.** The body is replaced and `updated` bumped, which matches the vault rule "update the note, don't make a copy".
- Every `[[wikilink]]` in the body becomes a link row. `[[name|alias]]` and `[[name#heading]]` both point to `name`.
- `source` comes from `--source`, the `BRAVO_SOURCE` env var, or the MCP client name. Default is `cli`.
- **Secret guard:** refuse text that looks like an API key (`sk-`, `ghp_`, `AKIA`, private key blocks) unless `--force` is given. Agents dump things into memory, and keys must not land there.

### F3. Recall
- FTS5 search ranked by bm25, with title matches weighted about 10 times higher than body matches. Recency breaks ties.
- Returns short snippets (FTS5 `snippet()`), not whole memories. Default 5 results, `--limit` to change.
- Filters: `--project`, `--type`, `--source`, `--since`.
- **Query escaping:** user text is quoted term by term, so input like `C++`, `"`, `AND` or `-` can never crash the search. The last word gets prefix matching, so `swarm` finds `swarms`.
- Russian works because the tokenizer handles Cyrillic. English stemming doesn't apply to it, so Russian matches word forms through prefix matching only.

### F4. Show, link, forget
- `show <id or title>`: the full memory plus its outgoing links and backlinks.
- `link <a> <b> --kind`: kinds are relates (default), supersedes, part_of.
- `forget <id>`: by exact id only, never by search, so you can't delete the wrong thing by accident.

### F5. Output for agents
- Every command takes `--json`. Default output is compact: one line per result.
- Clear error messages and non-zero exit codes, so agents can tell when something failed.

### F6. Import and export (`src/markdown.js`)
- `import <folder>`: walks every `.md` file, skipping `.obsidian/`. The title is the filename. Frontmatter gives type, project, tags, created and updated. Wikilinks become links.
- **Re-running import updates and never duplicates,** because it matches by title.
- Frontmatter parser handles only what the vault uses (`key: value`, `[a, b]` lists). It is not a full YAML parser.
- `export <folder>`: one `.md` per memory with frontmatter, in folders by type (`Projects/`, `Decisions/`, `Lessons/`...), so it opens straight in Obsidian.
- Prints counts: notes, links, ghosts, skipped files.

### F7. MCP server (`src/mcp.js`)
- `bravo mcp` speaks MCP over stdio using the official SDK.
- Tools: `remember`, `recall`, `show`, `link`. **`forget` is not exposed to agents in v1.** Deleting stays a human action.
- `source` is set automatically from the connecting client's name, so the graph knows Claude wrote one memory and Hermes another.
- Setup for Claude Code is one command: `claude mcp add bravo -- bravo mcp`. Other clients get the same command in their MCP config.

### F8. Graph (`src/graph.js`, `src/graph.html`)
- `bravo graph` starts a server on `127.0.0.1:4747` (next free port if taken) and opens the browser. It binds to localhost only, so nobody on your wifi can read your memory.
- `GET /api/graph` returns nodes (id, title, type, project, source, number of links) and links. `GET /api/memory/:id` returns one full memory.
- Page features:
  - Built with `force-graph` (canvas).
  - Colour by type, size by number of links, ghost nodes drawn hollow.
  - Search box that highlights matches.
  - Filters for project and source.
  - Click a node to open a side panel with the full text and its neighbours.
- **Memory text is escaped before it goes on the page.** Agents write the memories, and a memory containing HTML or script must not run in your browser.
- Smooth up to a few thousand nodes. Fine for a personal memory.

### F9. Tests (`test/bravo.test.js`, `node --test`)
Every test uses a temporary database.
- Remember then recall finds it, and the same title updates instead of duplicating.
- A wikilink becomes a link, and a ghost link resolves when its target gets created.
- Odd queries (`"`, `C++`, `AND`, empty) don't crash.
- Two processes writing at the same moment both succeed.
- Importing the real vault, exporting it and importing again gives the same counts.
- The secret guard blocks a fake API key.

### F10. Package and release
- `package.json` with `bin: { "bravo": "bin/bravo.js" }`. Zero dependencies. `engines` is Node 24+ (Node 22.13 has `node:sqlite` but no FTS5).
- README covering install, 5 commands, the MCP setup line and a graph screenshot.
- MIT license. Published to npm as `bravogram`, code at github.com/mfinikov/bravogram.

### What maps to which build
| Build | Features |
|---|---|
| 1 | F1, F2, F3, F4, F5, tests for them |
| 2 | F6 import and export, ghost links, round-trip test |
| 3 | F7 MCP, connect Claude Code for real |
| 4 | F8 graph |
| 5 | F10 release, README, first npm publish |

## Not in v1 (add when the reason shows up)

- **Embedding or vector search:** add when keyword recall measurably misses things.
- **Cloud sync** (v2): add when agents on another machine need the same memory.
- Editing in the graph, accounts and logins, automatic AI summaries: not until someone asks.
