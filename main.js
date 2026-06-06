// Light interactions.
//
// 1. Updates --scroll-y on scroll for any CSS that wants a parallax cue.
// 2. Adds `scrolled` class to nav once the hero scrolls past, so the glass
//    bar tightens slightly. Pure aesthetic.
// 3. Typewriter effect on `.typewriter` elements. Cycles through a list of
//    phrases sourced from `data-phrases` (pipe-separated). Respects
//    prefers-reduced-motion (renders the first phrase static, no animation).

(() => {
  const root = document.documentElement;
  const nav = document.querySelector('nav');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── preloader (entrance) ─────────────────────────────────────────
  // Full-screen mark climb-on, then fade the overlay. Holds long enough
  // for the animation to read, but never traps the page (failsafe in head
  // for no-JS). Reduced-motion users get a near-instant dismiss.
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hold = reduce ? 150 : 1500;
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 800);
    };
    if (document.readyState === 'complete') {
      setTimeout(dismiss, hold);
    } else {
      window.addEventListener('load', () => setTimeout(dismiss, hold), { once: true });
    }
    setTimeout(dismiss, 4000); // ceiling: never trap the page if load stalls
  }

  // ── architecture diagram: assemble bottom-up on scroll into view ─
  const archFig = document.querySelector('.arch-figure');
  if (archFig && !reduce) {
    archFig.classList.add('anim');
    const archIo = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { archFig.classList.add('in'); obs.disconnect(); }
      });
    }, { threshold: 0.25 });
    archIo.observe(archFig);
  }

  // ── scroll signal ────────────────────────────────────────────────
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (!reduce) root.style.setProperty('--scroll-y', y + 'px');
      if (nav) nav.classList.toggle('scrolled', y > 80);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── typewriter ───────────────────────────────────────────────────
  // Each element:  <span class="typewriter" data-phrases="a|b|c">a</span>
  //   - `data-phrases` is pipe-separated; first phrase is the static fallback.
  //   - Optional `data-cps` (chars per second; default 22 typing, 40 deleting).
  //   - Optional `data-pause` (ms paused after a phrase fully typed; default 1600).
  document.querySelectorAll('.typewriter').forEach((el) => {
    const phrases = (el.dataset.phrases || el.textContent || '').split('|').map(s => s.trim()).filter(Boolean);
    if (phrases.length === 0) return;
    if (reduce || phrases.length === 1) {
      el.textContent = phrases[0];
      return;
    }
    const typeMs = 1000 / parseInt(el.dataset.cps || '22', 10);
    const delMs  = 1000 / parseInt(el.dataset.cpsDel || '40', 10);
    const pauseMs = parseInt(el.dataset.pause || '1600', 10);

    let i = 0;     // phrase index
    let j = 0;     // char index
    let mode = 'typing'; // 'typing' | 'pausing' | 'deleting'

    const tick = () => {
      const p = phrases[i];
      if (mode === 'typing') {
        j++;
        el.textContent = p.slice(0, j);
        if (j >= p.length) {
          mode = 'pausing';
          setTimeout(tick, pauseMs);
          return;
        }
        setTimeout(tick, typeMs);
      } else if (mode === 'pausing') {
        mode = 'deleting';
        setTimeout(tick, delMs);
      } else {
        j--;
        el.textContent = p.slice(0, Math.max(0, j));
        if (j <= 0) {
          mode = 'typing';
          i = (i + 1) % phrases.length;
        }
        setTimeout(tick, delMs);
      }
    };
    el.textContent = '';
    setTimeout(tick, 400);
  });

  // ── TOC scroll-spy (whitepaper page only) ────────────────────────
  // Highlights the table-of-contents link for the section currently in
  // view. No-op on pages without a `.toc`.
  const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
  if (tocLinks.length) {
    const byId = new Map();
    tocLinks.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) byId.set(target, a);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove('active'));
        const link = byId.get(entry.target);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    byId.forEach((_, target) => spy.observe(target));
  }
})();
