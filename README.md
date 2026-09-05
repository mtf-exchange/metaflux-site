# mtf.exchange — official site

Astro, static output. Four pages sharing one layout — Astro is here only to
stop the `<head>`, the nav and the footer from being copy-pasted four times;
every page is still plain HTML written by hand, and the build emits plain
static HTML with no client-side framework.

```
src/layouts/Base.astro       # the one <head>: meta, OG, fonts, icons
src/components/Nav.astro     # the nav bar, every page
src/components/LegalFooter.astro
src/pages/index.astro        # the landing page
src/pages/whitepaper.astro   # the protocol paper, with a scroll-spy TOC
src/pages/terms.astro        # legal
src/pages/privacy.astro      # legal
src/styles/site.css          # the one stylesheet, inlined into every page at build
public/home.js               # the landing page: WebGL2 sky, live testnet prices, reveals — no library
public/main.js               # one job: the whitepaper's TOC scroll-spy
public/arch.svg              # the architecture figure
public/shots/desk.webp       # the desk screenshot — the testnet desk, running
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

One idea per screen, in the manner of hyperliquid.xyz: a cool off-white
sheet (`#f4f6f7`), one deep ink (`#062232`) for the dark bands, and aurora
blue `#5BCEFA` as the single accent. Type is **Geist** 400/500 for everything
readable, **Geist Mono** for the uppercase chrome — labels, nav, numbers —
and **PT Serif** italic only where the brand already uses it: the *Flux* in
the wordmark and the italic phrase in a headline. Rules are 1px hairlines in
`--line`; there are no drop shadows apart from the desk screenshot's.

The dark band under the hero is `home.js`: the Milky Way as seen from the
ground — 16,000 `gl.POINTS` in two additive passes (a wide soft pass builds
the haze and dust lanes, a tight pass draws the stars), drifting slowly along
the band. Raw WebGL2, no library; a single frame under
`prefers-reduced-motion`. The same file pulls live prices from
`POST /info {"type":"markets"}` and the `markets` WebSocket channel, and runs
the IntersectionObserver reveals.

All tokens live in `:root` at the top of `src/styles/site.css`. Astro inlines
it (`inlineStylesheets: 'always'`), so first paint waits on no CSS request;
the Google Fonts stylesheet is preloaded and applied without blocking.

## Logo & brand assets

Vendored from [`mtf-exchange/brand`](https://github.com/mtf-exchange/brand)
into `logo/` (byte-identical copies — update there, then re-copy):

| File | Used for |
|---|---|
| `logo/metaflux-mark.svg` | The mark (flux-gradient curve) — navbar + footer lockup |
| `logo/metaflux-mark-animated.svg` | Self-contained climb-on animation (standalone use) |

The on-page wordmark sets **`Meta`** in Geist 500 and **`Flux`** in PT Serif
italic (`.b-meta` / `.b-flux` in `site.css`), per the brand spec — never
swap or both-bold them.

`favicon.svg` is the square mark on a **transparent** ground, the same asset
the app serves — the mark's blue→rose gradient is mid-tone and stays legible
on both light and dark tab strips. `apple-touch-icon.png` is the exception
and must stay **opaque and full-bleed**: iOS composites transparent pixels
onto black and applies its own corner mask, so the plate is baked into the
PNG and no radius is.

## Open Graph image

`tools/og.html` is the source; `public/og.png` (1200×630) is the render. The
card is the home page's own sky: copy `tools/og.html` into `public/`, open
`/og.html` on the dev server in a 1200×630 viewport, wait a few seconds for
the fonts and the canvas, screenshot to `public/og.png`, delete the copy.

## Generated artefacts (tools/)

Two pipelines, both run locally with their outputs committed:

- **The whitepaper PDF.** `tools/build-print.py` extracts the canonical
  article from `whitepaper.html` into `whitepaper-print.html` (a plain
  black-on-white academic layout with its own self-contained stylesheet),
  then `tools/render-pdf.mjs` renders that to `whitepaper.pdf`. Because the
  extraction is verbatim, markup changes inside
  `<article class="paper-content">` desync the checked-in PDF — re-run the
  pipeline after editing the paper.

- **The desk photograph.** `tools/shoot-desk.mjs` re-shoots the running
  devnet desk to `shots/desk.png` (git-ignored master), and
  `tools/webp-desk.py` derives the `shots/desk.webp` the page actually
  loads. Nothing in the image is drawn by this site — it is a screenshot of
  the real app.

## License

Marketing content © MetaFlux. No license granted; do not copy.
