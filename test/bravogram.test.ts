import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import { open, get, type DB } from '../src/db.ts'
import { remember, recall, show, link, forget, graph, append, history, restore, doctor, rebuildIndex } from '../src/memory.ts'
import { importDir, exportDir } from '../src/markdown.ts'
import { handle, type McpState } from '../src/mcp.ts'

const count = (db: DB) => get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM memories')!.n

const tmp = () => mkdtempSync(join(tmpdir(), 'bravogram-'))
const fresh = () => open(join(tmp(), 'memory.db'))
const BIN = new URL('../bin/bravogram.ts', import.meta.url).pathname

test('remember then recall, same title updates instead of duplicating', () => {
  const db = fresh()
  const a = remember(db, { body: 'Bravogram is shared memory for agent swarms' })
  assert.equal(a.title, 'Bravogram is shared memory for agent swarms')
  remember(db, { title: 'stack', body: 'Node 24, node:sqlite with FTS5', type: 'fact', project: 'bravogram' })
  const b = remember(db, { title: 'STACK', body: 'Node 24+, zero dependencies' })
  assert.equal(b.updated, true)
  assert.equal(count(db), 2)
  assert.equal(recall(db, 'swarm')[0].id, a.id, 'prefix match: swarm finds swarms')
  assert.equal(recall(db, 'dependencies')[0].title, 'stack')
  assert.equal(recall(db, 'Node', { project: 'nope' }).length, 0)
  assert.equal(show(db, 'stack').type, 'fact', 'update keeps fields it was not given')
})

test('odd queries never crash the search', () => {
  const db = fresh()
  remember(db, { title: 'cpp', body: 'C++ notes' })
  for (const q of ['"', 'C++', 'AND', 'OR NOT', '', '*', '(', 'NEAR(a b)', 'привет мир']) assert.doesNotThrow(() => recall(db, q), q)
  assert.equal(recall(db, 'C++')[0].title, 'cpp')
  remember(db, { title: 'ru', body: 'Общая память для агентов' })
  assert.equal(recall(db, 'памят')[0].title, 'ru', 'Cyrillic prefix search')
})

test('wikilinks become links, ghosts resolve when written, forget cascades', () => {
  const db = fresh()
  const a = remember(db, { title: 'plan', body: 'See [[Stack|the stack]] and [[Roadmap#v2]] and [[stack]]' })
  let s = show(db, 'plan')
  assert.deepEqual(s.links.map(l => [l.title, l.ghost]), [['Roadmap', true], ['Stack', true]])
  remember(db, { title: 'stack', body: 'zero deps' })
  s = show(db, 'plan')
  assert.equal(s.links.find(l => l.title === 'Stack')?.ghost, false)
  assert.deepEqual(show(db, 'stack').backlinks.map(b => b.title), ['plan'])
  remember(db, { title: 'roadmap', body: 'v2 is cloud sync' })
  link(db, 'roadmap', 'stack', 'part_of')
  const gr = graph(db)
  assert.equal(gr.nodes.filter(n => n.ghost).length, 0)
  assert.equal(gr.links.length, 3)
  forget(db, a.id)
  assert.equal(graph(db).links.length, 1, 'links from a forgotten memory go with it')
  assert.throws(() => forget(db, 'stack'), /exact id/)
  assert.throws(() => link(db, 'stack', 'nope'), /no memory/)
})

test('secret guard blocks keys unless forced', () => {
  const db = fresh()
  assert.throws(() => remember(db, { title: 'k', body: 'key sk-ant-api03-abcdefghijklmnopqrstuvwxyz' }), /API key/)
  assert.throws(() => remember(db, { title: 'k', body: '-----BEGIN OPENSSH PRIVATE KEY-----' }), /private key/)
  assert.doesNotThrow(() => remember(db, { title: 'k', body: 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz', force: true }))
})

test('import an Obsidian style vault, export it, import again: same result', () => {
  const vault = tmp()
  mkdirSync(join(vault, 'Projects'), { recursive: true })
  mkdirSync(join(vault, 'Decisions'))
  mkdirSync(join(vault, '.obsidian'))
  writeFileSync(join(vault, '.obsidian', 'app.md'), 'ignored')
  mkdirSync(join(vault, 'Sessions'))
  writeFileSync(join(vault, 'Sessions', '2026-10.md'), 'log')
  writeFileSync(join(vault, 'HOME.md'), 'Start at [[Projects/_index]] and [[bravogram]], log in [[Sessions/2026-10]]')
  writeFileSync(join(vault, 'Projects', '_index.md'), '- [[bravogram]]')
  writeFileSync(join(vault, 'Decisions', '_index.md'), 'none yet [[missing note]]')
  writeFileSync(join(vault, 'Projects', 'bravogram.md'),
    '---\ntype: project\nproject: bravogram\ntags: [project, "agents"]\ncreated: 2026-10-01\nupdated: 2026-10-03\n---\n\n# Bravogram\nMemory for agents. [[HOME]]')
  writeFileSync(join(vault, 'secret.md'), 'token ghp_abcdefghijklmnopqrstuvwxyz0123456789')

  const db = fresh()
  const r = importDir(db, vault)
  assert.equal(r.notes, 5)
  assert.equal(r.skipped.length, 1)
  assert.equal(r.ghosts, 1, 'only [[missing note]]; [[Sessions/2026-10]] resolves to the note 2026-10 like Obsidian')
  const p = show(db, 'bravogram')
  assert.equal(p.type, 'project'); assert.equal(p.tags, 'project,agents'); assert.equal(p.created, '2026-10-01')
  assert.ok(p.body.startsWith('# Bravogram'))
  assert.ok(show(db, 'Projects/_index'), 'duplicate file names fall back to their path')
  const again = importDir(db, vault)
  assert.equal(again.updated, 5, 're-import updates, never duplicates')
  assert.equal(again.ghosts, 1)

  const out = tmp()
  exportDir(db, out)
  assert.match(readFileSync(join(out, 'Projects', 'bravogram.md'), 'utf8'), /^---\ntype: project\nproject: bravogram\ntags: \[project, agents\]/)
  const db2 = fresh()
  const r2 = importDir(db2, out)
  assert.equal(r2.notes, 5)
  assert.equal(r2.links, r.links)
  assert.equal(show(db2, 'bravogram').body, p.body)
})

test('MCP: initialize, list tools, call them; agents cannot forget', () => {
  const db = fresh()
  const state: McpState = { version: '0.0.0' }
  const rpc = (msg: object) => handle(db, msg, state) as any // replies are untyped JSON
  const init = rpc({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', clientInfo: { name: 'Claude-Code' } } })
  assert.equal(init.protocolVersion, '2025-06-18')
  assert.equal(rpc({ method: 'notifications/initialized' }), undefined)
  const names = rpc({ id: 2, method: 'tools/list' }).tools.map((t: { name: string }) => t.name)
  assert.deepEqual(names.sort(), ['append', 'link', 'recall', 'remember', 'show'])
  const saved = rpc({ id: 3, method: 'tools/call', params: { name: 'remember', arguments: { text: 'hello from claude' } } })
  assert.equal(saved.isError, undefined)
  assert.equal(show(db, 'hello from claude').source, 'claude-code', 'source comes from the client name')
  const found = JSON.parse(rpc({ id: 4, method: 'tools/call', params: { name: 'recall', arguments: { query: 'hello' } } }).content[0].text)
  assert.equal(found.length, 1)
  assert.equal(rpc({ id: 5, method: 'tools/call', params: { name: 'show', arguments: { ref: 'nope' } } }).isError, true)
  assert.throws(() => rpc({ id: 6, method: 'tools/call', params: { name: 'forget', arguments: {} } }), /unknown tool/)
})

test('CLI end to end, and the MCP server over real stdio', async () => {
  const env = { ...process.env, BRAVOGRAM_DB: join(tmp(), 'memory.db') }
  const bravogram = (...a: string[]) => execFileSync(process.execPath, [BIN, ...a], { env, encoding: 'utf8' })
  assert.match(bravogram('remember', 'Graph view shows memory as dots', '--type', 'fact'), /saved #1/)
  assert.match(bravogram('recall', 'graph'), /#1 Graph view/)
  assert.equal(JSON.parse(bravogram('recall', 'graph', '--json'))[0].type, 'fact')
  assert.throws(() => execFileSync(process.execPath, [BIN, 'nope'], { env, stdio: 'pipe' }), /unknown command/)

  const child = spawn(process.execPath, [BIN, 'mcp'], { env })
  const lines: string[] = []
  child.stdout.on('data', d => lines.push(...d.toString().trim().split('\n')))
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test' } } }) + '\n')
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'recall', arguments: { query: 'dots' } } }) + '\n')
  await new Promise<void>(r => { const t = setInterval(() => { if (lines.length >= 2) { clearInterval(t); r() } }, 20) })
  child.kill()
  const res = JSON.parse(lines[1])
  assert.equal(res.id, 2)
  assert.match(res.result.content[0].text, /Graph view/)
})

test('two processes writing at the same moment both succeed', async () => {
  const path = join(tmp(), 'memory.db')
  const script = `import { open } from '${new URL('../src/db.ts', import.meta.url)}'
    import { remember } from '${new URL('../src/memory.ts', import.meta.url)}'
    const db = open(process.argv[1]); for (let i = 0; i < 100; i++) remember(db, { title: process.argv[2] + i, body: 'x' })`
  const run = (name: string) => new Promise<void>((res, rej) => spawn(process.execPath, ['--input-type=module', '-e', script, path, name], { stdio: 'inherit' })
    .on('exit', code => code === 0 ? res() : rej(new Error(`${name} exited ${code}`))))
  await Promise.all([run('a'), run('b'), run('c')])
  assert.equal(count(open(path)), 300)
})

test('history keeps every overwrite and every forget, restore brings them back', () => {
  const db = fresh()
  remember(db, { title: 'plan', body: 'v1' })
  remember(db, { title: 'plan', body: 'v1' }) // unchanged: no new version
  remember(db, { title: 'plan', body: 'v2 overwritten by a careless agent' })
  let h = history(db, 'plan')
  assert.equal(h.revisions.length, 1)
  assert.equal(restore(db, 'plan').rev, h.revisions[0].rev)
  assert.equal(show(db, 'plan').body, 'v1')
  assert.equal(history(db, 'plan').revisions.length, 2, 'the restore itself can be undone')
  const id = show(db, 'plan').id
  forget(db, id)
  h = history(db, 'plan')
  assert.equal(h.current, null)
  assert.equal(h.revisions[0].reason, 'forget')
  restore(db, 'plan')
  assert.equal(show(db, 'plan').body, 'v1', 'a forgotten memory comes back')
  assert.throws(() => restore(db, 'plan', 999999), /no version/)
  assert.throws(() => history(db, 'never existed'), /no memory or history/)
})

test('append adds text, into a section, at the top, or creates the section', () => {
  const db = fresh()
  remember(db, { title: 'proj', body: '## TL;DR\nshort\n\n## State\n- old\n\n## Gotchas\n- g' })
  append(db, 'proj', '- newest', { section: 'state', top: true })
  append(db, 'proj', '- oldest', { section: 'State' })
  append(db, 'proj', 'see [[other]]')
  append(db, 'proj', '- d1', { section: 'Decisions' })
  assert.equal(show(db, 'proj').body,
    '## TL;DR\nshort\n\n## State\n- newest\n- old\n- oldest\n\n## Gotchas\n- g\n\nsee [[other]]\n\n## Decisions\n- d1')
  assert.deepEqual(show(db, 'proj').links.map(l => l.title), ['other'], 'appended wikilinks become links')
  assert.throws(() => append(db, 'nope', 'x'), /no memory/)
  assert.throws(() => append(db, 'proj', 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz'), /API key/)
})

test('doctor finds what bit us: glued headings, duplicates, ghosts, missing paths', () => {
  const db = fresh()
  remember(db, { title: 'bravogram', type: 'project', body: '## Decisions\n- x## Gotchas\n- y\n### fine heading\nsee [[nowhere]]' })
  remember(db, { title: 'Bravo-gram', body: 'dup' })
  const kinds = doctor(db).issues.map(i => i.kind).sort()
  assert.deepEqual(kinds, ['duplicate', 'ghost', 'glued-heading', 'no-paths', 'orphan'])
  db.exec(`INSERT INTO memories_fts(rowid, title, body, tags) VALUES (999, 'stray', 'stray', '')`)
  assert.ok(doctor(db).issues.some(i => i.kind === 'search-index'))
  rebuildIndex(db)
  assert.ok(!doctor(db).issues.some(i => i.kind === 'search-index'), '--fix rebuilds the index')
})

test('a v1 database upgrades to v2 in place without losing anything', () => {
  const path = join(tmp(), 'old.db')
  const db = open(path)
  remember(db, { title: 'keep me', body: 'from v1' })
  db.exec('DROP TRIGGER memories_rev_update; DROP TRIGGER memories_rev_delete; DROP TABLE revisions; PRAGMA user_version = 1')
  db.close()
  const db2 = open(path)
  assert.equal(get<{ user_version: number }>(db2, 'PRAGMA user_version')!.user_version, 2)
  assert.equal(show(db2, 'keep me').body, 'from v1')
  remember(db2, { title: 'keep me', body: 'changed' })
  assert.equal(history(db2, 'keep me').revisions.length, 1)
})

test('text alone never overwrites an existing memory, only an explicit title does', () => {
  const db = fresh()
  remember(db, { title: 'crypto-study', type: 'project', body: 'a long project note' })
  assert.throws(() => remember(db, { body: 'crypto-study' }), /already exists.*append/)
  assert.equal(show(db, 'crypto-study').body, 'a long project note')
  assert.equal(remember(db, { title: 'crypto-study', body: 'replaced on purpose' }).updated, true)
})
