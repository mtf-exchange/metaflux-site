// Home page: live markets (a REST snapshot, then the `markets` WebSocket channel) and the points clock.
(() => {
  const API = 'https://api.testnet.mtf.exchange';
  const APP = 'https://app.mtf.exchange/';
  const NAMES = {
    BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', BNB: 'BNB', MTF: 'MetaFlux', PUMP: 'Pump', ARB: 'Arbitrum',
    'ipo:AAPL': 'Apple', 'ipo:MSFT': 'Microsoft', 'ipo:NVDA': 'NVIDIA', 'ipo:TSLA': 'Tesla', 'ipo:AMZN': 'Amazon',
    'ipo:GOOGL': 'Alphabet', 'ipo:META': 'Meta Platforms', 'ipo:SPCX': 'SpaceX', 'ipo:CRCL': 'Circle',
    'ipo:MOUTAI': 'Kweichow Moutai', 'ipo:CATL': 'CATL', 'ipo:PINGAN': 'Ping An Insurance', 'ipo:CMB': 'China Merchants Bank',
    'ipo:BYD': 'BYD', 'ipo:CXMT': 'CXMT',
    'ipo:XAU': 'Gold', 'ipo:XAG': 'Silver', 'ipo:WTI': 'WTI crude oil', 'ipo:BRENT': 'Brent crude oil',
    'ipo:EUR': 'Euro', 'ipo:GBP': 'British pound',
  };
  const ORDER = Object.keys(NAMES);
  const LABEL = { Stock: 'US stock', AShare: 'A-share' };
  const classOf = (c) => !c.includes(':') ? 'Crypto'
    : /^ipo:(MOUTAI|CATL|PINGAN|CMB|BYD|CXMT)$/.test(c) ? 'AShare'
    : /^ipo:(XAU|XAG|WTI|BRENT)$/.test(c) ? 'Commodity'
    : /^ipo:(EUR|GBP)$/.test(c) ? 'FX' : 'Stock';
  // Coins go into innerHTML, and only the native and ipo dexes are classified, so admit nothing else.
  const COIN = /^(ipo:)?[A-Za-z0-9]+$/;

  const rows = document.getElementById('rows');
  const halves = document.querySelectorAll('#tape > div');
  const seen = new Map(); // coin -> { els: [tr, tick, tick], dp }
  const lev = new Map();
  let filter = 'Crypto';

  const dpOf = (v) => { const s = String(v), i = s.indexOf('.'); return i < 0 ? 0 : Math.min(s.length - i - 1, 6); };
  const fmt = (v, dp) => Number(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const rank = (c) => { const i = ORDER.indexOf(c); return i < 0 ? ORDER.length : i; };
  const place = (parent, el) => parent.insertBefore(el, [...parent.children].find((x) => +x.dataset.r > +el.dataset.r) || null);
  const setLev = (coin) => { const e = seen.get(coin), l = lev.get(coin); if (e && l) e.els[0].querySelector('[data-lev]').textContent = l + 'x'; };

  const make = (coin) => {
    const sym = coin.replace(/^ipo:/, ''), cls = classOf(coin), icon = `${APP}symbols/${sym}.svg`;
    rows.querySelector('.wait')?.remove();
    const tr = document.createElement('tr');
    tr.dataset.c = cls; tr.dataset.r = rank(coin); tr.hidden = filter !== cls;
    tr.innerHTML = `<td><a class="mk" href="${APP}trade/perp/${coin}-USDC"><img src="${icon}" alt="" width="34" height="34" loading="lazy"><div><b>${NAMES[coin] || sym}</b><span>${sym}-USDC</span></div></a></td><td class="r num" data-px></td><td class="r num"><span data-chg></span></td><td class="r num" data-lev>–</td><td class="mute">${LABEL[cls] || cls}</td><td class="r"><a class="go" href="${APP}trade/perp/${coin}-USDC">Trade</a></td>`;
    place(rows, tr);
    const ticks = [...halves].map((half) => {
      const t = document.createElement('div');
      t.className = 'tick'; t.dataset.r = tr.dataset.r;
      t.innerHTML = `<img src="${icon}" alt="" width="28" height="28"><span class="s">${sym}</span><span class="p num" data-px></span><span class="c num"><span data-chg></span></span>`;
      place(half, t);
      return t;
    });
    const e = { els: [tr, ...ticks], dp: 0 };
    seen.set(coin, e);
    setLev(coin);
    return e;
  };

  const paint = (m) => {
    const e = seen.get(m.coin) || make(m.coin);
    e.dp = Math.max(e.dp, dpOf(m.mark_px)); // the widest precision seen, so a price does not jitter in width
    const n = (+m.change_24h || 0) * 100, flat = Math.abs(n) < 0.005;
    const txt = flat ? '0.00%' : (n > 0 ? '+' : '−') + Math.abs(n).toFixed(2) + '%';
    e.els.forEach((el, i) => {
      el.querySelector('[data-px]').textContent = fmt(m.mark_px, e.dp);
      const c = el.querySelector('[data-chg]');
      c.textContent = txt;
      c.className = flat ? 'flat' : (n > 0 ? 'up' : 'down') + (i ? '-d' : '-l');
    });
  };

  // The snapshot sends { perp, spot }; a socket frame is one flat list that also carries spot rows.
  const apply = (data) => {
    const list = Array.isArray(data) ? data : (data && data.perp) || [];
    list.filter((m) => m && COIN.test(m.coin) && m.mark_px && !m.halted && (m.kind || 'perp') === 'perp').forEach(paint);
  };

  const post = (type) => fetch(API + '/info', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type }) })
    .then((r) => r.json()).then((j) => j.data);
  const snapshot = () => post('markets').then(apply).catch(() => {});
  post('markets_meta').then((d) => {
    (d.perp || []).forEach((m) => lev.set(m.coin, m.max_leverage));
    seen.forEach((_, c) => setLev(c));
  }).catch(() => {});
  snapshot();

  let poll = 0;
  const live = () => {
    let ws;
    try { ws = new WebSocket(API.replace('https', 'wss') + '/ws'); } catch { poll = setInterval(snapshot, 5000); return; }
    ws.onopen = () => { clearInterval(poll); ws.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'markets' } })); };
    ws.onmessage = (e) => { try { const f = JSON.parse(e.data); if (f.channel === 'markets') apply(f.data); } catch {} };
    // Clear before re-arming, or each failed reconnect stacks another poll.
    ws.onclose = () => { clearInterval(poll); poll = setInterval(snapshot, 5000); setTimeout(live, 15000); };
    ws.onerror = () => ws.close();
  };
  live();

  rows.addEventListener('click', (e) => { if (!e.target.closest('a')) e.target.closest('tr')?.querySelector('a.mk')?.click(); });

  document.querySelectorAll('.filters button').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f;
    document.querySelectorAll('.filters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    rows.querySelectorAll('tr[data-c]').forEach((tr) => { tr.hidden = tr.dataset.c !== filter; });
  }));

  const W1 = Date.UTC(2026, 8, 9), WEEK = 7 * 864e5, S1_END = Date.UTC(2026, 9, 7);
  const pad = (n) => String(n).padStart(2, '0');
  const $ = (id) => document.getElementById(id);
  const tick = () => {
    const now = Date.now(), next = W1 + Math.ceil((now - W1) / WEEK) * WEEK, d = Math.max(0, next - now);
    $('clock-lab').textContent = next === S1_END ? 'Season 1, Ginnungagap, closes in' : 'This week closes in';
    $('cd-d').textContent = Math.floor(d / 864e5);
    $('cd-h').textContent = pad(Math.floor(d / 36e5) % 24);
    $('cd-m').textContent = pad(Math.floor(d / 6e4) % 60);
    $('cd-s').textContent = pad(Math.floor(d / 1e3) % 60);
  };
  tick(); setInterval(tick, 1000);
})();
