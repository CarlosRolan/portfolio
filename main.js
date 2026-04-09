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

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  // Captura posición absoluta del hero avatar (una vez, con scrollY=0)
  let heroDocCX, heroDocCY, heroSize;

  function captureHero() {
    const r    = heroAvEl.getBoundingClientRect();
    heroDocCX  = r.left + r.width  / 2 + window.scrollX;
    heroDocCY  = r.top  + r.height / 2 + window.scrollY;
    heroSize   = r.width;
    updateAvatar();
  }

  function updateAvatar() {
    if (!heroSize) return;

    const heroH    = heroSection.offsetHeight;
    const progress = Math.min(Math.max(window.scrollY / (heroH * 0.65), 0), 1);
    const p        = ease(progress);

    // Posición actual del hero en viewport (se mueve al hacer scroll)
    const startCX = heroDocCX - window.scrollX;
    const startCY = heroDocCY - window.scrollY;

    // Destino: centro del logo nav (siempre fijo en viewport)
    const nr   = navLogo.getBoundingClientRect();
    const endCX = nr.left + nr.width  / 2;
    const endCY = nr.top  + nr.height / 2;
    const endSize = nr.width;

    // Interpolar posición y tamaño
    const cx   = lerp(startCX, endCX,   p);
    const cy   = lerp(startCY, endCY,   p);
    const size = lerp(heroSize, endSize, p);

    floatingAv.style.left   = (cx - size / 2) + 'px';
    floatingAv.style.top    = (cy - size / 2) + 'px';
    floatingAv.style.width  = size + 'px';
    floatingAv.style.height = size + 'px';
    floatingAv.style.opacity = p > 0.01 ? '1' : '0';

    // Hero avatar se desvanece al salir
    heroAvEl.style.opacity  = 1 - p;
    // Nav logo CR desaparece cuando llega el avatar
    navLogo.style.opacity   = Math.max(1 - p * 6, 0);

    // Ajuste de font-size del placeholder CR
    const inner = floatingAv.querySelector('.floating-avatar__inner');
    if (inner) inner.style.fontSize = Math.max(size * 0.32, 10) + 'px';
  }

  window.addEventListener('load',   captureHero,    { once: true });
  window.addEventListener('resize', captureHero);
  window.addEventListener('scroll', updateAvatar,   { passive: true });
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

document.querySelectorAll('.project-card, .contact__form, .skills-panel')
  .forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

/* ═══════════════════════════════════════════
   TIMELINE — scroll narrativo

   Dos fases por item:
   1) La card se PEGA (sticky) cuando item.top < 20vh
      → el usuario ve el resumen un momento
   2) La card se EXPANDE cuando item.top < -120px
      → el item ha seguido scrolleando, la card
        lleva ya un rato visible y estable
   La card se CONTRAE cuando el item sale por arriba.
═══════════════════════════════════════════ */
function updateTimeline() {
  const stickyPoint = window.innerHeight * 0.20; // 20vh — donde la card se pega
  const expandDelay = 120;                        // px extra antes de expandir

  document.querySelectorAll('.timeline__item').forEach(item => {
    const rect = item.getBoundingClientRect();
    const card = item.querySelector('.timeline__card');

    // Fase 1 — card pega cuando rect.top < stickyPoint (20vh)
    // Fase 2 — card expande 120px después: rect.top < stickyPoint - expandDelay
    // Fase 3 — card contrae cuando el item casi ha salido
    const expandAt  = stickyPoint - expandDelay;          // e.g. ~40px
    const isExpanded = rect.top < expandAt && rect.bottom > stickyPoint + 200;

    card.classList.toggle('is-expanded', isExpanded);
  });
}

window.addEventListener('scroll', updateTimeline, { passive: true });
updateTimeline();

/* ═══════════════════════════════════════════
   INIT — cargar idioma guardado o español
═══════════════════════════════════════════ */
applyLang(localStorage.getItem('lang') || 'es');
