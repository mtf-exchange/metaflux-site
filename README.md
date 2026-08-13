# mtf.exchange — official site

Static site, no build step, no framework. Four pages sharing one stylesheet:

```
index.html        # the landing page — loads no JavaScript at all
whitepaper.html   # the protocol paper, with a scroll-spy TOC
terms.html        # legal
privacy.html      # legal
redesign.css      # the one stylesheet all four pages load
main.js           # one job: the whitepaper's TOC scroll-spy (no-op elsewhere)
arch.svg          # the architecture figure, referenced by index.html
shots/desk.webp   # the hero photograph — the devnet desk, actually running
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` in a browser directly.

## Deploy

The repo serves directly via any static host. Recommended:

- **Vercel** — drag-and-drop, sets up `mtf.exchange` via the dashboard
- **Cloudflare Pages** — `wrangler pages deploy .`
- **GitHub Pages** — repo Settings → Pages → main branch

DNS points `mtf.exchange` apex + `www` at the host's IP / CNAME per their docs.

## The design, in brief

A spec sheet, not a brochure: a warm paper ground (`#faf9f5`), ink hairline
rules, and small tint accents. Type is **Schibsted Grotesk** for text with
**Geist Mono** carrying the uppercase chrome — labels, nav, numbers. The deep
blue `#0a5f86` and rose `#cd5870` are the two accent voices; the flag's own
hexes (`#5BCEFA` / `#F5A9B8` / `#FFFFFF`) appear at full saturation only in
the brand mark and the preloader's pride strip.

All of it lives in `redesign.css` (tokens in `:root` at the top). The home
page's entrance preloader is pure CSS — a `plhide` keyframe animation that
draws the lockup and auto-hides at ~2.7s, with `pointer-events: none` so it
can never trap a visitor, script or no script.

## Logo & brand assets

Vendored from [`mtf-exchange/brand`](https://github.com/mtf-exchange/brand)
into `logo/` (byte-identical copies — update there, then re-copy):

| File | Used for |
|---|---|
| `logo/metaflux-mark.svg` | The mark (flux-gradient curve) — navbar + footer lockup |
| `logo/metaflux-mark-animated.svg` | Self-contained climb-on animation (standalone use) |

The on-page wordmark sets **`Meta`** in Geist 500 and **`Flux`** in PT Serif
italic (`.b-meta` / `.b-flux` in `redesign.css`), per the brand spec — never
swap or both-bold them.

`favicon.svg` is the square mark on a **transparent** ground, the same asset
the app serves — the mark's blue→rose gradient is mid-tone and stays legible
on both light and dark tab strips. `apple-touch-icon.png` is the exception
and must stay **opaque and full-bleed**: iOS composites transparent pixels
onto black and applies its own corner mask, so the plate is baked into the
PNG and no radius is.

## Open Graph image

`og.svg` is the source; **`og.png` (1200×630) is generated locally and
committed to the repo.** Do **not** generate it at deploy time — the card
uses Geist + PT Serif + Cormorant Garamond, and those fonts aren't guaranteed
on a build host, so deploy-time rasterisers (rsvg etc.) silently fall back to
the wrong fonts.

Regenerate after editing `og.svg` by rendering it through a browser that
actually loads the webfonts: wrap `og.svg` in an HTML file that `<link>`s the
Google Fonts, then screenshot at 1200×630 with headless Chrome (render at 2×
and downscale for crisp text):

```bash
# _og.html = the Google-Fonts <link>s + inline og.svg, on a 1200×630 page
chrome --headless=new --window-size=1200,630 --force-device-scale-factor=2 \
       --screenshot=og@2x.png http://localhost:8000/_og.html
sips -z 630 1200 og@2x.png --out og.png      # macOS; or any image tool
```

Then commit `og.png`. The HTML references `/og.png`.

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
