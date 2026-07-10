#!/usr/bin/env python3
"""Build whitepaper-print.html (plain black-on-white academic layout)
from the canonical whitepaper.html article content. Run from repo root:
    python3 tools/build-print.py
Then render the PDF:
    node tools/render-pdf.mjs "$PWD/whitepaper-print.html" "$PWD/whitepaper.pdf"
"""
import re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "whitepaper.html").read_text()

m = re.search(r'<article class="paper-content">(.*)</article>', src, re.S)
if not m:
    raise SystemExit("could not locate <article class=\"paper-content\"> in whitepaper.html")
content = m.group(1).strip()

# Hard-code section numbers into the h2 headings from each section's ps-num
# (CSS counters are unreliable across Paged.js fragmentation).
content = re.sub(
    r'<div class="ps-num">0?(\d+)</div>\s*<h2>',
    lambda m2: f'<div class="ps-num">{m2.group(1)}</div>\n      <h2>{int(m2.group(1))}.&nbsp; ',
    content,
)

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MetaFlux Whitepaper — print</title>
<style>
/* ────────────────────────────────────────────────────────────────
   whitepaper-print.html — GENERATED FILE, do not edit by hand.
   Plain black-on-white academic layout for the PDF edition.
   Rebuild with:  python3 tools/build-print.py
   Render with:   node tools/render-pdf.mjs "$PWD/whitepaper-print.html" "$PWD/whitepaper.pdf"
   ──────────────────────────────────────────────────────────────── */
:root {
  --ink: #000;
  --ink-mid: #1a1a1a;
  --ink-dim: #555;
  --rule: #999;
  --rule-light: #ccc;
  --serif: Georgia, "Times New Roman", "Nimbus Roman", serif;
  --mono: "Menlo", "Consolas", "Courier New", monospace;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  font-family: var(--serif);
  color: var(--ink-mid);
  background: #fff;
  font-size: 10pt;
  line-height: 1.55;
}

@page {
  size: A4;
  margin: 24mm 22mm 26mm;
  @bottom-center {
    content: counter(page);
    font-family: Georgia, serif;
    font-size: 9pt;
    color: #333;
  }
}
@page :first { @bottom-center { content: counter(page); } }

/* ── title block ─────────────────────────────────────────────── */
.titleblock { text-align: center; margin: 6mm 0 10mm; }
.titleblock h1 {
  font-size: 19pt;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--ink);
  margin-bottom: 5mm;
}
.titleblock .authors { font-size: 11pt; color: var(--ink); margin-bottom: 1.5mm; }
.titleblock .affil {
  font-size: 9.5pt;
  color: var(--ink-dim);
  margin-bottom: 1mm;
}
.titleblock .edition { font-size: 9.5pt; color: var(--ink-dim); }
.titlerule { border: 0; border-top: 1px solid var(--ink); margin: 8mm 0 7mm; }

/* ── contents ────────────────────────────────────────────────── */
.contents { margin: 0 0 9mm; }
.contents .c-title {
  font-size: 11pt; font-weight: 700; color: var(--ink);
  margin-bottom: 3mm;
}
.contents ol { list-style: none; counter-reset: toc; column-count: 2; column-gap: 10mm; }
.contents li { counter-increment: toc; }
.contents li a {
  display: flex; align-items: baseline; gap: 2.5mm;
  padding: 1.1mm 0;
  color: var(--ink-mid); text-decoration: none;
  font-size: 9pt;
  break-inside: avoid;
}
.contents li a::before {
  content: counter(toc);
  min-width: 4mm;
  color: var(--ink-dim);
  font-size: 8.5pt;
}
.contents li a::after {
  content: target-counter(attr(href), page);
  margin-left: auto;
  color: var(--ink-dim);
  font-size: 8.5pt;
}

/* ── sections ────────────────────────────────────────────────── */
section.ps { margin-bottom: 7mm; }
.ps-num { display: none; }
h2 {
  font-size: 13.5pt;
  font-weight: 700;
  color: var(--ink);
  margin: 7mm 0 3mm;
  break-after: avoid;
}
h3 {
  font-size: 11pt;
  font-weight: 700;
  color: var(--ink);
  margin: 5mm 0 2mm;
  break-after: avoid;
}
p { margin-bottom: 2.8mm; text-align: justify; hyphens: auto; }
p.lead { font-size: 10pt; }
strong { color: var(--ink); font-weight: 700; }
em { font-style: italic; }
.mono { font-family: var(--mono); font-size: 0.85em; color: var(--ink); }
a { color: inherit; text-decoration: none; }

/* ── axis blocks → plain definition paragraphs ───────────────── */
.axes { margin: 3mm 0 3.5mm; }
.axis { margin: 0 0 2.5mm 6mm; break-inside: avoid; }
.axis-tag {
  font-size: 9pt; font-weight: 700; color: var(--ink);
  text-transform: none; margin-bottom: 0.5mm;
}
.axis p { margin: 0; font-size: 9.5pt; }

/* ── tables ──────────────────────────────────────────────────── */
.spec-table { margin: 3.5mm 0 4mm; break-inside: avoid; }
.spec-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.6pt;
  border-top: 1.2px solid var(--ink);
  border-bottom: 1.2px solid var(--ink);
}
.spec-table th, .spec-table td {
  text-align: left;
  padding: 1.8mm 2.6mm;
  border-bottom: 0.6px solid var(--rule-light);
  vertical-align: top;
  line-height: 1.45;
  color: var(--ink-mid);
}
.spec-table tr { break-inside: avoid; }
.spec-table th {
  font-weight: 700;
  font-size: 8.4pt;
  color: var(--ink);
  border-bottom: 0.8px solid var(--ink);
}
.spec-table td.fn { color: var(--ink); font-weight: 700; white-space: nowrap; }
.spec-table td.fn .mono { white-space: normal; font-weight: 400; }
.spec-table tr:last-child td { border-bottom: none; }
.spec-table td.yes, .spec-table td.nope { font-family: var(--mono); font-size: 8pt; color: var(--ink); }
.spec-table .mono { font-size: 7.8pt; }

/* ── fee split → plain ruled rows ────────────────────────────── */
.split { margin: 3.5mm 0 4mm; break-inside: avoid; border-top: 1.2px solid var(--ink); border-bottom: 1.2px solid var(--ink); }
.split-row {
  display: flex; align-items: baseline; gap: 5mm;
  padding: 2.2mm 0;
  border-bottom: 0.6px solid var(--rule-light);
}
.split-row:last-child { border-bottom: none; }
.split-pct { font-size: 12pt; font-weight: 700; color: var(--ink); width: 14mm; flex-shrink: 0; }
.split-label { font-size: 9.3pt; color: var(--ink-mid); text-align: justify; }

/* ── threats list ────────────────────────────────────────────── */
.threats { list-style: none; margin: 2mm 0 3mm; }
.threats li {
  padding: 1.6mm 0 1.6mm 5mm;
  position: relative;
  font-size: 9.5pt;
  line-height: 1.5;
  text-align: justify;
  hyphens: auto;
}
.threats li::before { content: "–"; position: absolute; left: 0.5mm; color: var(--ink); }
.threats .t-name { color: var(--ink); font-weight: 700; }

/* ── references ──────────────────────────────────────────────── */
.refs { list-style: none; counter-reset: ref; margin: 2mm 0; }
.refs li {
  counter-increment: ref;
  position: relative;
  padding: 0.8mm 0 0.8mm 8mm;
  font-size: 9pt;
  line-height: 1.5;
  text-align: justify;
}
.refs li::before {
  content: "[" counter(ref) "]";
  position: absolute; left: 0;
  color: var(--ink);
}

.closing {
  margin-top: 5mm;
  font-style: italic;
  color: var(--ink);
  text-align: left !important;
}
</style>
</head>
<body>

<div class="titleblock">
  <h1>MetaFlux: A Layer-1 Derivatives Exchange</h1>
  <div class="authors">MetaFlux Foundation</div>
  <div class="affil">hello@mtf.exchange &nbsp;·&nbsp; mtf.exchange</div>
  <div class="edition">Whitepaper v1.0 &nbsp;·&nbsp; 2026</div>
</div>
<hr class="titlerule">

<div class="contents">
  <div class="c-title">Contents</div>
  <ol>
    <li><a href="#abstract">Abstract</a></li>
    <li><a href="#introduction">Introduction</a></li>
    <li><a href="#consensus">Consensus: MetaFluxBFT</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#microstructure">Market structure</a></li>
    <li><a href="#risk">Risk &amp; margin</a></li>
    <li><a href="#vm">Execution layer</a></li>
    <li><a href="#bridge">MetaBridge</a></li>
    <li><a href="#markets">Markets &amp; permissionless listing</a></li>
    <li><a href="#economics">Economics</a></li>
    <li><a href="#security">Security model</a></li>
    <li><a href="#conclusion">Conclusion</a></li>
    <li><a href="#references">References</a></li>
  </ol>
</div>
<hr class="titlerule">

<article>
"""

TAIL = """
</article>

<script src="paged.polyfill.js"></script>
</body>
</html>
"""

out = HEAD + content + TAIL
(root / "whitepaper-print.html").write_text(out)
print(f"wrote whitepaper-print.html ({len(out)} bytes)")
