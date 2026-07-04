import puppeteer from 'puppeteer-core';

const [,, inPath, outPath] = process.argv;
if (!inPath || !outPath) { console.error('usage: render-pdf.mjs <in.html> <out.pdf>'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--allow-file-access-from-files', '--disable-gpu'],
});
const page = await browser.newPage();
page.on('pageerror', e => console.error('[pageerror]', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()); });

await page.goto(`file://${inPath}`, { waitUntil: 'networkidle0', timeout: 120000 });

// Wait for Paged.js to finish pagination
await page.waitForFunction(
  () => window.PagedPolyfill && document.querySelectorAll('.pagedjs_page').length > 3,
  { timeout: 120000 }
);
// settle: wait until page count stops growing, then fonts
await page.evaluate(async () => {
  let prev = -1;
  for (let i = 0; i < 120; i++) {
    const n = document.querySelectorAll('.pagedjs_page').length;
    if (n === prev && n > 0) break;
    prev = n;
    await new Promise(r => setTimeout(r, 500));
  }
  await document.fonts.ready;
});
const pages = await page.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
console.log(`pagedjs pages: ${pages}`);

await page.pdf({
  path: outPath,
  preferCSSPageSize: true,
  printBackground: true,
  displayHeaderFooter: false,
  timeout: 120000,
});
await browser.close();
console.log(`written: ${outPath}`);
