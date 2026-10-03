import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import { open } from '../src/db.js'
import { remember, recall, show, link, forget, graph } from '../src/memory.js'
import { importDir, exportDir } from '../src/markdown.js'
import { handle } from '../src/mcp.js'

const tmp = () => mkdtempSync(join(tmpdir(), 'bravo-'))
const fresh = () => open(join(tmp(), 'memory.db'))
const BIN = new URL('../bin/bravo.js', import.meta.url).pathname

test('remember then recall, same title updates instead of duplicating', () => {
  const db = fresh()
  const a = remember(db, { body: 'Bravogram is shared memory for agent swarms' })
  assert.equal(a.title, 'Bravogram is shared memory for agent swarms')
  remember(db, { title: 'stack', body: 'Node 24, node:sqlite with FTS5', type: 'fact', project: 'bravogram' })
  const b = remember(db, { title: 'STACK', body: 'Node 24+, zero dependencies' })
  assert.equal(b.updated, true)
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM memories').get().n, 2)
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
  assert.equal(s.links.find(l => l.title === 'Stack').ghost, false)
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
  const state = { version: '0.0.0' }
  const init = handle(db, { id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', clientInfo: { name: 'Claude-Code' } } }, state)
  assert.equal(init.protocolVersion, '2025-06-18')
  assert.equal(handle(db, { method: 'notifications/initialized' }, state), undefined)
  const names = handle(db, { id: 2, method: 'tools/list' }, state).tools.map(t => t.name)
  assert.deepEqual(names.sort(), ['link', 'recall', 'remember', 'show'])
  const saved = handle(db, { id: 3, method: 'tools/call', params: { name: 'remember', arguments: { text: 'hello from claude' } } }, state)
  assert.equal(saved.isError, undefined)
  assert.equal(show(db, 'hello from claude').source, 'claude-code', 'source comes from the client name')
  const found = JSON.parse(handle(db, { id: 4, method: 'tools/call', params: { name: 'recall', arguments: { query: 'hello' } } }, state).content[0].text)
  assert.equal(found.length, 1)
  assert.equal(handle(db, { id: 5, method: 'tools/call', params: { name: 'show', arguments: { ref: 'nope' } } }, state).isError, true)
  assert.throws(() => handle(db, { id: 6, method: 'tools/call', params: { name: 'forget', arguments: {} } }, state), /unknown tool/)
})

test('CLI end to end, and the MCP server over real stdio', async () => {
  const env = { ...process.env, BRAVO_DB: join(tmp(), 'memory.db') }
  const bravo = (...a) => execFileSync(process.execPath, [BIN, ...a], { env, encoding: 'utf8' })
  assert.match(bravo('remember', 'Graph view shows memory as dots', '--type', 'fact'), /saved #1/)
  assert.match(bravo('recall', 'graph'), /#1 Graph view/)
  assert.equal(JSON.parse(bravo('recall', 'graph', '--json'))[0].type, 'fact')
  assert.throws(() => execFileSync(process.execPath, [BIN, 'nope'], { env, stdio: 'pipe' }), /unknown command/)

  const child = spawn(process.execPath, [BIN, 'mcp'], { env })
  const lines = []
  child.stdout.on('data', d => lines.push(...d.toString().trim().split('\n')))
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test' } } }) + '\n')
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'recall', arguments: { query: 'dots' } } }) + '\n')
  await new Promise(r => { const t = setInterval(() => { if (lines.length >= 2) { clearInterval(t); r() } }, 20) })
  child.kill()
  const res = JSON.parse(lines[1])
  assert.equal(res.id, 2)
  assert.match(res.result.content[0].text, /Graph view/)
})

test('two processes writing at the same moment both succeed', async () => {
  const path = join(tmp(), 'memory.db')
  const script = `import { open } from '${new URL('../src/db.js', import.meta.url)}'
    import { remember } from '${new URL('../src/memory.js', import.meta.url)}'
    const db = open(process.argv[1]); for (let i = 0; i < 100; i++) remember(db, { title: process.argv[2] + i, body: 'x' })`
  const run = name => new Promise((res, rej) => spawn(process.execPath, ['--input-type=module', '-e', script, path, name], { stdio: 'inherit' })
    .on('exit', code => code === 0 ? res() : rej(new Error(`${name} exited ${code}`))))
  await Promise.all([run('a'), run('b'), run('c')])
  assert.equal(open(path).prepare('SELECT COUNT(*) AS n FROM memories').get().n, 300)
})
