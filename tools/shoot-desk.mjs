#!/usr/bin/env node
/**
 * Re-shoot public/shots/desk.png — the product photograph in the home page's hero.
 *
 *   node tools/shoot-desk.mjs                  # assumes metaflux-web on :5210
 *   MFW=http://localhost:5173 node tools/…     # or point it somewhere else
 *
 * The image on the site is not a drawing of the trading desk, it IS the desk:
 * metaflux-web running against the devnet, photographed. This script exists so
 * that stays true — when the app's chrome moves, re-run it rather than
 * touching the picture.
 *
 * What it does, and why each part is here:
 *
 *   1. Connects a wallet by writing `wallet.address` in the app's own store.
 *      Without it the header reads "Connect wallet" and the ticket reads
 *      "Connect Wallet", which is a picture that contradicts a blotter holding
 *      four positions.
 *
 *   2. Pushes four positions and the account's own totals into `account`, the
 *      same $state the desk reads, so the REAL PositionsPanel and the REAL
 *      AccountSummary render them — coin marks, 20x badges, cross-margin cells,
 *      Close / Limit / Market / Reverse, TP/SL, the margin-ratio ring, the
 *      liquidation band. Nothing here is drawn by the marketing site.
 *
 *      The socket would clear them on the next commit (an unknown wallet's
 *      account_state is empty), so account frames are dropped at the WebSocket
 *      while the camera is up — see the init script below for why re-seeding
 *      instead was a mistake.
 *
 *   3. Crops by measurement, never a fixed y: down to whichever column
 *      finishes last (account panel vs blotter), stopping before the ticker
 *      strip. A fixed-y crop is what spoiled the first version of this image —
 *      it sliced the account summary in half and left half a ticker entry in
 *      the corner.
 *
 * Numbers are illustrative and the caption on the page says so. Market data,
 * the book, the chart and every label are live.
 */
// playwright is a CJS package and lives in the sibling app, which is the only
// place in this workspace that has a browser. This site has no dependencies and
// is not going to grow one for a script that runs by hand.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(
	process.env.PW ??
		'/Users/robpike/Desktop/Workspaces/metaflux-web/node_modules/playwright/index.js'
);

const BASE = process.env.MFW ?? 'http://localhost:5210';
const OUT = new URL('../public/shots/', import.meta.url).pathname;

const POSITIONS = [
	// coin, side, size, entry, mark, leverage, liq, funding
	['BTC', 'long', 3.25, 63480.0, 63862.7, 20, 52140.5, -38.2, '3.25'],
	['ETH', 'short', 42.0, 3196.4, 3158.9, 20, 3842.7, 12.44, '42.00'],
	['SOL', 'short', 1250, 146.2, 147.5, 20, 179.4, 21.06, '1250'],
	['MTF', 'long', 850000, 0.1352, 0.13657, 20, 0.09512, -6.35, '850000']
];

const browser = await chromium.launch();
const page = await browser.newPage({
	// 1220, not 1080: the account panel's last row (Liquidation risk) falls
	// below the fold at 1080, and a viewport that clips it is what produced the
	// first version of this image with the summary sliced in half.
	viewport: { width: 1860, height: 1220 },
	deviceScaleFactor: 2
});

// The node pushes a fresh account_state on every commit, and for a wallet it
// has never seen that state is empty — so it clears the seeded positions out
// from under the camera. The first workaround re-seeded them every animation
// frame, which was worse than the disease: the blotter flashes any row whose
// values move (flash.ts / the 1.4s mfflash arrival sweep), so a per-frame
// rewrite kept all four rows lit and the photograph showed them soaked in
// highlight. Instead: once __holdAccount is set, account_state frames are
// dropped at the socket. Market data keeps flowing; the account is ours; no
// value ever changes twice; nothing flashes.
await page.addInitScript(() => {
	const strip = (handler) =>
		function (ev) {
			if (window.__holdAccount && typeof ev.data === 'string' && ev.data.includes('account_state'))
				return;
			return handler.call(this, ev);
		};
	const desc = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'onmessage');
	Object.defineProperty(WebSocket.prototype, 'onmessage', {
		get() { return desc.get.call(this); },
		set(fn) { desc.set.call(this, fn ? strip(fn) : fn); }
	});
	const add = WebSocket.prototype.addEventListener;
	WebSocket.prototype.addEventListener = function (type, fn, ...rest) {
		return add.call(this, type, type === 'message' && fn ? strip(fn) : fn, ...rest);
	};
});

await page.goto(`${BASE}/trade/perp/BTC-USDC`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500); // let the book, the chart and the ticker fill

// 1 — the wallet
await page.evaluate(async () => {
	const w = await import('/src/lib/wallet.svelte.ts');
	w.wallet.address = '0x7A4fC2b19E5cD3a1B8e6F0d27c9A45E3B1d8F62c';
	w.wallet.chainId = '31337';
	w.wallet.connector = 'injected';
});
await page.waitForTimeout(1500);

// 2 — the account, held against the socket
await page.evaluate(async (rows) => {
	const m = await import('/src/lib/stores/index.ts');
	const a = m.account;
	const build = () =>
		rows.map(([coin, side, size, entry, mark, lev, liq, funding, sizeStr]) => {
			const abs = Math.abs(size);
			const value = abs * mark;
			const pnl = (side === 'long' ? 1 : -1) * (mark - entry) * abs;
			const margin = value / lev;
			return {
				coin,
				leverage: lev,
				mode: 'cross',
				side,
				size: sizeStr,
				value,
				entry,
				mark,
				pnl,
				roe: (pnl / margin) * 100,
				liq,
				margin,
				marginMode: 'cross',
				funding
			};
		});
	const totals = () => {
		const ps = a.positions;
		const equity = 528018;
		a.portfolioValue = equity;
		// An account carrying $640k of notional cannot read "Available to trade
		// 0.00 USDC" — that was the other thing wrong with the first shot.
		a.availableUsd = 74393;
		a.accountValue = equity;
		a.leverage = ps.reduce((s, p) => s + p.value, 0) / equity;
		// …and the ticket does NOT read availableUsd when the node has answered:
		// OrderEntry prefers `activeAsset.availableToTrade` (long, short) and only
		// falls back to the free balance. Setting one and not the other is how the
		// header ends up saying $528k while the ticket says nothing is tradeable.
		const notional = a.availableUsd * 20;
		a.activeAsset = {
			...(a.activeAsset ?? {}),
			leverage: 20,
			marginMode: 'cross',
			availableToTrade: [notional, notional]
		};
	};
	window.__holdAccount = true; // from here the socket's account frames are dropped
	a.positions = build();
	totals();
}, POSITIONS);

// Let the arrival wash (`mfflash`, 1.4s — the whole-row soak that made the
// first shot look fake) finish, and insist it has: no .row-flash at the
// shutter. Cell-level .flash-up/.flash-down are NOT waited out — those are
// live mark-price ticks, a real desk blinks like that, and a photograph with
// one or two lit cells is the truth.
await page.waitForTimeout(2200);
await page.waitForFunction(() => document.querySelectorAll('.row-flash').length === 0, {
	timeout: 10000
});
await page.waitForTimeout(200);

// 3 — measure the crop off the right column, never a fixed y
const cut = await page.evaluate(() => {
	const el = [...document.querySelectorAll('*')].find((e) =>
		/Liquidation risk/.test(e.textContent ?? '') && e.children.length <= 3
	);
	const rightBottom = el ? el.getBoundingClientRect().bottom : 1040;
	const ticker = [...document.querySelectorAll('*')].find((e) =>
		/^\s*\d+ms/.test(e.textContent ?? '')
	);
	const tickerTop = ticker ? ticker.getBoundingClientRect().top : 1180;
	// the blotter's last row — the left column's own finish line
	const rows = [...document.querySelectorAll('tr')];
	const last = rows[rows.length - 1];
	const blotterBottom = last ? last.getBoundingClientRect().bottom + 14 : 0;
	return {
		rightBottom: Math.ceil(rightBottom + 16),
		blotterBottom: Math.ceil(blotterBottom),
		tickerTop: Math.floor(tickerTop)
	};
});

// Keep everything down to whichever column finishes last — the account panel or
// the blotter — and stop before the ticker strip, which is a scrolling marquee
// and photographs as a row of half-words.
const height = Math.min(cut.tickerTop, Math.max(cut.rightBottom, cut.blotterBottom));
const shot = await page.screenshot({
	type: 'png',
	clip: { x: 0, y: 0, width: 1860, height }
});
await browser.close();

writeFileSync(`${OUT}desk.png`, shot);
console.log(`public/shots/desk.png — 1860x${height}  (cuts: ${JSON.stringify(cut)})`);
console.log('now: python3 tools/webp-desk.py');
