// The TGE page's one script: the live week and countdown from the reader's
// clock, the stone and its band marker, and the points reads from the testnet
// archive. No library.
(() => {
  const { GENESIS, W1_END, TGE, seasons } = JSON.parse(document.getElementById('pts-cfg').textContent);
  const API = 'https://api.testnet.mtf.exchange/info';
  const WEEK = 7 * 86400000;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const now = Date.now();
  const current = [...seasons].reverse().find((s) => now >= s.start);
  const next = seasons.find((s) => now < s.start);
  const status = (s) => (s === current ? 'In progress' : now >= s.start ? 'Closed' : s.n === 4 ? 'Last' : s === next ? 'Next' : 'Later');

  const pad = (v) => String(v).padStart(2, '0');
  const digits = [...document.querySelectorAll('[data-cd]')];
  const tick = () => {
    const t = Date.now();
    const n = t < W1_END ? 1 : Math.floor((t - W1_END) / WEEK) + 2;
    const cut = new Date(W1_END + (n - 1) * WEEK);
    const cur = [...seasons].reverse().find((s) => t >= s.start);
    if (!cur) return;
    // n counts from week 1 of Season 1; every later season starts on a cut, so it restarts at week 1.
    const wk = cur.start > W1_END ? n - Math.round((cur.start - W1_END) / WEEK) - 1 : n;
    document.querySelectorAll('[data-week]').forEach((el) => { el.textContent = `Week ${wk} · Season ${cur.n}, ${cur.name}`; });
    document.querySelectorAll('[data-cut]').forEach((el) => { el.textContent = `Cuts ${DOW[cut.getUTCDay()]} ${cut.getUTCDate()} ${MON[cut.getUTCMonth()]}, 00:00 UTC`; });
    const d = Math.max(0, cut - t);
    const v = { d: Math.floor(d / 864e5), h: pad(Math.floor(d / 36e5) % 24), m: pad(Math.floor(d / 6e4) % 60), s: pad(Math.floor(d / 1e3) % 60) };
    digits.forEach((el) => { el.textContent = v[el.dataset.cd]; el.closest('[hidden]')?.removeAttribute('hidden'); });
  };
  tick();
  setInterval(tick, 1000);

  seasons.forEach((s) => {
    const el = document.querySelector(`[data-status="${s.n}"]`);
    if (el) {
      el.textContent = status(s);
      el.closest('tr').classList.toggle('is-now', s === current);
    }
    document.querySelector(`[data-seg="${s.n}"]`)?.classList.toggle('is-now', s === current);
  });
  const sel = document.getElementById('season');
  if (current && sel) sel.value = String(current.n);

  const f = Math.min(Math.max((now - GENESIS) / (TGE - GENESIS), 0), 1);
  document.querySelectorAll('svg.band').forEach((svg) => {
    const span = Number(svg.dataset.span) || 1;
    let p;
    try { const path = svg.querySelector('#rs-track'); p = path.getPointAtLength(f * span * path.getTotalLength()); } catch { return; }
    svg.querySelector('.lit-mask').setAttribute('stroke-dasharray', `${(f * span * 1000).toFixed(1)} 1000`);
    svg.querySelector('.now').setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  });

  const box = document.querySelector('.slab-box');
  const cv = box && box.querySelector('canvas');
  if (cv && cv.getContext && window.Path2D) {
    const svg = box.querySelector('svg.band');
    const slab = new Path2D(svg.querySelector('#rs-slab').getAttribute('d'));
    const band = new Path2D(svg.querySelector('#rs-track').getAttribute('d'));
    const ends = new Path2D([...svg.querySelectorAll('.end')].map((e) => e.getAttribute('d')).join(''));
    const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
    const noise = (x, y) => {
      const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j;
      const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
      const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
      return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
    };
    const draw = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), k = w / 600;
      // One offscreen pass marks inside (red), rim (green) and the cut band (blue), so each dot is a pixel read.
      const m = document.createElement('canvas');
      m.width = w; m.height = h;
      const mc = m.getContext('2d');
      mc.setTransform(k, 0, 0, k, 0, 0);
      mc.globalCompositeOperation = 'lighter';
      mc.fillStyle = '#f00'; mc.fill(slab);
      mc.strokeStyle = '#0f0'; mc.lineWidth = 10; mc.stroke(slab);
      mc.strokeStyle = '#00f'; mc.lineWidth = 60; mc.stroke(band);
      mc.fillStyle = '#00f'; mc.fill(ends);
      mc.lineWidth = 10; mc.stroke(ends);
      const px = mc.getImageData(0, 0, w, h).data;

      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#f3f4f6';
      const S = 5;
      for (let gy = 0; gy * S < h; gy++) for (let gx = 0; gx * S < w; gx++) {
        const x = gx * S + 1 + hash(gx, gy) * 3, y = gy * S + 1 + hash(gy, gx) * 3;
        if (x >= w || y >= h) continue;
        const i = (Math.floor(y) * w + Math.floor(x)) * 4;
        if (px[i] < 128 || px[i + 2] > 96) continue;
        let a = (0.12 + 0.36 * noise(x / 26, y / 26)) * (1 - 0.4 * (y / h));
        if (px[i + 1] > 128) a = Math.max(a, 0.6);
        if (hash(gx + 0.5, gy) > 0.985) a = 0.85;
        ctx.globalAlpha = a;
        ctx.fillRect(x - 0.65, y - 0.65, 1.3, 1.3);
      }
    };
    let queued = false;
    const redraw = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(); }); } };
    draw();
    if (window.ResizeObserver) new ResizeObserver(redraw).observe(box);
  }

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
