import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, sep } from 'node:path'
import { get, all, type DB } from './db.ts'
import { TYPES, remember, looksSecret, type Memory } from './memory.ts'

const FOLDERS: Record<string, string> = { project: 'Projects', decision: 'Decisions', lesson: 'Lessons', system: 'Systems', fact: 'Facts', state: 'State', person: 'People', reference: 'References', note: 'Notes' }

type Meta = Record<string, string | string[]>

// ponytail: only the frontmatter the vault uses (key: value and [a, b] lists), not full YAML.
export function parseFrontmatter(text: string): { meta: Meta; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { meta: {}, body: text }
  const meta: Meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    const v = kv[2].trim()
    meta[kv[1]] = v.startsWith('[') && v.endsWith(']') ? v.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean) : unquote(v)
  }
  return { meta, body: text.slice(m[0].length).replace(/^\s*\n/, '') }
}

const unquote = (s: string) => s.replace(/^(['"])(.*)\1$/, '$2')
const str = (v: string | string[] | undefined) => (typeof v === 'string' && v ? v : undefined)

export function importDir(db: DB, dir: string, { source = 'import' }: { source?: string } = {}) {
  const files = readdirSync(dir, { recursive: true })
    .map(String)
    .filter(f => f.endsWith('.md') && !f.split(sep).some(part => part.startsWith('.')))
    .sort()
  // Title is the file name, like Obsidian. When two files share a name (several _index.md), use the path.
  const name = (f: string) => basename(f, '.md')
  const count = new Map<string, number>()
  for (const f of files) count.set(name(f).toLowerCase(), (count.get(name(f).toLowerCase()) ?? 0) + 1)
  const report = { notes: 0, updated: 0, skipped: [] as string[] }
  for (const f of files) {
    const path = join(dir, f)
    const { meta, body } = parseFrontmatter(readFileSync(path, 'utf8'))
    const title = (count.get(name(f).toLowerCase()) ?? 0) > 1 ? f.slice(0, -3).split(sep).join('/') : name(f)
    if (looksSecret(body)) { report.skipped.push(`${f} (looks like it contains a secret)`); continue }
    const mtime = statSync(path).mtime.toISOString()
    const type = str(meta.type)
    const r = remember(db, {
      title, body, source,
      type: type && TYPES.includes(type) ? type : 'note',
      project: str(meta.project),
      tags: meta.tags,
      created: str(meta.created) ?? mtime,
      updated: str(meta.updated) ?? mtime,
    })
    if (r.updated) report.updated++
    else report.notes++
  }
  // Obsidian resolves [[Folder/note]] to note.md, so path links with no exact match fall back to the file name.
  const ghosts = all<{ rowid: number; to_title: string }>(db, `SELECT l.rowid, l.to_title FROM links l LEFT JOIN memories t ON t.title = l.to_title
    WHERE t.id IS NULL AND l.to_title LIKE '%/%'`)
  for (const g of ghosts) {
    const file = g.to_title.split('/').pop()!
    if (get(db, 'SELECT 1 FROM memories WHERE title = ?', file)) {
      const r = db.prepare('UPDATE OR IGNORE links SET to_title = ? WHERE rowid = ?').run(file, g.rowid)
      if (!r.changes) db.prepare('DELETE FROM links WHERE rowid = ?').run(g.rowid) // same link already exists
    }
  }
  const s = get<{ links: number; ghosts: number | null }>(db, `SELECT COUNT(*) AS links, SUM(t.id IS NULL) AS ghosts FROM links l LEFT JOIN memories t ON t.title = l.to_title`)!
  return { ...report, links: s.links, ghosts: s.ghosts ?? 0 }
}

export function exportDir(db: DB, dir: string) {
  const rows = all<Memory>(db, 'SELECT * FROM memories ORDER BY id')
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
