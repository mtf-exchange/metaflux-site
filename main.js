// TOC scroll-spy — the one script the site still runs.
//
// Loaded by whitepaper.html (where the .toc lives) and by the legal pages
// (where it no-ops). Highlights the table-of-contents link for the section
// currently in view; redesign.css styles the .active state. index.html loads
// no JavaScript at all — its preloader is pure CSS.

(() => {
  const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
  if (!tocLinks.length) return;
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
})();
