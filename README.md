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

## License

Marketing content © MetaFlux. No license granted; do not copy.
