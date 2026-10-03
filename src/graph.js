import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { graph, show } from './memory.js'

const page = readFileSync(new URL('./graph.html', import.meta.url))

export function startGraph(db, { port = 4747, open = true } = {}) {
  const server = createServer((req, res) => {
    const json = (code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)) }
    const url = new URL(req.url, 'http://localhost')
    try {
      if (url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(page) }
      if (url.pathname === '/api/graph') return json(200, graph(db))
      const m = url.pathname.match(/^\/api\/memory\/(\d+)$/)
      if (m) return json(200, show(db, m[1]))
      json(404, { error: 'not found' })
    } catch (e) {
      json(404, { error: e.message })
    }
  })
  return new Promise((resolve, reject) => {
    let tries = 0
    server.on('error', e => {
      if (e.code === 'EADDRINUSE' && tries++ < 10) server.listen(++port, '127.0.0.1')
      else reject(e)
    })
    // Localhost only: nobody else on the network can read your memory.
    server.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${server.address().port}`
      if (open) {
        const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open'
        spawn(cmd, [url], { stdio: 'ignore', detached: true }).on('error', () => {}).unref()
      }
      resolve({ server, url })
    })
  })
}
