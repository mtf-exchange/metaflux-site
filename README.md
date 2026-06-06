# mtf.exchange — official site

Single-file static landing page. No build step, no framework.

```
./index.html   # the entire site
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

## Edit

`index.html` carries all markup + CSS inline. The color palette is in `:root { … }` near the top of the `<style>` block. Edit there.

## Palette

Trans-pride flag drawn directly:

- `#5BCEFA` light blue
- `#F5A9B8` pink
- `#FFFFFF` white

Plus a neutral text grayscale.

## Logo & brand assets

Vendored from [`mtf-exchange/brand`](https://github.com/mtf-exchange/brand) into `logo/` (byte-identical copies — update there, then re-copy):

| File | Used for |
|---|---|
| `logo/metaflux-mark.svg` | The mark (flux-gradient curve) — navbar + footer lockup |
| `logo/metaflux-mark-mono.svg` | Single-ink mark (`currentColor`) |
| `logo/metaflux-mark-square.svg` | 64×64 mark, centred — source for `favicon.svg` |
| `logo/metaflux-mark-square-mono.svg` | 64×64 mono mark — Safari pinned-tab `mask-icon` |
| `logo/metaflux-mark-animated.svg` | Self-contained climb-on animation (standalone use) |

The on-page wordmark follows the brand spec: **`Meta`** in Geist 500, **`Flux`** in PT Serif *italic* (`.b-meta` / `.b-flux` in `styles.css`; PT Serif loaded via Google Fonts). `favicon.svg` is the square mark on a dark rounded chip; the entrance preloader inlines the mark and draws it on via CSS (`#preloader` in `index.html` + `styles.css`).

## Open Graph image

`og.svg` is the source; **`og.png` (1200×630) is generated locally and committed to the repo.** Do **not** generate it at deploy time — the card uses Geist + PT Serif + Cormorant Garamond, and those fonts aren't guaranteed on a build host, so deploy-time rasterisers (rsvg etc.) silently fall back to the wrong fonts.

Regenerate after editing `og.svg` by rendering it through a browser that actually loads the webfonts: wrap `og.svg` in an HTML file that `<link>`s the Google Fonts, then screenshot at 1200×630 with headless Chrome (render at 2× and downscale for crisp text):

```bash
# _og.html = the Google-Fonts <link>s + inline og.svg, on a 1200×630 page
chrome --headless=new --window-size=1200,630 --force-device-scale-factor=2 \
       --screenshot=og@2x.png http://localhost:8000/_og.html
sips -z 630 1200 og@2x.png --out og.png      # macOS; or any image tool
```

Then commit `og.png`. The HTML references `/og.png`.

## License

Marketing content © MetaFlux. No license granted; do not copy.
