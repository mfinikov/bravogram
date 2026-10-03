import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export const dbPath = () => process.env.BRAVOGRAM_DB || join(homedir(), '.bravogram', 'memory.db')

const MIGRATIONS = [
  `CREATE TABLE memories (
     id INTEGER PRIMARY KEY,
     title TEXT NOT NULL UNIQUE COLLATE NOCASE,
     body TEXT NOT NULL DEFAULT '',
     type TEXT NOT NULL DEFAULT 'note',
     project TEXT,
     tags TEXT NOT NULL DEFAULT '',
     source TEXT NOT NULL DEFAULT 'cli',
     created TEXT NOT NULL,
     updated TEXT NOT NULL
   );
   CREATE VIRTUAL TABLE memories_fts USING fts5(
     title, body, tags, content='memories', content_rowid='id', tokenize='unicode61 remove_diacritics 2'
   );
   CREATE TRIGGER memories_ai AFTER INSERT ON memories BEGIN
     INSERT INTO memories_fts(rowid, title, body, tags) VALUES (new.id, new.title, new.body, new.tags);
   END;
   CREATE TRIGGER memories_ad AFTER DELETE ON memories BEGIN
     INSERT INTO memories_fts(memories_fts, rowid, title, body, tags) VALUES ('delete', old.id, old.title, old.body, old.tags);
   END;
   CREATE TRIGGER memories_au AFTER UPDATE ON memories BEGIN
     INSERT INTO memories_fts(memories_fts, rowid, title, body, tags) VALUES ('delete', old.id, old.title, old.body, old.tags);
     INSERT INTO memories_fts(rowid, title, body, tags) VALUES (new.id, new.title, new.body, new.tags);
   END;
   -- Links point at a title, not an id: a link to a title nobody has written yet is a ghost,
   -- and it resolves by itself the moment that title is remembered.
   CREATE TABLE links (
     from_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
     to_title TEXT NOT NULL COLLATE NOCASE,
     kind TEXT NOT NULL DEFAULT 'relates',
     PRIMARY KEY (from_id, to_title, kind)
   );
   CREATE INDEX links_to ON links(to_title);`,

  // v2: every change and every delete keeps the old version, so nothing an agent overwrites is lost.
  `CREATE TABLE revisions (
     rev INTEGER PRIMARY KEY,
     memory_id INTEGER NOT NULL,
     title TEXT NOT NULL COLLATE NOCASE,
     body TEXT NOT NULL, type TEXT NOT NULL, project TEXT, tags TEXT NOT NULL, source TEXT NOT NULL,
     created TEXT NOT NULL, updated TEXT NOT NULL,
     replaced_at TEXT NOT NULL,
     reason TEXT NOT NULL
   );
   CREATE INDEX revisions_title ON revisions(title);
   CREATE TRIGGER memories_rev_update BEFORE UPDATE ON memories
   WHEN old.body IS NOT new.body OR old.type IS NOT new.type OR old.project IS NOT new.project OR old.tags IS NOT new.tags BEGIN
     INSERT INTO revisions (memory_id, title, body, type, project, tags, source, created, updated, replaced_at, reason)
     VALUES (old.id, old.title, old.body, old.type, old.project, old.tags, old.source, old.created, old.updated, strftime('%Y-%m-%dT%H:%M:%fZ'), 'update');
   END;
   CREATE TRIGGER memories_rev_delete BEFORE DELETE ON memories BEGIN
     INSERT INTO revisions (memory_id, title, body, type, project, tags, source, created, updated, replaced_at, reason)
     VALUES (old.id, old.title, old.body, old.type, old.project, old.tags, old.source, old.created, old.updated, strftime('%Y-%m-%dT%H:%M:%fZ'), 'forget');
   END;`,
]

export function open(path = dbPath()) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;')
  // Turning on WAL (once per file, it sticks) needs an exclusive lock and SQLite does not wait for it,
  // so when several agents create the file at the same moment we retry for up to ~2 seconds.
  for (let i = 0; ; i++) {
    try { db.exec('PRAGMA journal_mode = WAL'); break } catch (e) {
      if (!/locked|busy/i.test(e.message) || i >= 100) throw e
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20)
    }
  }
  // Version is re-read inside the lock, so two processes opening a fresh file don't both migrate.
  const step = () => tx(db, () => {
    const v = db.prepare('PRAGMA user_version').get().user_version
    if (v >= MIGRATIONS.length) return false
    db.exec(MIGRATIONS[v])
    db.exec(`PRAGMA user_version = ${v + 1}`)
    return true
  })
  while (step());
  return db
}

// IMMEDIATE takes the write lock up front, so two agents writing at once wait their turn
// instead of failing halfway through.
// Nested calls join the outer transaction, so append can read and write under one lock.
export function tx(db, fn) {
  if (db.isTransaction) return fn()
  db.exec('BEGIN IMMEDIATE')
  try {
    const out = fn()
    db.exec('COMMIT')
    return out
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}
