#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { open, dbPath } from '../src/db.js'
import { remember, recall, show, link, forget } from '../src/memory.js'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const HELP = `bravogram ${version}: local memory shared by all your agents

  bravogram remember "text" [--title T] [--type T] [--project P] [--tags a,b]   save (same title updates)
  bravogram remember - < note.md                                                 read the text from stdin
  bravogram recall "words" [--project P] [--type T] [--source S] [--limit 5]   search
  bravogram show <id|title>                                                      one memory with its links
  bravogram link <a> <b> [--kind relates|supersedes|part_of]                     connect two memories
  bravogram forget <id>                                                          delete one memory
  bravogram graph [--port 4747] [--no-open]                                      see your memory as a graph
  bravogram import <folder>                                                      pull in an Obsidian vault
  bravogram export <folder>                                                      write everything out as markdown
  bravogram mcp                                                                  run as an MCP server for agents

  --json      machine readable output
  --source S  who is writing (default: $BRAVOGRAM_SOURCE or "cli")
  memory file: ${dbPath()} (set BRAVOGRAM_DB to change)`

const fail = e => { console.error(`bravogram: ${e.message}`); process.exit(1) }

let parsed
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: 'string' }, type: { type: 'string' }, project: { type: 'string' }, tags: { type: 'string' },
      source: { type: 'string' }, limit: { type: 'string' }, since: { type: 'string' }, kind: { type: 'string' },
      port: { type: 'string' }, 'no-open': { type: 'boolean' }, json: { type: 'boolean' }, force: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' },
    },
  })
} catch (e) { fail(e) }
const { values: o, positionals: [cmd, ...args] } = parsed

const out = (data, text) => console.log(o.json ? JSON.stringify(data, null, 2) : text(data))
const need = (n, usage) => { if (args.length < n) throw new Error(`usage: bravogram ${usage}`) }
const source = o.source || process.env.BRAVOGRAM_SOURCE || 'cli'

async function main() {
  if (o.version) return console.log(version)
  if (!cmd || o.help || cmd === 'help') return console.log(HELP)
  const db = open()
  switch (cmd) {
    case 'remember': {
      need(1, 'remember "text"  (or - to read stdin)')
      const body = args[0] === '-' ? readFileSync(0, 'utf8') : args.join(' ')
      const r = remember(db, { body, title: o.title, type: o.type, project: o.project, tags: o.tags?.split(',').map(s => s.trim()), source, force: o.force })
      return out(r, r => `${r.updated ? 'updated' : 'saved'} #${r.id} ${r.title}`)
    }
    case 'recall': {
      const rows = recall(db, args.join(' '), { limit: o.limit ?? 5, project: o.project, type: o.type, source: o.source, since: o.since })
      return out(rows, rows => rows.length
        ? rows.map(r => `#${r.id} ${r.title} [${[r.type, r.project].filter(Boolean).join('/')}]\n    ${r.snippet}`).join('\n')
        : 'nothing found')
    }
    case 'show': {
      need(1, 'show <id|title>')
      return out(show(db, args.join(' ')), m => [
        `#${m.id} ${m.title}`,
        `${[m.type, m.project, `by ${m.source}`, `updated ${m.updated}`].filter(Boolean).join(' · ')}`,
        '', m.body.trimEnd(), '',
        `links: ${m.links.map(l => l.title + (l.ghost ? ' (not written yet)' : '') + (l.kind !== 'wiki' ? ` (${l.kind})` : '')).join(', ') || 'none'}`,
        `backlinks: ${m.backlinks.map(b => b.title).join(', ') || 'none'}`,
      ].join('\n'))
    }
    case 'link': {
      need(2, 'link <a> <b> [--kind relates|supersedes|part_of]')
      return out(link(db, args[0], args[1], o.kind), r => `linked ${r.from} -> ${r.to} (${r.kind})`)
    }
    case 'forget': {
      need(1, 'forget <id>')
      return out(forget(db, args[0]), r => `forgot #${r.id} ${r.title}`)
    }
    case 'import': {
      need(1, 'import <folder>')
      const { importDir } = await import('../src/markdown.js')
      return out(importDir(db, resolve(args[0]), { source: o.source || 'import' }), r =>
        [`imported ${r.notes} new, ${r.updated} updated, ${r.links} links (${r.ghosts} point at notes not written yet)`,
          ...r.skipped.map(s => `skipped ${s}`)].join('\n'))
    }
    case 'export': {
      need(1, 'export <folder>')
      const { exportDir } = await import('../src/markdown.js')
      return out(exportDir(db, resolve(args[0])), r => `exported ${r.exported} memories to ${r.dir}`)
    }
    case 'graph': {
      const { startGraph } = await import('../src/graph.js')
      const { url } = await startGraph(db, { port: Number(o.port ?? 4747), open: !o['no-open'] })
      return console.log(`graph at ${url}  (ctrl+c to stop)`)
    }
    case 'mcp': {
      const { serve } = await import('../src/mcp.js')
      return serve(db, version)
    }
    default:
      throw new Error(`unknown command "${cmd}", run: bravogram --help`)
  }
}

main().catch(fail)
