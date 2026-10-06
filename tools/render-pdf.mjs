// Render the paged print edition to a PDF with headless Chromium (Playwright).
// Usage: node tools/render-pdf.mjs <abs path to whitepaper-print.html> <abs path to out.pdf>
import { chromium } from 'playwright';

const [,, inPath, outPath] = process.argv;
if (!inPath || !outPath) { console.error('usage: render-pdf.mjs <in.html> <out.pdf>'); process.exit(1); }

const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });

await page.goto(`file://${inPath}`, { waitUntil: 'networkidle', timeout: 120000 });

// Paged.js paginates after load; wait until the page count stops growing, then for the fonts.
await page.waitForFunction(() => window.PagedPolyfill && document.querySelectorAll('.pagedjs_page').length > 3, null, { timeout: 120000 });
await page.evaluate(async () => {
  let prev = -1;
  for (let i = 0; i < 120; i++) {
    const n = document.querySelectorAll('.pagedjs_page').length;
    if (n === prev && n > 0) break;
    prev = n;
    await new Promise((r) => setTimeout(r, 500));
  }
  await document.fonts.ready;
});
console.log(`pagedjs pages: ${await page.evaluate(() => document.querySelectorAll('.pagedjs_page').length)}`);

await page.pdf({ path: outPath, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false, timeout: 120000 });
await browser.close();
console.log(`written: ${outPath}`);
