#!/usr/bin/env python3
"""Compare the built dist/*.html against the pre-Astro originals in git.

The migration was layout-only: <head> is now shared and normalised, but every
byte of body markup should be unchanged. This asserts exactly that.

    python3 tools/check-parity.py            # vs 88cddd4, the pre-migration output
    python3 tools/check-parity.py <rev>
"""
import re, subprocess, sys, difflib, pathlib

# 88cddd4 is the last commit before the Astro migration — the reference output.
REV = sys.argv[1] if len(sys.argv) > 1 else "88cddd4"
PAGES = ["index.html", "whitepaper.html", "terms.html", "privacy.html"]

def body(html):
    m = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    assert m, "no <body>"
    s = m.group(1)
    s = s.replace("&#123;", "{").replace("&#125;", "}")   # brace escaping for Astro
    s = s.replace('src="logo/', 'src="/logo/')      # shared components use root-absolute paths
    s = re.sub(r'<script src="[^"]*main\.js"></script>', "", s)
    s = re.sub(r'\s+', " ", s)                            # indentation is not content
    return s.strip()

fail = 0
for page in PAGES:
    old = subprocess.run(["git", "show", f"{REV}:{page}"],
                         capture_output=True, text=True, check=True).stdout
    new = pathlib.Path("dist", page).read_text()
    a, b = body(old), body(new)
    if a == b:
        print(f"ok    {page}")
        continue
    fail += 1
    print(f"DIFF  {page}")
    for line in list(difflib.unified_diff(a.split(" "), b.split(" "), lineterm="", n=3))[:60]:
        print("      " + line)

sys.exit(fail)
