import { tx } from './db.js'

export const TYPES = ['note', 'fact', 'decision', 'lesson', 'state', 'person', 'reference', 'project', 'system']
export const LINK_KINDS = ['relates', 'supersedes', 'part_of']

const SECRET = /sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_\w{20,}|AKIA[0-9A-Z]{16}|xox[abprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/
const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g

const now = () => new Date().toISOString()

export function wikilinks(body) {
  return [...new Set([...body.matchAll(WIKILINK)].map(m => m[1].trim()).filter(Boolean))]
}

export function looksSecret(text) {
  return SECRET.test(text)
}

const byId = (db, id) => db.prepare('SELECT * FROM memories WHERE id = ?').get(Number(id))
const byTitle = (db, title) => db.prepare('SELECT * FROM memories WHERE title = ?').get(title)

export function find(db, ref) {
  ref = String(ref).trim()
  const m = (/^#?\d+$/.test(ref) && byId(db, ref.replace('#', ''))) || byTitle(db, ref)
  if (!m) throw new Error(`no memory "${ref}"`)
  return m
}

// Same title means update, never a duplicate. Wikilinks in the body are re-derived on every save.
export function remember(db, { body = '', title, type, project, tags, source = 'cli', created, updated, force = false }) {
  body = String(body)
  title = title?.trim() || (body.split('\n').find(l => l.trim()) ?? '').replace(/^#+\s*/, '').trim().slice(0, 60)
  if (!title) throw new Error('nothing to remember: give some text or a --title')
  if (type && !TYPES.includes(type)) throw new Error(`unknown type "${type}", use one of: ${TYPES.join(', ')}`)
  if (!force && looksSecret(title + '\n' + body)) throw new Error('this looks like an API key or private key, refusing to store it (use --force if it is not)')
  if (Array.isArray(tags)) tags = tags.join(',')

  return tx(db, () => {
    const old = byTitle(db, title)
    const t = updated ?? now()
    let id
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
function ftsQuery(q) {
  const words = String(q).match(/[\p{L}\p{N}_]+/gu) ?? []
  return words.map(w => `"${w}"${w.length >= 3 ? '*' : ''}`).join(' OR ')
}

export function recall(db, query = '', { limit = 5, project, type, source, since } = {}) {
  const where = []
  const params = []
  for (const [col, val] of [['project', project], ['type', type], ['source', source]]) {
    if (val) { where.push(`m.${col} = ?`); params.push(val) }
  }
  if (since) { where.push('m.updated >= ?'); params.push(since) }
  const match = ftsQuery(query)
  const filter = where.length ? `AND ${where.join(' AND ')}` : ''
  const cols = 'm.id, m.title, m.type, m.project, m.source, m.updated'
  const rows = match
    ? db.prepare(`SELECT ${cols}, snippet(memories_fts, -1, '[', ']', '…', 16) AS snippet
        FROM memories_fts JOIN memories m ON m.id = memories_fts.rowid
        WHERE memories_fts MATCH ? ${filter}
        ORDER BY bm25(memories_fts, 10.0, 1.0, 2.0), m.updated DESC LIMIT ?`).all(match, ...params, Number(limit))
    : db.prepare(`SELECT ${cols}, substr(m.body, 1, 120) AS snippet FROM memories m
        WHERE 1 ${filter} ORDER BY m.updated DESC LIMIT ?`).all(...params, Number(limit))
  return rows.map(r => ({ ...r, snippet: r.snippet.replace(/\s+/g, ' ').trim() }))
}

export function show(db, ref) {
  const m = find(db, ref)
  const links = db.prepare(`SELECT l.to_title AS title, l.kind, t.id FROM links l
    LEFT JOIN memories t ON t.title = l.to_title WHERE l.from_id = ? ORDER BY l.to_title`).all(m.id)
  const backlinks = db.prepare(`SELECT DISTINCT f.id, f.title, l.kind FROM links l
    JOIN memories f ON f.id = l.from_id WHERE l.to_title = ? ORDER BY f.title`).all(m.title)
  return { ...m, links: links.map(l => ({ ...l, ghost: l.id == null })), backlinks }
}

export function link(db, from, to, kind = 'relates') {
  if (!LINK_KINDS.includes(kind)) throw new Error(`unknown link kind "${kind}", use one of: ${LINK_KINDS.join(', ')}`)
  const a = find(db, from)
  const b = find(db, to)
  if (a.id === b.id) throw new Error('a memory cannot link to itself')
  db.prepare('INSERT OR IGNORE INTO links (from_id, to_title, kind) VALUES (?, ?, ?)').run(a.id, b.title, kind)
  return { from: a.title, to: b.title, kind }
}

// Exact id only, never a search, so nothing gets deleted by a fuzzy match.
export function forget(db, id) {
  if (!/^#?\d+$/.test(String(id).trim())) throw new Error('forget takes an exact id, like: bravogram forget 12')
  const m = byId(db, String(id).replace('#', ''))
  if (!m) throw new Error(`no memory #${id}`)
  db.prepare('DELETE FROM memories WHERE id = ?').run(m.id)
  return { id: m.id, title: m.title }
}

export function graph(db) {
  const nodes = db.prepare('SELECT id, title, type, project, source, updated FROM memories').all()
  const byLowerTitle = new Map(nodes.map(n => [n.title.toLowerCase(), n.id]))
  const links = []
  const ghosts = new Map()
  for (const l of db.prepare('SELECT from_id, to_title, kind FROM links').all()) {
    let target = byLowerTitle.get(l.to_title.toLowerCase())
    if (target == null) {
      target = `ghost:${l.to_title.toLowerCase()}`
      if (!ghosts.has(target)) ghosts.set(target, { id: target, title: l.to_title, type: 'ghost', ghost: true })
    }
    links.push({ source: l.from_id, target, kind: l.kind })
  }
  const all = [...nodes, ...ghosts.values()]
  const degree = new Map()
  for (const l of links) for (const end of [l.source, l.target]) degree.set(end, (degree.get(end) ?? 0) + 1)
  for (const n of all) n.degree = degree.get(n.id) ?? 0
  return { nodes: all, links }
}
