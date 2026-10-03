// Keyboard walk and computed measurements of the page, on the running production build.
// Usage: node .design-system/scripts/walk.mjs <base url> <out.json>
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright')
const [base, out] = process.argv.slice(2)
const browser = await chromium.launch()
const result = {}
for (const width of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await ctx.newPage()
  // Headless pages have no focus for the real clipboard, so record what the page asks to copy.
  await page.addInitScript(() => { window.__copied = []; navigator.clipboard.writeText = async (t) => { window.__copied.push(t) } })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const r = (result[width] = {})
  r.scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  r.transition = await page.evaluate(() => ({
    install: getComputedStyle(document.querySelector('.install')).transition,
    icon: getComputedStyle(document.querySelector('.install .state svg')).transition,
  }))
  r.stepText = await page.evaluate(() => [...document.querySelectorAll('.step p')].map((p) => {
    const ch = Object.assign(document.createElement('span'), { textContent: '0' }); p.append(ch)
    const w = ch.getBoundingClientRect().width; ch.remove()
    return { width: Math.round(p.getBoundingClientRect().width), ch: Math.round(p.getBoundingClientRect().width / w) }
  }))
  // Tab through every stop and record what has focus and its outline.
  r.tabOrder = []
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const s = getComputedStyle(el), b = el.getBoundingClientRect()
      return { el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''), name: (el.getAttribute('aria-label') || el.textContent).trim().slice(0, 50),
        outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, box: `${Math.round(b.width)}x${Math.round(b.height)}`, inView: b.left >= 0 && b.right <= innerWidth }
    })
    if (!stop) break
    r.tabOrder.push(stop)
  }
  // The install button with Enter, then with Space.
  const button = page.locator('button.install').first()
  r.copy = {}
  for (const key of ['Enter', 'Space']) {
    await page.evaluate(() => { window.__copied = [] })
    await button.focus(); await page.keyboard.press(key)
    await page.waitForFunction(() => document.querySelector('[role=status]').textContent !== '')
    r.copy[key] = await page.evaluate(async () => ({
      clipboard: window.__copied.join('|'), status: document.querySelector('[role=status]').textContent,
      className: document.querySelector('button.install').className, focusStays: document.activeElement === document.querySelector('button.install'),
      box: (({ width, height }) => `${Math.round(width)}x${Math.round(height)}`)(document.querySelector('button.install').getBoundingClientRect()),
    }))
    const t0 = Date.now()
    await page.waitForFunction(() => document.querySelector('[role=status]').textContent === '')
    r.copy[key].clearedAfterMs = Date.now() - t0
  }
  r.copy.idleBox = await button.evaluate((b) => (({ width, height }) => `${Math.round(width)}x${Math.round(height)}`)(b.getBoundingClientRect()))
  await button.hover()
  await page.waitForTimeout(300)
  r.hover = await button.evaluate((b) => ({ transform: getComputedStyle(b).transform, boxShadow: getComputedStyle(b).boxShadow }))
  // The first FAQ question with Enter.
  const summary = page.locator('#faq summary').first()
  await summary.focus(); await page.keyboard.press('Enter')
  r.faq = await page.evaluate(() => ({ open: document.querySelector('#faq details').open, focusStays: document.activeElement === document.querySelector('#faq summary') }))
  await ctx.close()
}
await browser.close()
writeFileSync(out, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 1))
