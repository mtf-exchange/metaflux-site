# Product

## Register

brand

## Users

Two audiences, designed for in equal measure — never one at the expense of the other:

- **Professional derivatives traders & trading desks** migrating from a CEX or another perp DEX. They arrive skeptical, evaluating in minutes. They care about concrete mechanics: cross-asset portfolio margin that nets a hedged book to one number, MEV-resistant matching, cancel latency, liquidation grace, API-first wallets. They've been burned by chains that promised and didn't ship.
- **Protocol builders & market makers** who want to deploy permissionless markets on a *real* EVM and integrate without rewriting their stack ("zero-code migration"). They read the architecture and the whitepaper, not the hero.

Both read in a high-skepticism, high-expertise context. Neither wants to be marketed at. The site must reward depth-on-demand: the hero earns the scroll, the architecture section and whitepaper close the sale.

## Product Purpose

MetaFlux (mtf.exchange) is the pre-launch marketing site for an independent L1 derivatives exchange — a single chain with a native clearing core on MetaFluxBFT consensus, a parallel EVM, cross-asset portfolio margin, MEV-resistant matching, and permissionless market deploy. A MetaFlux Foundation product.

The product is **pre-launch** (devnet / phased testnet). The site's job is not to transact — it's to **establish technical credibility**: convince serious desks and builders that the engineering is real, specific, and shipping, so they apply for devnet and follow to mainnet. Success = a skeptical pro reads the architecture, believes the claims are load-bearing, and signs up.

Because the engine is genuinely early (S1-stage; many headline features are scaffolded + planned, not production-live), credibility depends on **honesty as a feature**, not despite it.

## Brand Personality

Engineering-led, first-principles, quietly confident, anti-hype. The voice of a team that would rather show the mechanism than promise the outcome.

- **Three words:** rigorous · candid · understated.
- **Tone:** declarative and specific ("Portfolio margin that nets a hedged book to one number, not three"), never breathless. Confidence comes from precision, not volume. The FAQ is literally titled "Honest answers."
- **Emotional goal:** the relief and respect a serious trader feels when a team finally talks to them like a peer — names the hard problems, states what's shipped and what isn't, and doesn't insult their intelligence.
- **Identity:** the palette is drawn directly from the trans-pride flag (blue / pink / white). This is a deliberate, quiet signal of inclusion — present in the surface, **never explained in copy**. Let those who notice notice; write nothing about it. Inclusion is shown, not stated.

## Anti-references

What this must NOT look or feel like:

- **Degen / hype crypto.** No moon-and-rocket iconography, neon-casino glow, APY-bait numbers, airdrop teasing, or hype-cycle urgency. The audience is repelled by this, not drawn in.
- **Generic SaaS template.** No interchangeable gradient-and-cards startup look, no hero-metric template (big number / small label / stats row), no identical icon-heading-text card grids repeated down the page. If a competitor's landing page could host our copy unchanged, it has failed.
- **Over-animated / loud.** No flashy motion for its own sake, no information overload, nothing that fights legibility. Motion serves comprehension or it doesn't ship.

(Note: cold/sterile enterprise-fintech was *not* flagged as an anti-reference — institutional seriousness is welcome, but it must carry the brand's own warmth and candor, not bank-grade blandness.)

## Design Principles

1. **Credibility through specifics.** Every claim names a mechanism, a number, or a tradeoff. Show the architecture, don't assert "best-in-class." Concreteness is the entire conversion strategy — the primary goal is technical credibility, and specificity is how credibility is earned.
2. **Honest by default.** Hedge what isn't shipped (testnet / phased / planned) rather than claiming it live. The "Honest answers" voice and the "components ship across phased testnet milestones" framing are load-bearing, not disclaimers. Truth is the differentiator in a category built on overpromising.
3. **Two readers, one page.** Serve the pro trader and the protocol builder simultaneously and equally. No section may win one audience by losing the other; use depth-on-demand (hero → protocol → architecture → builders/traders → whitepaper) so each reader finds their layer without being talked down to.
4. **Inclusion as a quiet signal.** The trans-pride palette is identity, not a statement. Let it be felt through color and craft; never caption it, never make it a slogan.
5. **Restraint as confidence.** A team sure of its engineering doesn't shout. Motion, color, and effects earn their place by aiding comprehension; spectacle reads as compensation. Quiet precision over theatrics.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA.** Body text ≥ 4.5:1 against the dark background; large/heading text ≥ 3:1. Audit muted tones (`--text-mid` `#8b96a8`, `--text-dim` `#5a6273`) against `--bg`/elevated surfaces — dim grays on near-black are the likely failure point and must clear AA where they carry real content.
- **Reduced motion is mandatory.** The preloader, aurora drift, typewriter, and scroll/assemble animations all already honor `prefers-reduced-motion: reduce` (static first phrase, near-instant preloader dismiss, no aurora drift). Every future animation needs the same alternative.
- **Color is never the sole signal.** The blue/pink palette must not be the only thing distinguishing states (good/bad, active/inactive) — pair with text, weight, or icon. Keep good/bad cues legible for color-blind readers.
- **Dark-theme only**, declared via `color-scheme: dark`; type sizes and line-height tuned for light-on-dark legibility.
- Semantic, keyboard-navigable markup; no-JS fallbacks already present (preloader hidden via `<noscript>`).
