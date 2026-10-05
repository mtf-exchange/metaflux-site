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
  const DOWN = 'The archive did not answer. Try again later.';
  // Only UNKNOWN_TYPE means "not live yet". Any other rejection shows its own text.
  const info = (body) => fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    .then(async (r) => {
      const j = await r.json().catch(() => null);
      if (r.ok && j && j.data) return j.data;
      const e = j && j.error;
      const msg = typeof e === 'string' ? e : (e && e.message) || '';
      if ((e && e.code === 'UNKNOWN_TYPE') || msg.startsWith('unknown info type')) throw new Error(NOT_LIVE);
      throw new Error(msg ? `The archive refused the read: ${msg}` : DOWN);
    });
  const why = (e) => (e instanceof TypeError ? DOWN : e.message);
  const dayTxt = (t) => { const d = new Date(Number(t)); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  const usd = (v) => '$' + Math.trunc(Number(v)).toLocaleString('en-US');
  const pts = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });
  const micro = (v) => Math.round(Number(v) * 1e6);
  const int = (v) => Number(v).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const short = (a) => `${String(a).slice(0, 6)}…${String(a).slice(-4)}`;
  const millionths = (v) => { const [a, b = ''] = String(v).split('.'); return String(BigInt(a + (b + '000000').slice(0, 6))); };
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const stateRow = (text) => `<tr class="st"><td colspan="6">${esc(text)}</td></tr>`;

  // The lines that table_sha256 covers: address,raw,qv,points in millionths, sorted by address.
  async function table(w) {
    const lines = [];
    for (let offset = 0; ; offset += 1000) {
      const page = (await info({ type: 'points_leaderboard', season: w.season, week: w.week, offset })).rows || [];
      for (const r of page) lines.push(`${r.address},${millionths(r.raw_volume)},${millionths(r.qualifying_volume)},${millionths(r.points)}\n`);
      if (page.length < 1000) return lines.sort().join('');
    }
  }

  const weeks = document.querySelector('[data-weeks]');
  info({ type: 'points_weeks' }).then((d) => {
    const rows = d.rows || [];
    if (!rows.length) { weeks.innerHTML = stateRow('No week is published yet.'); return; }
    weeks.innerHTML = rows.map((w, i) => {
      const row = `<tr>
      <td class="num">${esc(dayTxt(w.week_end))}</td>
      <td class="num" data-k="Season">${esc(w.season)}</td>
      <td class="num r" data-k="Qualifying volume">${esc(usd(w.total_qualifying_volume))}</td>
      <td class="num r" data-k="Issued">${esc(pts(w.issued_points))} of ${esc(pts(w.pool))}</td>
      <td class="num r" data-k="Gap blocks">${esc(int(w.gap_blocks))}</td>
      <td class="hash"><span class="h" title="${esc(w.table_sha256)}">${esc(w.table_sha256)}</span><button type="button" class="save" data-i="${i}">Download</button></td></tr>`;
      if (rows[i + 1] && rows[i + 1].season === w.season) return row;
      const season = rows.filter((x) => x.season === w.season);
      const sum = (k) => season.reduce((a, x) => a + micro(x[k]), 0) / 1e6;
      return row + `<tr class="sub"><td colspan="3">Season ${esc(w.season)}, ${season.length} published week${season.length === 1 ? '' : 's'}</td>
      <td class="num r" data-k="Issued">${esc(pts(sum('issued_points')))} of ${esc(pts(sum('pool')))}</td><td colspan="2"></td></tr>`;
    }).join('');
    weeks.addEventListener('click', async (ev) => {
      const b = ev.target.closest('button.save');
      if (!b) return;
      const w = rows[b.dataset.i];
      b.disabled = true;
      b.title = '';
      b.textContent = 'Reading…';
      try {
        const text = await table(w);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
        a.download = `points-week-${w.week}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 60000);
        const got = crypto.subtle ? hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))) : '';
        const out = document.createElement('span');
        out.className = got && got !== w.table_sha256 ? 'saved bad' : 'saved';
        out.textContent = !got ? 'Saved' : got === w.table_sha256 ? 'Saved. The hash matches.' : 'Saved. The hash does not match.';
        b.replaceWith(out);
        return;
      } catch (e) {
        b.textContent = 'Not read. Try again.';
        b.title = e.message === NOT_LIVE ? 'The archive does not serve points_leaderboard yet.' : why(e);
      } finally {
        b.disabled = false;
      }
    });
  }).catch((e) => {
    weeks.innerHTML = stateRow(e.message === NOT_LIVE
      ? 'Not live yet. The archive does not serve points_weeks yet. Points still count from genesis, so no week is lost.'
      : why(e));
  });

  const form = document.querySelector('[data-lookup]');
  const out = form.querySelector('[data-out]');
  const button = form.querySelector('button');
  const say = (text, bad) => { out.className = bad ? 'out bad' : 'out'; out.textContent = text; };
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const address = form.address.value.trim().toLowerCase();
    const s = Number(form.season.value);
    if (!/^0x[0-9a-f]{40}$/.test(address)) return say('Enter a 0x address with 40 hex characters.', true);
    say('Reading the archive…');
    button.disabled = true;
    info({ type: 'points_user', address, season: s }).then((d) => {
      const rows = d.rows || [];
      if (!rows.length) return say(`Nothing is published for this address in Season ${s}. This has three causes: the account has no raw volume, no week is published yet, or the account is excluded.`);
      const total = rows.reduce((a, w) => a + micro(w.points), 0) / 1e6;
      const as = d.root && d.root !== address ? `<p title="${esc(d.root)}">The root account ${esc(short(d.root))} earns for this address.</p>` : '';
      out.className = 'out';
      out.innerHTML = `<div class="scroll"><table class="mine"><thead><tr><th>Week ending</th><th class="r">Raw</th><th class="r">Qualifying</th><th class="r">Points</th></tr></thead><tbody>${rows.map((w) => `<tr><td class="num">${esc(dayTxt(w.week_end))}</td><td class="num r">${esc(usd(w.raw_volume))}</td><td class="num r">${esc(usd(w.qualifying_volume))}</td><td class="num r">${esc(pts(w.points))}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Season ${s}, provisional</td><td class="num r">${esc(pts(total))}</td></tr></tfoot></table></div>${as}`;
    }).catch((e) => {
      say(e.message === NOT_LIVE ? 'Not live yet. The archive does not serve points_user yet.' : why(e), e.message !== NOT_LIVE);
    }).finally(() => { button.disabled = false; });
  });
})();
