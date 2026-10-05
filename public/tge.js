// The TGE page's one script: the live week from the reader's clock, the marker
// on the bow, and the points reads from the testnet archive. No library.
(() => {
  const { GENESIS, W1_END, TGE, seasons } = JSON.parse(document.getElementById('pts-cfg').textContent);
  const API = 'https://api.testnet.mtf.exchange/info';
  const WEEK = 7 * 86400000;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const now = Date.now();
  const n = now < W1_END ? 1 : Math.floor((now - W1_END) / WEEK) + 2;
  const cut = new Date(W1_END + (n - 1) * WEEK);
  const current = [...seasons].reverse().find((s) => now >= s.start);
  const next = seasons.find((s) => now < s.start);
  const status = (s) => (s === current ? 'In progress' : now >= s.start ? 'Closed' : s.n === 4 ? 'Last' : s === next ? 'Next' : 'Later');

  if (current) {
    document.querySelectorAll('[data-week]').forEach((el) => { el.textContent = `Week ${n} · Season ${current.n}, ${current.name}`; });
    document.querySelectorAll('[data-cut]').forEach((el) => { el.textContent = `Cuts ${DOW[cut.getUTCDay()]} ${cut.getUTCDate()} ${MON[cut.getUTCMonth()]}, 00:00 UTC`; });
  }
  seasons.forEach((s) => {
    const el = document.querySelector(`[data-status="${s.n}"]`);
    if (!el) return;
    el.textContent = status(s);
    el.closest('tr').classList.toggle('is-now', s === current);
  });
  const sel = document.getElementById('season');
  if (current && sel) sel.value = String(current.n);

  const f = Math.min(Math.max((now - GENESIS) / (TGE - GENESIS), 0), 1);
  document.querySelectorAll('svg.bow').forEach((svg) => {
    let p;
    try { const path = svg.querySelector('.ahead'); p = path.getPointAtLength(f * path.getTotalLength()); } catch { return; }
    svg.querySelector('.past').setAttribute('stroke-dasharray', `${(f * 1000).toFixed(1)} 1000`);
    const g = svg.querySelector('.now');
    g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    g.style.display = '';
  });

  const NOT_LIVE = 'not-live';
  const info = (body) => fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    .then(async (r) => {
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || !j.data) throw new Error(NOT_LIVE);
      return j.data;
    });
  const DOWN = 'The archive did not answer. Try again later.';
  const ms = (t) => (Number(t) < 1e12 ? Number(t) * 1000 : Number(t));
  const dayTxt = (t) => { const d = new Date(ms(t)); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  const usd = (micro) => '$' + Math.trunc(Number(micro) / 1e6).toLocaleString('en-US');
  const pts = (micro) => (Math.trunc(Number(micro)) / 1e6).toLocaleString('en-US', { maximumFractionDigits: 6 });
  const int = (v) => Number(v).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const stateRow = (text) => `<tr class="st"><td colspan="6">${esc(text)}</td></tr>`;

  const weeks = document.querySelector('[data-weeks]');
  info({ type: 'points_weeks' }).then((d) => {
    const rows = d.weeks || [];
    weeks.innerHTML = rows.length ? rows.map((w) => `<tr>
      <td class="num">${esc(dayTxt(w.week_end_ts))}</td>
      <td class="num" data-k="Season">${esc(w.season)}</td>
      <td class="num r" data-k="Qualifying volume">${esc(usd(w.total_qv_micro))}</td>
      <td class="num r" data-k="Issued">${esc(int(w.issued_points))} of ${esc(int(w.pool))}</td>
      <td class="num r" data-k="Gap blocks">${esc(int(w.gap_blocks))}</td>
      <td class="hash" title="${esc(w.table_sha256)}">${esc(String(w.table_sha256).slice(0, 12))}…</td></tr>`).join('')
      : stateRow('No week is published yet.');
  }).catch((e) => {
    weeks.innerHTML = stateRow(e.message === NOT_LIVE
      ? 'Not live yet. The archive does not serve points_weeks yet. Points still count from genesis, so no week is lost.'
      : DOWN);
  });

  const form = document.querySelector('[data-lookup]');
  const out = form.querySelector('[data-out]');
  const button = form.querySelector('button');
  const say = (text, bad) => { out.className = bad ? 'out bad' : 'out'; out.textContent = text; };
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const user = form.user.value.trim();
    const s = Number(form.season.value);
    if (!/^0x[0-9a-fA-F]{40}$/.test(user)) return say('Enter a 0x address with 40 hex characters.', true);
    say('Reading the archive…');
    button.disabled = true;
    info({ type: 'points_user', user: user.toLowerCase(), season: s }).then((d) => {
      const rows = d.weeks || [];
      if (!rows.length) return say(`No points for this address in Season ${s}. An excluded account reads the same as an account with no qualifying volume.`);
      const total = rows.reduce((a, w) => a + Math.trunc(Number(w.points_micro)), 0);
      out.className = 'out';
      out.innerHTML = `<div class="scroll"><table class="mine"><thead><tr><th>Week ending</th><th class="r">Raw</th><th class="r">Qualifying</th><th class="r">Points</th></tr></thead><tbody>${rows.map((w) => `<tr><td class="num">${esc(dayTxt(w.week_end_ts))}</td><td class="num r">${esc(usd(w.raw_micro))}</td><td class="num r">${esc(usd(w.qv_micro))}</td><td class="num r">${esc(pts(w.points_micro))}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Season ${s}, provisional</td><td class="num r">${esc(pts(total))}</td></tr></tfoot></table></div>`;
    }).catch((e) => {
      say(e.message === NOT_LIVE ? 'Not live yet. The archive does not serve points_user yet.' : DOWN, e.message !== NOT_LIVE);
    }).finally(() => { button.disabled = false; });
  });
})();
