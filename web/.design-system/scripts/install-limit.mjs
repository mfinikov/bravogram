// Grows the install command one character at a time at 390 wide and reports the first length that squeezes the icon or overflows the box.
// Also reports the rendered contrast of the button's text, icon and focus ring. Usage: node install-limit.mjs <base url> <out.json>
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright')
const [base, out] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
await page.goto(base, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const result = await page.evaluate(() => {
  const button = document.querySelector('button.install'), cmd = button.querySelector('.cmd'), box = button.parentElement
  const inner = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight)
  const start = cmd.textContent
  let firstOverflow = null
  for (let n = start.length; n <= 60 && !firstOverflow; n++) {
    cmd.textContent = start.padEnd(n, 'x')
    // The icon box shrinks before anything scrolls, so a squeezed icon is the first break.
    if (button.querySelector('.state').getBoundingClientRect().width < 16 || button.scrollWidth > button.clientWidth) firstOverflow = n
  }
  cmd.textContent = start
  // WCAG contrast of a color over white, with alpha composited.
  const lum = ([r, g, b]) => [r, g, b].map((v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0)
  const overWhite = (css, extra = 1) => { const [r, g, b, a = 1] = css.match(/[\d.]+/g).map(Number); return [r, g, b].map((v) => v * a * extra + 255 * (1 - a * extra)) }
  const ratio = (rgb) => +((1.05) / (lum(rgb) + 0.05)).toFixed(2)
  const s = getComputedStyle(button)
  return {
    width: 390, command: start, commandLength: start.length, buttonWidth: Math.round(button.getBoundingClientRect().width), heroInnerWidth: inner, firstBreakAtLength: firstOverflow,
    contrastOnWhite: { text: ratio(overWhite(s.color)), dollar: ratio(overWhite(s.color, 0.45)), icon: ratio(overWhite(s.color, 0.5)), border: ratio(overWhite(s.borderTopColor)), focusRing: ratio(overWhite(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().replace(/^#(..)(..)(..)$/, (_, r, g, b) => `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`))) },
    background: s.backgroundColor,
  }
})
await browser.close()
writeFileSync(out, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
