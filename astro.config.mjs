import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mtf.exchange',
  // Keep the shipped URLs exactly as they are: /whitepaper.html, not
  // /whitepaper/. Every existing link, the sitemap and the canonicals
  // already point at the .html form.
  build: { format: 'file' },
});
