import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, sep } from 'node:path'
import { TYPES, remember, looksSecret } from './memory.js'

const FOLDERS = { project: 'Projects', decision: 'Decisions', lesson: 'Lessons', system: 'Systems', fact: 'Facts', state: 'State', person: 'People', reference: 'References', note: 'Notes' }

// ponytail: only the frontmatter the vault uses (key: value and [a, b] lists), not full YAML.
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { meta: {}, body: text }
  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean)
    else v = unquote(v)
    meta[kv[1]] = v
  }
  return { meta, body: text.slice(m[0].length).replace(/^\s*\n/, '') }
}

const unquote = s => s.replace(/^(['"])(.*)\1$/, '$2')

export function importDir(db, dir, { source = 'import' } = {}) {
  const files = readdirSync(dir, { recursive: true })
    .map(String)
    .filter(f => f.endsWith('.md') && !f.split(sep).some(part => part.startsWith('.')))
    .sort()
  // Title is the file name, like Obsidian. When two files share a name (several _index.md), use the path.
  const name = f => basename(f, '.md')
  const count = new Map()
  for (const f of files) count.set(name(f).toLowerCase(), (count.get(name(f).toLowerCase()) ?? 0) + 1)
  const report = { notes: 0, updated: 0, skipped: [] }
  for (const f of files) {
    const path = join(dir, f)
    const { meta, body } = parseFrontmatter(readFileSync(path, 'utf8'))
    const title = count.get(name(f).toLowerCase()) > 1 ? f.slice(0, -3).split(sep).join('/') : name(f)
    if (looksSecret(body)) { report.skipped.push(`${f} (looks like it contains a secret)`); continue }
    const mtime = statSync(path).mtime.toISOString()
    const r = remember(db, {
      title, body, source,
      type: TYPES.includes(meta.type) ? meta.type : 'note',
      project: typeof meta.project === 'string' ? meta.project : undefined,
      tags: meta.tags,
      created: meta.created || mtime,
      updated: meta.updated || mtime,
    })
    r.updated ? report.updated++ : report.notes++
  }
  // Obsidian resolves [[Folder/note]] to note.md, so path links with no exact match fall back to the file name.
  const ghosts = db.prepare(`SELECT l.rowid, l.to_title FROM links l LEFT JOIN memories t ON t.title = l.to_title
    WHERE t.id IS NULL AND l.to_title LIKE '%/%'`).all()
  for (const g of ghosts) {
    const name = g.to_title.split('/').pop()
    if (db.prepare('SELECT 1 FROM memories WHERE title = ?').get(name)) {
      const r = db.prepare('UPDATE OR IGNORE links SET to_title = ? WHERE rowid = ?').run(name, g.rowid)
      if (!r.changes) db.prepare('DELETE FROM links WHERE rowid = ?').run(g.rowid) // same link already exists
    }
  }
  const s = db.prepare(`SELECT COUNT(*) AS links, SUM(t.id IS NULL) AS ghosts FROM links l LEFT JOIN memories t ON t.title = l.to_title`).get()
  return { ...report, links: s.links, ghosts: s.ghosts ?? 0 }
}

export function exportDir(db, dir) {
  const rows = db.prepare('SELECT * FROM memories ORDER BY id').all()
  for (const m of rows) {
    const rel = m.title.includes('/') ? m.title : join(FOLDERS[m.type] ?? 'Notes', m.title)
    const file = join(dir, rel.replace(/[\\:*?"<>|]/g, '-') + '.md')
    mkdirSync(dirname(file), { recursive: true })
    const tags = m.tags ? m.tags.split(',') : []
    const fm = [`type: ${m.type}`, m.project && `project: ${m.project}`, `tags: [${tags.join(', ')}]`,
      `source: ${m.source}`, `created: ${m.created}`, `updated: ${m.updated}`].filter(Boolean)
    writeFileSync(file, `---\n${fm.join('\n')}\n---\n\n${m.body}`)
  }
  return { exported: rows.length, dir: relative(process.cwd(), dir) || '.' }
}
