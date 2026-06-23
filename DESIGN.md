---
name: MetaFlux
description: An independent L1 derivatives exchange — dark, instrument-grade, lit by a quiet aurora.
colors:
  aurora-blue: "#5BCEFA"
  aurora-blue-deep: "#2ba8e0"
  quartz-rose: "#F5A9B8"
  quartz-rose-deep: "#ee7e95"
  pure-white: "#ffffff"
  ink: "#f0f3f7"
  ink-muted: "#8b96a8"
  ink-dim: "#5a6273"
  surface-base: "#06070b"
  surface-raised: "#0c0e14"
  surface-raised-2: "#12151d"
  hairline: "#1a1e29"
  hairline-strong: "#262b39"
  signal-positive: "#6ee7a3"
  signal-negative: "#ff7a8c"
typography:
  display:
    fontFamily: "Cormorant Garamond, Iowan Old Style, Cambria, Georgia, serif"
    fontSize: "clamp(64px, 9vw, 144px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Cormorant Garamond, Iowan Old Style, Cambria, Georgia, serif"
    fontSize: "clamp(40px, 5.5vw, 76px)"
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Cormorant Garamond, Iowan Old Style, Cambria, Georgia, serif"
    fontSize: "clamp(26px, 3vw, 34px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'ss01', 'cv11'"
  label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: "0.08em"
  code:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "PT Serif, Iowan Old Style, Cambria, Georgia, serif"
    fontWeight: 400
    fontStyle: "italic"
rounded:
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  pill: "999px"
spacing:
  gap: "20px"
  card: "44px"
  gutter: "32px"
  section: "140px"
components:
  button-primary:
    backgroundColor: "#f4f6f9"
    textColor: "{colors.surface-base}"
    rounded: "{rounded.pill}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.surface-base}"
  button-secondary:
    backgroundColor: "#0a0c12"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "13px 22px"
  button-secondary-hover:
    backgroundColor: "#0a0c12"
    textColor: "{colors.quartz-rose}"
  chip:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "8px 11px"
  chip-key:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 11px"
  card-glass:
    backgroundColor: "#0a0c12"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
---

# Design System: MetaFlux

## 1. Overview

**Creative North Star: "The Honest Instrument"**

MetaFlux looks the way a precision instrument feels: a near-black machined housing, faces of liquid glass, and one quiet aurora of light behind it all. The system pairs the elegance of a Cormorant Garamond display serif with the exactness of Geist Mono, so every screen reads as *measured* — the serif carries the claim, the mono carries the proof. Nothing here shouts. Confidence is expressed through restraint and specificity, never through volume. This is the visual translation of the product's voice: rigorous, candid, understated.

The surface is a single continuous dark field (`#06070b`) lit from within by a slow-drifting aurora of Aurora Blue, lavender, Quartz Rose and white. The aurora is the brand's one indulgence — and it carries a quiet signal of inclusion that the design lets you *feel* rather than explains. It is never captioned, never turned into a slogan, never named on the page. Over that field, components are built as **Liquid Glass**: translucent panels with a hairline ring, an inner top highlight, a deep ambient drop shadow, and a colored glow that appears only on interaction. Glass is the system's structural language, applied consistently to navigation, cards, buttons and frames — which is precisely what separates it from decorative glassmorphism.

This system explicitly rejects the visual grammar of crypto hype: no neon-casino glow, no rocket-and-moon iconography, no APY-bait hero metrics, no airdrop urgency. It equally rejects the interchangeable gradient-and-cards SaaS template, and any motion that fights legibility. Where competitors perform, MetaFlux demonstrates.

**Key Characteristics:**
- Dark, single-field canvas (`#06070b`) under one page-wide animated aurora; no section seams.
- Serif-display + mono pairing: Cormorant Garamond for headings, Geist Mono for every technical label, Geist for body.
- "Liquid Glass" panels everywhere — hairline ring + inner highlight + ambient drop + interaction-only colored glow.
- Accent restraint: Aurora Blue and Quartz Rose alternate as structural signals; white is the third, rarest voice.
- Motion is choreographed but reduced-motion-safe; effects serve comprehension, not spectacle.

## 2. Colors

A near-black instrument body, two restrained luminous accents, and a single aurora of light — color is a signal, never decoration.

### Primary
- **Aurora Blue** (`#5BCEFA`): the dominant accent and the system's "signal" voice. Carries technical labels, the typewriter line, primary-button hover glow, the `us` column in comparison tables, link affordances, and the leading accent in the aurora. Deepens to **Aurora Blue Deep** (`#2ba8e0`) for solid fills that need contrast.

### Secondary
- **Quartz Rose** (`#F5A9B8`): the human, emphatic counter-accent. Used for italic display accents (`h1 .accent`, `h2 .accent`), the brand wordmark's *Flux*, the secondary-button hover state, the open-FAQ marker, and alternating card/section signals. Deepens to **Quartz Rose Deep** (`#ee7e95`). Blue and rose are deliberately paired in opposition — blue states the mechanism, rose states the consequence.

### Tertiary
- **Pure White** (`#ffffff`): the third and rarest accent. Appears in the aurora bloom, the primary button's surface, the third code-bar dot, and the giant footer wordmark. Reserve it for moments that should read as the clearest, most resolved point on screen.

### Neutral
- **Ink** (`#f0f3f7`): primary text on dark; headings, resolved values, emphasized body.
- **Ink Muted** (`#8b96a8`): standard body copy, ledes, descriptions. Verify it clears 4.5:1 on the surface it sits over — it is the system's contrast watch-point.
- **Ink Dim** (`#5a6273`): de-emphasized labels, disabled/`no` states, metadata. Large or decorative use only; do not set running body copy in it.
- **Surface Base** (`#06070b`): the page field and chip backgrounds.
- **Surface Raised** (`#0c0e14`) / **Surface Raised 2** (`#12151d`): elevated solid panels (architecture layers, key chips, legal note frames).
- **Hairline** (`#1a1e29`) / **Hairline Strong** (`#262b39`): borders, dividers, FAQ rules, chip strokes.

### Signal
- **Signal Positive** (`#6ee7a3`) / **Signal Negative** (`#ff7a8c`): reserved for true state semantics (numeric deltas, pass/fail). Never decorative.

### Named Rules
**The Quiet Signal Rule.** The aurora's palette is identity, not message. Never label it, never explain it, never build copy around it. Its meaning is carried by presence alone.

**The Two-Voice Rule.** Blue and Rose are a call-and-response, not interchangeable tints. On any given component the two accents alternate deliberately (odd/even cards, blue→rose on state change). Never wash a surface in both at once; never introduce a third hue into the accent role.

**The Rarity Rule.** Pure white as an accent appears on a deliberately small fraction of any screen. Its scarcity is what makes it read as the most resolved point.

## 3. Typography

**Display Font:** Cormorant Garamond (with Iowan Old Style, Cambria, Georgia, serif)
**Body Font:** Geist (with -apple-system, system-ui fallbacks)
**Label/Code Font:** Geist Mono (with ui-monospace, SFMono-Regular, Menlo)
**Wordmark Accent:** PT Serif *italic* — used **only** for the *Flux* in the MetaFlux wordmark and the giant footer wordmark.

**Character:** A high-contrast pairing on a true contrast axis — a low-weight humanist display serif against a precise geometric monospace, bridged by a neutral grotesque for prose. The serif makes the page feel composed and unhurried; the mono makes every claim feel instrumented and checkable. The two never blur into each other.

### Hierarchy
- **Display** (Cormorant, 400, `clamp(64px, 9vw, 144px)`, line-height 0.92, `-0.022em`): the hero `h1` only. Italic spans in Quartz Rose mark the emphasized phrase ("first principles").
- **Headline** (Cormorant, 400, `clamp(40px, 5.5vw, 76px)`, line-height 1.0, `-0.02em`): section `h2`. Italic-rose accent span per section. Capped tighter on mobile (`clamp(27px, 7vw, 40px)`).
- **Title** (Cormorant, 400, 26–34px, line-height ~1.05): card titles (`.pillar h3` 32px, `.feature h4` 34px) and FAQ summaries (26px).
- **Body** (Geist, 400, 15–21px, line-height 1.55–1.65): hero lede is 21px; card/feature copy 15px; FAQ answers 16px. Font features `ss01`/`cv11` and tabular lining numerals are on globally. Cap measure at ~50–72ch (already enforced per block).
- **Label** (Geist Mono, 450–500, 11–13px, `letter-spacing` 0.06–0.14em, UPPERCASE): every technical micro-label — section tags, card numbers, architecture-layer keys, code-bar text, legal kickers. This is the system's "instrument readout" voice.
- **Code** (Geist Mono, 400, 13px, line-height 1.7): code frames and the architecture chips, with syntax coloring (comment → Ink Dim, keyword → Quartz Rose, string → Aurora Blue, number → Signal Positive).

### Named Rules
**The Serif-Says, Mono-Proves Rule.** Headings and prose claims are set in the serif; anything that is a fact, a spec, a label, or a value is set in mono. The pairing maps directly onto the product's "show the mechanism" voice.

**The Italic-Accent Rule.** Emphasis inside display headings is made with a Quartz Rose *italic* serif span — never bold, never a color-only change, never an underline. One emphasized phrase per heading.

## 4. Elevation

This system is **not flat** — depth is its signature. It uses a layered "Liquid Glass" model rather than conventional drop shadows: every floating surface combines (1) a 1px translucent ring, (2) an inner top highlight that reads as a lit edge, (3) a faint inner bottom shade, (4) a deep, soft ambient drop shadow, and (5) a `backdrop-filter` blur of 20–28px with elevated saturation. The result reads as frosted glass lifted off a dark field, not as a paper card with a shadow. Color enters elevation only on interaction: hover swaps the neutral ambient shadow for a tinted **Aurora Blue** or **Quartz Rose** glow.

### Shadow Vocabulary
- **Glass rest** (`inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(255,255,255,0.02), 0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px -16px rgba(0,0,0,0.50)`): the default for cards, code frames, comparison frames.
- **Glass hover** (`… 0 32px 80px -16px rgba(0,0,0,0.60)` + `translateY(-4px)`): lift on card hover.
- **Nav glass** (adds `0 20px 60px -10px rgba(0,0,0,0.55)` under a 28px blur): the sticky pill bar.
- **Primary-button glow** (`… 0 14px 40px -8px var(--blue-glow)`): Aurora Blue glow on primary hover.
- **Secondary-button glow** (`… 0 14px 40px -8px var(--pink-glow)`): Quartz Rose glow on secondary hover.

### Named Rules
**The Lit-Edge Rule.** Every glass surface must carry the inner top highlight (`inset 0 1px 0 rgba(255,255,255,…)`). Without it the panel reads as a flat dark box, not as glass catching light.

**The Glow-On-Touch Rule.** Colored shadow is an interaction reward, never a resting state. At rest the ambient shadow is neutral black; the blue/rose glow appears only on hover/focus and recedes on release.

**The Bordered-Diagram Exception.** The architecture stack is the one family that is *not* glass: its layers use solid raised surfaces (`#0c0e14`) with a `1px` hairline border and a vertical down-flow connector. Schematic content earns a schematic, non-glass treatment.

## 5. Components

### Buttons
- **Shape:** full pill (`999px`), 13px×22px padding, 14px Geist 500, with a built-in top sheen (`radial-gradient` highlight) and a trailing arrow that slides 4px right on hover.
- **Primary:** near-white vertical gradient surface, **Surface Base** text — the brightest, most resolved control on the page. Hover lifts 1px and blooms an Aurora Blue glow.
- **Secondary:** dark glass (`rgba(10,12,18,0.40)`) with Ink text. Hover shifts text and ring to **Quartz Rose** with a rose glow. Use primary for the single most important action per fold; secondary for the alternative.
- **Mobile:** buttons go full-width (`flex: 1 1 auto`) and center their label.

### Chips (architecture specs)
- **Standard:** Geist Mono 12px, Ink Muted, `1px` Hairline Strong border, **Surface Base** fill, `8px` radius, `nowrap`. The unit of the architecture diagram.
- **Key variant (`.chip.key`):** a gradient border (Aurora Blue → Quartz Rose via `border-box`) over a raised fill, prefixed with a `✦`. Marks the load-bearing components in the stack. The only place the two accents are allowed to touch.

### Cards / Containers (Liquid Glass)
- **Corner Style:** `24px` (pillars, features), `20px` (code & comparison frames), `16px` (architecture layers).
- **Background:** translucent dark (`rgba(10,12,18,0.50)`) over a top-down white film gradient; `backdrop-filter: blur(24px) saturate(170%)`.
- **Shadow Strategy:** Glass rest → Glass hover (see Elevation). Lift 4px on hover.
- **Border:** no literal border — the `1px` translucent ring in the shadow stack does the work.
- **Internal Padding:** 44–48px on desktop.
- **Accent:** feature cards carry a corner color-wash (Aurora Blue on odd, Quartz Rose on even); pillar number-labels alternate blue/rose.

### Disclosure (FAQ)
- **Style:** native `<details>`; Cormorant 26px summary, hairline rule between items, generous 28px vertical padding.
- **State:** a mono `+` marker in Aurora Blue rotates 45° into a `×` and shifts to Quartz Rose when open. No custom JS.

### Comparison Table
- **Style:** glass frame, all-mono, 13px. Header row in Ink Dim uppercase over a faint white tint.
- **State:** the MetaFlux (`us`) column is tinted Aurora Blue and prefixed `✓`; absent capabilities (`no`) are Ink Dim, prefixed `—`. Honest, legible, no theatrics.

### Navigation
- **Style:** sticky **Liquid Glass** pill (`999px`), offset 16px from the top, 28px blur, full multi-layer shadow stack. Brand lockup = mark + "Meta" (Geist 500) + "*Flux*" (PT Serif italic, Quartz Rose).
- **States:** links Geist 13px, Ink Muted → Ink on hover; a glass `nav-cta` pill on the right (rose-free until you reach the buttons). On scroll past 80px the bar gains a `.scrolled` class. Below 720px the link list is hidden (mark + CTA remain).

### Signature: The Aurora Backdrop
A single `position: fixed` layer behind everything: a colored base mesh (deep blue→indigo→violet) under seven radial blooms (blue/rose/lavender/white) blurred 64px and drifting on a 26s alternating loop, plus a soft-light film-grain and a legibility vignette. The footer is transparent so the same aurora bleeds through — the page is one continuous sheet of light with no section seams.

### Signature: The Mark Preloader
A full-screen entrance that draws the MetaFlux mark on stroke-by-stroke (faint shoulders first, bold peak last) via `stroke-dashoffset`, holds ~1.5s, then fades. A no-JS `<noscript>` and a 4s ceiling guarantee it never traps the page.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page a single dark field (`#06070b`) with the one page-wide aurora behind everything; let surfaces float on it seamlessly (no per-section backgrounds or seams).
- **Do** build every floating surface as full Liquid Glass — ring + inner top highlight + ambient drop + 20–28px backdrop blur. The inner highlight is mandatory (**The Lit-Edge Rule**).
- **Do** set claims in Cormorant and facts/labels/values in Geist Mono (**The Serif-Says, Mono-Proves Rule**).
- **Do** alternate Aurora Blue and Quartz Rose as a deliberate call-and-response; reserve Pure White for the single most resolved point (**The Two-Voice / Rarity Rules**).
- **Do** make emphasis with a rose *italic* serif span, never bold or underline (**The Italic-Accent Rule**).
- **Do** reserve colored glow for hover/focus only (**The Glow-On-Touch Rule**), and ship a `prefers-reduced-motion` alternative for every animation (aurora drift, preloader, typewriter, architecture assemble all already comply).
- **Do** verify Ink Muted (`#8b96a8`) and Ink Dim (`#5a6273`) clear contrast on whatever surface they sit over — favor Ink for any text carrying real meaning.

### Don't:
- **Don't** reach for crypto-hype grammar: no neon-casino glow, rocket/moon iconography, APY-bait numbers, or airdrop urgency.
- **Don't** ship the interchangeable gradient-and-cards SaaS template, the hero-metric template (big number / small label / stats row), or identical icon-heading-text card grids.
- **Don't** over-animate or let any effect fight legibility; motion serves comprehension or it doesn't ship.
- **Don't** explain, caption, or sloganize the aurora palette (**The Quiet Signal Rule**).
- **Don't** use gradient text (`background-clip: text`); emphasis comes from the rose italic serif, weight, or size — never a gradient fill.
- **Don't** treat glass as decoration on a light or flat surface; it is a committed structural language on a dark field, or it isn't used.
- **Don't** introduce colored left-stripe accent borders >1px. (The legacy `.legal .view` rose left-stripe is the one pre-existing exception; prefer a full hairline frame or a Quartz Rose-wash background for new note/callout blocks.)
- **Don't** add a third accent hue or wash a single surface in both blue and rose at once (the gradient-bordered key chip is the only sanctioned blue+rose adjacency).
