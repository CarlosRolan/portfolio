/* ═══════════════════════════════════════════
   i18n — carga de JSON y aplicación al DOM
═══════════════════════════════════════════ */
const cache = {};

async function loadLocale(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch(`locales/${lang}.json`);
  cache[lang] = await res.json();
  return cache[lang];
}

function get(obj, path) {
  return path.split('.').reduce((acc, k) => acc?.[k], obj) ?? '';
}

async function applyLang(lang) {
  const t = await loadLocale(lang);

  // Texto de nodos
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = get(t, el.dataset.i18n);
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = get(t, el.dataset.i18nPlaceholder);
  });

  // Atributo lang del <html>
  document.documentElement.lang = lang;

  // Guardar preferencia
  localStorage.setItem('lang', lang);

  // Botones activos
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/* ═══════════════════════════════════════════
   FLOATING AVATAR — scroll-to-corner
═══════════════════════════════════════════ */
(function () {
  const floatingAv  = document.getElementById('floatingAvatar');
  const heroAvEl    = document.querySelector('.hero__avatar');
  const heroSection = document.getElementById('inicio');
  const navLogo     = document.querySelector('.nav__logo');

  function updateAvatar() {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    // El avatar aparece cuando el hero sale de la vista
    const visible = heroBottom < 80;

    floatingAv.classList.toggle('floating-avatar--visible', visible);
    navLogo.style.opacity    = visible ? '0' : '1';
    heroAvEl.style.opacity   = visible ? '0' : '1';
  }

  window.addEventListener('scroll', updateAvatar, { passive: true });
  updateAvatar();
})();

/* ═══════════════════════════════════════════
   NAV — scroll + active link + burger
═══════════════════════════════════════════ */
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const links  = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveLink();
});

burger.addEventListener('click', () => {
  links.classList.toggle('open');
});

document.querySelectorAll('.nav__links a').forEach(a => {
  a.addEventListener('click', () => links.classList.remove('open'));
});

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h   = sec.offsetHeight;
    const id  = sec.getAttribute('id');
    const a   = document.querySelector(`.nav__links a[href="#${id}"]`);
    if (a) a.classList.toggle('active', scrollY >= top && scrollY < top + h);
  });
}

/* ═══════════════════════════════════════════
   LANG SWITCHER
═══════════════════════════════════════════ */
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

/* ═══════════════════════════════════════════
   PROJECT FILTER
═══════════════════════════════════════════ */
const filterBtns = document.querySelectorAll('.filter-btn');
const cards      = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

/* ═══════════════════════════════════════════
   CONTACT FORM — placeholder submit
═══════════════════════════════════════════ */
const form = document.getElementById('contactForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn  = form.querySelector('button[type="submit"]');
  const lang = localStorage.getItem('lang') || 'es';
  const t    = await loadLocale(lang);
  btn.textContent    = get(t, 'contact.submit_ok');
  btn.style.background = 'var(--clr-green)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent    = get(t, 'contact.submit');
    btn.style.background = '';
    btn.disabled = false;
    form.reset();
  }, 3000);
});

/* ═══════════════════════════════════════════
   INTERSECTION OBSERVER — fade-in on scroll
═══════════════════════════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.project-card, .timeline__card, .contact__form, .skills-panel')
  .forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

/* ═══════════════════════════════════════════
   INIT — cargar idioma guardado o español
═══════════════════════════════════════════ */
applyLang(localStorage.getItem('lang') || 'es');
