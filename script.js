const select = (selector, root = document) => root.querySelector(selector);

function initNavigation() {
  const toggle = select('.menu-toggle');
  const menu = select('#mobile-menu');
  if (!toggle || !menu) return;
  const close = ({ restoreFocus = false } = {}) => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Открыть меню'); menu.hidden = true; if (restoreFocus) toggle.focus(); };
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); menu.hidden = !open; });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close({ restoreFocus: true }); });
}

function initCookieConsent() {
  const banner = select('[data-cookie-banner]');
  if (!banner) return;
  if (localStorage.getItem('cookie-consent') === 'accepted') banner.hidden = true;
  select('button', banner)?.addEventListener('click', () => { localStorage.setItem('cookie-consent', 'accepted'); banner.hidden = true; });
}

function initScrollReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elements = document.querySelectorAll('.reveal');
  const staggeredItems = '.payment-grid > *, .benefit-grid > *, .family-grid > *, .condition-grid > *, .support-grid > *, .document-grid > *';
  elements.forEach(section => section.querySelectorAll(staggeredItems).forEach((item, index) => {
    item.classList.add('reveal-item');
    item.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 65}ms`);
  }));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  elements.forEach(element => observer.observe(element));
}

document.addEventListener('DOMContentLoaded', () => { initNavigation(); initCookieConsent(); initScrollReveal(); });
