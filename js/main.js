// Logo fallback: show the text wordmark if the SVG fails to load
document.querySelectorAll('img[data-fallback]').forEach(img => {
  const showFallback = () => {
    img.hidden = true;
    img.nextElementSibling.hidden = false;
  };
  img.addEventListener('error', showFallback);
  if (img.complete && img.naturalWidth === 0) showFallback();
});

// Nav: transparent over hero → solid on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('solid', window.scrollY > 60);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile / tablet menu (hamburger)
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  const desktop = window.matchMedia('(min-width: 1025px)');
  const inertTargets = document.querySelectorAll('main, footer, .skip-link');
  const setMenu = open => {
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    inertTargets.forEach(el => { el.inert = open; });
  };
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  navMenu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (!nav.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { setMenu(false); navToggle.focus(); return; }
    if (e.key !== 'Tab') return;
    // keep keyboard focus inside the open menu
    const f = [...nav.querySelectorAll('a, button')];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });
  desktop.addEventListener('change', e => { if (e.matches) setMenu(false); });
}

// FAQ accordion (one open at a time, state exposed to assistive tech)
const faqItems = [...document.querySelectorAll('.faq-item')];
const setFaq = (item, open) => {
  item.classList.toggle('open', open);
  item.querySelector('.faq-btn').setAttribute('aria-expanded', String(open));
};
faqItems.forEach((item, n) => {
  const btn = item.querySelector('.faq-btn');
  const panel = item.querySelector('.faq-ans-wrap');
  panel.id = panel.id || 'faq-panel-' + n;
  panel.setAttribute('role', 'region');
  btn.setAttribute('aria-controls', panel.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    faqItems.forEach(i => setFaq(i, false));
    setFaq(item, willOpen);
  });
});

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal (fade-up, directional, image wipe)
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .img-reveal')
  .forEach(el => { if (!el.classList.contains('in')) io.observe(el); });

// Count-up numbers
function runCount(el) {
  if (el.dataset.done) return; el.dataset.done = '1';
  const to = parseFloat(el.dataset.to) || 0;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const all = el.dataset.accent === 'all';
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const render = v => el.innerHTML = all
    ? '<span>' + prefix + fmt(v) + suffix + '</span>'
    : prefix + fmt(v) + '<span>' + suffix + '</span>';
  if (reduce) { render(to); return; }
  const dur = 1700, t0 = performance.now();
  (function frame(now) {
    const p = Math.min(1, (now - t0) / dur);
    render(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); countIO.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.count').forEach(el => countIO.observe(el));

// Subtle parallax
const pxEls = document.querySelectorAll('[data-parallax]');
if (pxEls.length && !reduce) {
  let ticking = false;
  const apply = () => {
    const y = window.scrollY;
    pxEls.forEach(el => {
      const s = parseFloat(el.dataset.parallax) || 0.12;
      el.style.setProperty('--parallax-y', (y * s).toFixed(1) + 'px');
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  }, { passive: true });
  apply();
}

// Testimonials carousel: auto-rotate; pauses on hover, focus and hidden tabs; swipe + arrow keys
(function () {
  const c = document.querySelector('[data-testi]'); if (!c) return;
  const track = c.querySelector('.testi-track');
  const slides = [...c.querySelectorAll('.testi-slide')];
  const dots = [...c.querySelectorAll('.testi-dot')];
  if (slides.length < 2) return;
  let i = 0, timer = null;
  const viewport = c.querySelector('.testi-viewport');
  const fit = () => viewport.style.setProperty('--testi-h', slides[i].offsetHeight + 'px');
  const go = n => {
    i = (n + slides.length) % slides.length;
    track.style.setProperty('--slide', i);
    fit();
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === i);
      d.setAttribute('aria-current', String(k === i));
    });
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => { stop(); if (!reduce) timer = setInterval(() => go(i + 1), 6000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
  c.addEventListener('mouseenter', stop);
  c.addEventListener('mouseleave', start);
  c.addEventListener('focusin', stop);
  c.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  c.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
  });

  let x0 = null;
  c.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') x0 = e.clientX; });
  c.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); start(); }
  });
  window.addEventListener('resize', fit, { passive: true });
  if (document.fonts) document.fonts.ready.then(fit);
  go(0);
  start();
})();

// Magnetic buttons: a small pull toward the pointer (fine pointers only, skipped for reduced motion)
if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.setProperty('--mx', (dx * 8).toFixed(1) + 'px');
      btn.style.setProperty('--my', (dy * 6).toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.removeProperty('--mx');
      btn.style.removeProperty('--my');
    });
  });
}
