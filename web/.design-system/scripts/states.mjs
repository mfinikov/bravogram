// How capture.mjs reaches each state listed in review/surfaces.tsv.
const states = {
  'faq-open': async (page) => { await page.locator('#faq summary').first().click() },
  copied: async (page) => { await page.locator('button.install').first().click() },
}
export default states
