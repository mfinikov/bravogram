// Reruns the delete plan's searches. Exit 1 if anything still uses the dark terminal block or its tokens.
import { readFileSync, readdirSync } from 'node:fs'
const tsx = ['app', 'components'].flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.tsx')).map((f) => `${d}/${f}`))
const css = readFileSync('app/globals.css', 'utf8').split('\n').filter((l) => !l.startsWith('.term'))
const counts = {
  'class term in tsx': tsx.reduce((n, f) => n + (readFileSync(f, 'utf8').match(/\bterm\b/g) || []).length, 0),
  ...Object.fromEntries(['--term', '--term-text', '--term-dim'].map((t) => [`var(${t})`, css.filter((l) => l.includes(`var(${t})`)).length + tsx.filter((f) => readFileSync(f, 'utf8').includes(t)).length])),
}
console.log(counts)
process.exit(Object.values(counts).some(Boolean) ? 1 : 0)
