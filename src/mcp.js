import { createInterface } from 'node:readline'
import { TYPES, LINK_KINDS, remember, recall, show, link } from './memory.js'

// ponytail: hand-rolled MCP over stdio (newline-delimited JSON-RPC), so the package has zero
// dependencies. Covers initialize, tools/list, tools/call, ping. Switch to the official SDK if we
// ever need resources, prompts or HTTP transport.
const VERSIONS = ['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25']

const str = description => ({ type: 'string', description })
const TOOLS = [
  {
    name: 'recall',
    description: 'Search the shared memory. Returns the top matches as short snippets. Call this before re-deriving facts about the user, their projects or past decisions.',
    inputSchema: { type: 'object', properties: { query: str('words to search for'), project: str('only this project'), type: { type: 'string', enum: TYPES }, limit: { type: 'number', description: 'max results, default 5' } }, required: ['query'] },
    run: (db, a) => recall(db, a.query, a),
  },
  {
    name: 'remember',
    description: 'Save a memory shared with every agent on this machine. Saving the same title again updates it. Use [[Title]] in the text to link other memories. Never store secrets.',
    inputSchema: { type: 'object', properties: { text: str('the memory'), title: str('short unique title, defaults to the first line'), type: { type: 'string', enum: TYPES }, project: str('project name'), tags: { type: 'array', items: { type: 'string' } } }, required: ['text'] },
    run: (db, a, source) => remember(db, { ...a, body: a.text, source, force: false }),
  },
  {
    name: 'show',
    description: 'Read one full memory by id or title, with its links and backlinks.',
    inputSchema: { type: 'object', properties: { ref: str('id or exact title') }, required: ['ref'] },
    run: (db, a) => show(db, a.ref),
  },
  {
    name: 'link',
    description: 'Connect two existing memories.',
    inputSchema: { type: 'object', properties: { from: str('id or title'), to: str('id or title'), kind: { type: 'string', enum: LINK_KINDS } }, required: ['from', 'to'] },
    run: (db, a) => link(db, a.from, a.to, a.kind),
  },
]

export function handle(db, msg, state) {
  const { id, method, params = {} } = msg
  if (method === 'initialize') {
    state.source = String(params.clientInfo?.name || 'mcp').toLowerCase()
    const v = VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS.at(-1)
    return { protocolVersion: v, capabilities: { tools: {} }, serverInfo: { name: 'bravogram', version: state.version } }
  }
  if (method === 'ping') return {}
  if (method === 'tools/list') return { tools: TOOLS.map(({ run, ...t }) => t) }
  if (method === 'tools/call') {
    const tool = TOOLS.find(t => t.name === params.name)
    if (!tool) throw Object.assign(new Error(`unknown tool ${params.name}`), { code: -32602 })
    try {
      const out = tool.run(db, params.arguments ?? {}, state.source)
      return { content: [{ type: 'text', text: JSON.stringify(out) }] }
    } catch (e) {
      return { content: [{ type: 'text', text: e.message }], isError: true }
    }
  }
  if (id === undefined) return undefined // notifications need no answer
  throw Object.assign(new Error(`method not found: ${method}`), { code: -32601 })
}

export function serve(db, version) {
  const state = { source: 'mcp', version }
  const send = m => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...m }) + '\n')
  createInterface({ input: process.stdin }).on('line', line => {
    if (!line.trim()) return
    let msg
    try { msg = JSON.parse(line) } catch { return send({ id: null, error: { code: -32700, message: 'parse error' } }) }
    try {
      const result = handle(db, msg, state)
      if (msg.id !== undefined && result !== undefined) send({ id: msg.id, result })
    } catch (e) {
      if (msg.id !== undefined) send({ id: msg.id, error: { code: e.code ?? -32603, message: e.message } })
    }
  })
}
