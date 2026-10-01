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

// FAQ accordion
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    document.querySelectorAll('.faq-btn').forEach(b => b.setAttribute('aria-expanded', String(b.closest('.faq-item').classList.contains('open'))));
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

// Testimonials carousel (auto-rotate, pause on hover)
(function(){
  const c = document.querySelector('[data-testi]'); if (!c) return;
  const track = c.querySelector('.testi-track');
  const slides = [...c.querySelectorAll('.testi-slide')];
  const dots = [...c.querySelectorAll('.testi-dot')];
  if (slides.length < 2) return;
  let i = 0, timer = null;
  const go = n => {
    i = (n + slides.length) % slides.length;
    track.style.setProperty('--slide', i);
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => { stop(); if (!reduce) timer = setInterval(() => go(i + 1), 6000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
  c.addEventListener('mouseenter', stop);
  c.addEventListener('mouseleave', start);
  start();
})();
