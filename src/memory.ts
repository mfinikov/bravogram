import { tx, get, all, type DB } from './db.ts'

export const TYPES = ['note', 'fact', 'decision', 'lesson', 'state', 'person', 'reference', 'project', 'system']
export const LINK_KINDS = ['relates', 'supersedes', 'part_of']

export interface Memory {
  id: number
  title: string
  body: string
  type: string
  project: string | null
  tags: string
  source: string
  created: string
  updated: string
}

export interface RememberInput {
  body?: string
  title?: string
  type?: string
  project?: string
  tags?: string | string[]
  source?: string
  created?: string
  updated?: string
  force?: boolean
}

export interface Saved { id: number; title: string; updated: boolean }

export interface RecallOptions { limit?: number | string; project?: string; type?: string; source?: string; since?: string }
export interface Hit { id: number; title: string; type: string; project: string | null; source: string; updated: string; snippet: string }

export interface Issue { level: 'error' | 'warn' | 'info'; kind: string; message: string }

const SECRET = /sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_\w{20,}|AKIA[0-9A-Z]{16}|xox[abprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/
const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g
const ID = /^#?\d+$/

const now = () => new Date().toISOString()

export function wikilinks(body: string): string[] {
  return [...new Set([...body.matchAll(WIKILINK)].map(m => m[1].trim()).filter(Boolean))]
}

export function looksSecret(text: string): boolean {
  return SECRET.test(text)
}

const byId = (db: DB, id: string | number) => get<Memory>(db, 'SELECT * FROM memories WHERE id = ?', Number(id))
const byTitle = (db: DB, title: string) => get<Memory>(db, 'SELECT * FROM memories WHERE title = ?', title)

export function find(db: DB, ref: string | number): Memory {
  const r = String(ref).trim()
  const m = (ID.test(r) && byId(db, r.replace('#', ''))) || byTitle(db, r)
  if (!m) throw new Error(`no memory "${r}"`)
  return m
}

// Same title means update, never a duplicate. Wikilinks in the body are re-derived on every save.
export function remember(db: DB, input: RememberInput): Saved {
  const { type, project, source = 'cli', created, updated, force = false } = input
  const body = String(input.body ?? '')
  const explicit = !!input.title?.trim()
  const title = input.title?.trim() || (body.split('\n').find(l => l.trim()) ?? '').replace(/^#+\s*/, '').trim().slice(0, 60)
  if (!title) throw new Error('nothing to remember: give some text or a --title')
  if (type && !TYPES.includes(type)) throw new Error(`unknown type "${type}", use one of: ${TYPES.join(', ')}`)
  if (!force && looksSecret(title + '\n' + body)) throw new Error('this looks like an API key or private key, refusing to store it (use --force if it is not)')
  const tags = Array.isArray(input.tags) ? input.tags.join(',') : input.tags

  return tx(db, () => {
    const old = byTitle(db, title)
    // Only an explicit title may overwrite. On 2026-10-03 `remember crypto-study` derived the title
    // "crypto-study" from its text and silently replaced a 6,400 character project note.
    if (old && !explicit) {
      throw new Error(`a memory titled "${old.title}" already exists. To add to it: append "${old.title}" "<text>". To replace it: remember "<text>" --title "${old.title}"`)
    }
    const t = updated ?? now()
    let id: number
    if (old) {
      db.prepare(`UPDATE memories SET body = ?, type = ?, project = ?, tags = ?, source = ?, updated = ? WHERE id = ?`)
        .run(body, type ?? old.type, project ?? old.project, tags ?? old.tags, source, t, old.id)
      id = old.id
    } else {
      id = Number(db.prepare(`INSERT INTO memories (title, body, type, project, tags, source, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(title, body, type ?? 'note', project ?? null, tags ?? '', source, created ?? t, t).lastInsertRowid)
    }
    db.prepare(`DELETE FROM links WHERE from_id = ? AND kind = 'wiki'`).run(id)
    const add = db.prepare(`INSERT OR IGNORE INTO links (from_id, to_title, kind) VALUES (?, ?, 'wiki')`)
    for (const to of wikilinks(body)) add.run(id, to)
    return { id, title: old?.title ?? title, updated: !!old }
  })
}

// Every word is quoted, so input like `C++`, `"` or `AND` can never break the FTS syntax.
// Words are OR-ed and bm25 ranks memories matching more of them higher; 3+ letter words match as prefixes.
function ftsQuery(q: string): string {
  const words = String(q).match(/[\p{L}\p{N}_]+/gu) ?? []
  return words.map(w => `"${w}"${w.length >= 3 ? '*' : ''}`).join(' OR ')
}

export function recall(db: DB, query = '', { limit = 5, project, type, source, since }: RecallOptions = {}): Hit[] {
  const where: string[] = []
  const params: string[] = []
  for (const [col, val] of [['project', project], ['type', type], ['source', source]] as const) {
    if (val) { where.push(`m.${col} = ?`); params.push(val) }
  }
  if (since) { where.push('m.updated >= ?'); params.push(since) }
  const match = ftsQuery(query)
  const filter = where.length ? `AND ${where.join(' AND ')}` : ''
  const cols = 'm.id, m.title, m.type, m.project, m.source, m.updated'
  const rows = match
    ? all<Hit>(db, `SELECT ${cols}, snippet(memories_fts, -1, '[', ']', '…', 16) AS snippet
        FROM memories_fts JOIN memories m ON m.id = memories_fts.rowid
        WHERE memories_fts MATCH ? ${filter}
        ORDER BY bm25(memories_fts, 10.0, 1.0, 2.0), m.updated DESC LIMIT ?`, match, ...params, Number(limit))
    : all<Hit>(db, `SELECT ${cols}, substr(m.body, 1, 120) AS snippet FROM memories m
        WHERE 1 ${filter} ORDER BY m.updated DESC LIMIT ?`, ...params, Number(limit))
  return rows.map(r => ({ ...r, snippet: r.snippet.replace(/\s+/g, ' ').trim() }))
}

export function show(db: DB, ref: string | number) {
  const m = find(db, ref)
  const links = all<{ title: string; kind: string; id: number | null }>(db, `SELECT l.to_title AS title, l.kind, t.id FROM links l
    LEFT JOIN memories t ON t.title = l.to_title WHERE l.from_id = ? ORDER BY l.to_title`, m.id)
  const backlinks = all<{ id: number; title: string; kind: string }>(db, `SELECT DISTINCT f.id, f.title, l.kind FROM links l
    JOIN memories f ON f.id = l.from_id WHERE l.to_title = ? ORDER BY f.title`, m.title)
  return { ...m, links: links.map(l => ({ ...l, ghost: l.id == null })), backlinks }
}

export function link(db: DB, from: string, to: string, kind = 'relates') {
  if (!LINK_KINDS.includes(kind)) throw new Error(`unknown link kind "${kind}", use one of: ${LINK_KINDS.join(', ')}`)
  const a = find(db, from)
  const b = find(db, to)
  if (a.id === b.id) throw new Error('a memory cannot link to itself')
  db.prepare('INSERT OR IGNORE INTO links (from_id, to_title, kind) VALUES (?, ?, ?)').run(a.id, b.title, kind)
  return { from: a.title, to: b.title, kind }
}

// Exact id only, never a search, so nothing gets deleted by a fuzzy match.
export function forget(db: DB, id: string | number) {
  if (!ID.test(String(id).trim())) throw new Error('forget takes an exact id, like: bravogram forget 12')
  const m = byId(db, String(id).replace('#', ''))
  if (!m) throw new Error(`no memory #${id}`)
  db.prepare('DELETE FROM memories WHERE id = ?').run(m.id)
  return { id: m.id, title: m.title }
}

// Add text to an existing memory without rewriting it: at the end, or inside one "## Section"
// (created if missing). Read and write happen under one lock, so two agents appending don't lose a line.
export function append(db: DB, ref: string | number, text: string, { section, top = false, source = 'cli' }: { section?: string; top?: boolean; source?: string } = {}): Saved {
  text = String(text).trim()
  if (!text) throw new Error('nothing to append')
  return tx(db, () => {
    const m = find(db, ref)
    let body = m.body.replace(/\s+$/, '')
    if (!section) {
      body = top ? `${text}\n\n${body}` : `${body}\n\n${text}`
    } else {
      const lines = body.split('\n')
      const start = lines.findIndex(l => l.startsWith('## ') && l.slice(3).trim().toLowerCase() === section.toLowerCase())
      if (start === -1) {
        body = `${body}\n\n## ${section}\n${text}`
      } else {
        let end = lines.findIndex((l, i) => i > start && /^#{1,2} /.test(l))
        if (end === -1) end = lines.length
        while (end > start + 1 && !lines[end - 1].trim()) end-- // keep blank lines before the next heading
        lines.splice(top ? start + 1 : end, 0, text)
        body = lines.join('\n')
      }
    }
    return remember(db, { title: m.title, body, source })
  })
}

interface RevisionSummary { rev: number; reason: string; source: string; updated: string; replaced_at: string; chars: number; start: string }

// All saved versions of a title, newest first. Works for forgotten memories too.
export function history(db: DB, ref: string | number) {
  const r = String(ref).trim()
  const m = ID.test(r) ? byId(db, r.replace('#', '')) : byTitle(db, r)
  const title = m?.title ?? r
  const revisions = all<RevisionSummary>(db, `SELECT rev, reason, source, updated, replaced_at, length(body) AS chars, substr(body, 1, 80) AS start
    FROM revisions WHERE title = ? ORDER BY rev DESC`, title)
  if (!m && !revisions.length) throw new Error(`no memory or history for "${r}"`)
  return { title, current: m ? { id: m.id, updated: m.updated, chars: m.body.length } : null, revisions }
}

// Bring back a saved version (default: the newest). Restoring is itself saved, so it can be undone.
export function restore(db: DB, ref: string | number, rev?: string | number) {
  const h = history(db, ref)
  const pick = rev == null ? h.revisions[0] : h.revisions.find(r => r.rev === Number(rev))
  if (!pick) throw new Error(rev == null ? `"${h.title}" has no earlier versions` : `no version ${rev} of "${h.title}"`)
  const r = get<Memory & { rev: number }>(db, 'SELECT * FROM revisions WHERE rev = ?', pick.rev)!
  const out = remember(db, { title: h.title, body: r.body, type: r.type, project: r.project ?? undefined, tags: r.tags, source: 'restore', created: r.created, force: true })
  return { ...out, rev: r.rev }
}

// Health check. Everything here is something that bit us for real or would silently degrade recall.
export function doctor(db: DB) {
  const issues: Issue[] = []
  const add = (level: Issue['level'], kind: string, message: string) => issues.push({ level, kind, message })
  // rank 1 makes FTS5 also compare the index against the memories table
  try { db.exec(`INSERT INTO memories_fts(memories_fts, rank) VALUES ('integrity-check', 1)`) }
  catch { add('error', 'search-index', 'search index is out of sync, run: bravogram doctor --fix') }
  const rows = all<Memory>(db, 'SELECT id, title, body, type, project, updated FROM memories')
  const seen = new Map<string, Memory>()
  for (const m of rows) {
    const key = m.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
    const dup = seen.get(key)
    if (dup) add('warn', 'duplicate', `#${dup.id} "${dup.title}" and #${m.id} "${m.title}" look like the same memory`)
    else seen.set(key, m)
    if (/[^\s#]##+ /.test(m.body)) add('warn', 'glued-heading', `#${m.id} "${m.title}" has a heading glued to the end of a line, so that section won't be found`)
    if (looksSecret(m.body)) add('error', 'secret', `#${m.id} "${m.title}" contains something that looks like a key`)
    if (m.body.length > 12000) add('warn', 'huge', `#${m.id} "${m.title}" is ${m.body.length} characters; split it, agents read it whole on show`)
    if (m.type === 'project' && !m.body.startsWith('Paths:')) add('info', 'no-paths', `project "${m.title}" has no Paths: line, so the session hook can't match its folder`)
    if (m.type === 'state' && Date.now() - Date.parse(m.updated) > 30 * 864e5) add('info', 'stale', `state #${m.id} "${m.title}" is over 30 days old`)
  }
  for (const g of all<{ to_title: string; froms: string }>(db, `SELECT l.to_title, group_concat(f.title, ', ') AS froms FROM links l
      JOIN memories f ON f.id = l.from_id LEFT JOIN memories t ON t.title = l.to_title
      WHERE t.id IS NULL GROUP BY lower(l.to_title)`)) {
    add('info', 'ghost', `"${g.to_title}" is linked from ${g.froms} but not written yet`)
  }
  const linked = new Set(all<{ id: number }>(db, `SELECT from_id AS id FROM links UNION SELECT t.id FROM links l JOIN memories t ON t.title = l.to_title`).map(r => r.id))
  for (const m of rows) if (!linked.has(m.id) && m.type !== 'state') add('info', 'orphan', `#${m.id} "${m.title}" has no links`)
  return { memories: rows.length, issues }
}

export function rebuildIndex(db: DB): void {
  db.exec(`INSERT INTO memories_fts(memories_fts) VALUES ('rebuild')`)
}

export interface GraphNode { id: number | string; title: string; type: string; project?: string | null; source?: string; updated?: string; ghost?: boolean; degree?: number }

export function graph(db: DB) {
  const nodes = all<GraphNode>(db, 'SELECT id, title, type, project, source, updated FROM memories')
  const byLowerTitle = new Map(nodes.map(n => [n.title.toLowerCase(), n.id]))
  const links: { source: number | string; target: number | string; kind: string }[] = []
  const ghosts = new Map<string, GraphNode>()
  for (const l of all<{ from_id: number; to_title: string; kind: string }>(db, 'SELECT from_id, to_title, kind FROM links')) {
    let target = byLowerTitle.get(l.to_title.toLowerCase())
    if (target == null) {
      const id = `ghost:${l.to_title.toLowerCase()}`
      if (!ghosts.has(id)) ghosts.set(id, { id, title: l.to_title, type: 'ghost', ghost: true })
      target = id
    }
    links.push({ source: l.from_id, target, kind: l.kind })
  }
  const nodesAll = [...nodes, ...ghosts.values()]
  const degree = new Map<number | string, number>()
  for (const l of links) for (const end of [l.source, l.target]) degree.set(end, (degree.get(end) ?? 0) + 1)
  for (const n of nodesAll) n.degree = degree.get(n.id) ?? 0
  return { nodes: nodesAll, links }
}
