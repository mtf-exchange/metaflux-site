import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mtf.exchange',
  // Keep the shipped URLs exactly as they are: /whitepaper.html, not
  // /whitepaper/. Every existing link, the sitemap and the canonicals
  // already point at the .html form.
  // One 20 KB stylesheet, inlined: first paint waits on no CSS request.
  build: { format: 'file', inlineStylesheets: 'always' },
});
