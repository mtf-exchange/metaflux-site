# mtf.exchange — official site

Astro, static output. Five pages sharing one layout — Astro is here only to
stop the `<head>`, the nav and the footer from being copy-pasted four times;
every page is still plain HTML written by hand, and the build emits plain
static HTML with no client-side framework.

```
src/layouts/Base.astro       # the one <head>: meta, OG, fonts, icons
src/components/Nav.astro     # the nav bar, every page
src/components/Footer.astro     # the footer, every page
src/pages/index.astro        # the landing page; its hero point field is a Three.js script
src/pages/tge.astro          # MTF Points: the season runestone, the formula, the lookup
src/pages/whitepaper.astro   # the protocol paper, with a scroll-spy TOC
src/pages/terms.astro        # legal
src/pages/privacy.astro      # legal
src/styles/site.css          # the one stylesheet, inlined into every page at build
public/home.js               # the landing page: testnet prices (REST + WebSocket), the markets table, the clock
public/tge.js                # the points page: week, countdown, archive reads, table hash check
public/main.js               # one job: the whitepaper's TOC scroll-spy
public/shots/app.webp        # the trading app on testnet, with a sample account (the caption says so)
```

Output URLs are unchanged (`/whitepaper.html`, not `/whitepaper/`) — that is
what `build.format: 'file'` in `astro.config.mjs` is for.

Literal `{` and `}` in page prose must be written `&#123;` / `&#125;`; Astro
reads a bare brace as a JavaScript expression.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
```

`dist/` is what ships.

## Deploy

Build first (`npm run build`), then serve `dist/` from any static host:

- **Vercel** — detects Astro; sets up `mtf.exchange` via the dashboard
- **Cloudflare Pages** — the live host. Project `metaflux-site`, build
  `npm run build`, output `dist`, `NODE_VERSION=22`; deploys on push to main
- **GitHub Pages** — repo Settings → Pages → main branch

DNS points `mtf.exchange` apex + `www` at the host's IP / CNAME per their docs.

## The design, in brief

Monochrome, in the manner of hyperliquid.xyz: ink `#0b0c0e` bands for the
hero, the product shot and the points, white bands for reading. Green and red
appear only for price direction. Type is **Source Serif 4** (weight 300) for
display headings, **Hanken Grotesk** for everything readable, and **Geist
Mono** for data and code. There are no gradients, glows or glass.

The hero is a field of points: each row is a price distribution at one
horizon, and the front row is the mark's own curve. It is a Three.js
`ShaderMaterial` in `index.astro`, one still frame under
`prefers-reduced-motion`.

All tokens live in `:root` at the top of `src/styles/site.css`. Astro inlines
it (`inlineStylesheets: 'always'`), so first paint waits on no CSS request;
the Google Fonts stylesheet is preloaded and applied without blocking.

## Logo & brand assets

Vendored from [`mtf-exchange/brand`](https://github.com/mtf-exchange/brand)
into `logo/` (byte-identical copies — update there, then re-copy):

| File | Used for |
|---|---|
| `logo/metaflux-mark.svg` | The mark; the site draws it in one colour (white on ink, ink on white) |
| `logo/metaflux-mark-animated.svg` | Self-contained climb-on animation (standalone use) |

The on-page lockup is the one-colour mark plus "MetaFlux" in Hanken Grotesk 600.

`favicon.svg` is the one-colour mark on a transparent ground; it switches
between ink and white with the browser's colour scheme. `apple-touch-icon.png`
and `favicon-32.png` are the white mark on an opaque ink square: iOS composites
transparent pixels onto black and applies its own corner mask, so the plate is
baked into the PNG and no radius is.

## Open Graph image

`tools/og.html` is the source; `public/og-2026-10.png` (1200×630) is the
render, and `public/og.png` is a copy for old links. The card is the hero:
the mark, the headline and the point field. Render it headless at 1200×630
with a device scale factor of 2, wait for `body[data-ready="1"]`, screenshot,
then downscale to 1200×630. A new image takes a new dated file name, because
share platforms cache an image by its URL; update the three `og:image` /
`twitter:image` tags in `Base.astro` to match.

## Generated artefacts (tools/)

One pipeline, run by hand with its output committed:

- **The whitepaper PDF.** `tools/build-print.py` extracts the canonical
  article from `src/pages/whitepaper.astro` into `public/whitepaper-print.html`
  (a black-on-white print layout in the site's typefaces), then
  `tools/render-pdf.mjs` renders it to `public/whitepaper.pdf` with headless
  Chromium (Playwright). The extraction is verbatim, so a change inside
  `<article class="paper-content">` desyncs the PDF until the pipeline runs
  again.

## License

Marketing content © MetaFlux. No license granted; do not copy.
