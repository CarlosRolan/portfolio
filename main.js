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
   SKILLS PANEL — panel dinámico izquierdo
═══════════════════════════════════════════ */
const DEVICONS = {
  html5:        { cls: 'devicon-html5-plain colored',          tip: 'HTML5' },
  css3:         { cls: 'devicon-css3-plain colored',           tip: 'CSS3' },
  javascript:   { cls: 'devicon-javascript-plain colored',     tip: 'JavaScript' },
  typescript:   { cls: 'devicon-typescript-plain colored',     tip: 'TypeScript' },
  angular:      { cls: 'devicon-angular-plain colored',        tip: 'Angular' },
  react:        { cls: 'devicon-react-original colored',       tip: 'React' },
  reactnative:  { cls: 'devicon-react-original colored',       tip: 'React Native' },
  redux:        { cls: 'devicon-redux-original colored',       tip: 'Redux' },
  nodejs:       { cls: 'devicon-nodejs-plain colored',         tip: 'Node.js' },
  java:         { cls: 'devicon-java-plain colored',           tip: 'Java' },
  php:          { cls: 'devicon-php-plain colored',            tip: 'PHP' },
  laravel:      { cls: 'devicon-laravel-plain colored',        tip: 'Laravel' },
  androidstudio:{ cls: 'devicon-androidstudio-plain colored',  tip: 'Android Studio' },
  python:       { cls: 'devicon-python-plain colored',         tip: 'Python' },
  numpy:        { cls: 'devicon-numpy-plain colored',          tip: 'NumPy' },
  scikitlearn:  { cls: 'devicon-scikitlearn-plain colored',    tip: 'Scikit-learn' },
  matplotlib:   { cls: 'devicon-matplotlib-plain colored',     tip: 'Matplotlib' },
  pandas:       { cls: 'devicon-pandas-plain colored',         tip: 'Pandas' },
  tensorflow:   { cls: 'devicon-tensorflow-original colored',  tip: 'TensorFlow' },
  keras:        { cls: 'devicon-keras-plain colored',          tip: 'Keras' },
  mysql:        { cls: 'devicon-mysql-plain colored',          tip: 'MySQL' },
  mariadb:      { cls: 'devicon-mariadb-plain colored',        tip: 'MariaDB' },
  postgresql:   { cls: 'devicon-postgresql-plain colored',     tip: 'PostgreSQL' },
  git:          { cls: 'devicon-git-plain colored',            tip: 'Git' },
};

const TOOLS_MAP = {
  epo: {
    label: 'AV Stack',
    groups: [
      { label: 'Control & Conference', type: 'av', items: [
        { name: 'Crestron',       desc: 'AV automation & control platform' },
        { name: 'Televic Plixus', desc: 'Conference microphone network system' },
      ]},
      { label: 'Audio', type: 'av', items: [
        { name: 'Allen & Heath', desc: 'Professional live audio mixers' },
        { name: 'Plixus Engine', desc: 'Mic & translation channel management' },
      ]},
      { label: 'Infrastructure', type: 'av', items: [
        { name: 'KVM Switch',  desc: 'Multi-system keyboard/video/mouse switching' },
        { name: 'Web Control', desc: 'Remote control via AV web interfaces' },
      ]},
    ],
  },
  freelance: {
    label: 'Dev Stack',
    groups: [
      { label: 'Frontend', type: 'dev', items: ['javascript', 'typescript', 'react', 'html5', 'css3'] },
      { label: 'Backend',  type: 'dev', items: ['nodejs'] },
    ],
  },
  demesix: {
    label: 'Dev Stack',
    groups: [
      { label: 'Mobile', type: 'dev', items: ['java', 'androidstudio'] },
    ],
  },
  galvintec: {
    label: 'Dev Stack',
    groups: [
      { label: 'Web',    type: 'dev', items: ['angular', 'typescript'] },
      { label: 'Mobile', type: 'dev', items: ['reactnative'] },
    ],
  },
  hackaboss: {
    label: 'AI & Data Stack',
    groups: [
      { label: 'Data Science',  type: 'dev', items: ['python', 'numpy', 'pandas', 'matplotlib', 'scikitlearn'] },
      { label: 'Deep Learning', type: 'dev', items: ['tensorflow', 'keras'] },
    ],
  },
  daw: {
    label: 'Dev Stack',
    groups: [
      { label: 'Backend',  type: 'dev', items: ['php', 'laravel'] },
      { label: 'Database', type: 'dev', items: ['mysql'] },
      { label: 'Frontend', type: 'dev', items: ['html5', 'css3', 'javascript'] },
    ],
  },
  dam: {
    label: 'Dev Stack',
    groups: [
      { label: 'Frontend & Mobile', type: 'dev', items: ['angular', 'react', 'redux', 'reactnative'] },
      { label: 'Database & Tools',  type: 'dev', items: ['mysql', 'mariadb', 'androidstudio'] },
    ],
  },
};

let _currentToolsId = null;

function updateSkillsPanel(itemId) {
  if (itemId === _currentToolsId) return;
  _currentToolsId = itemId;

  const body = document.getElementById('skillsPanelBody');
  if (!body) return;

  const data = itemId && TOOLS_MAP[itemId];

  // Fade out → swap content → fade in
  body.style.opacity   = '0';
  body.style.transform = 'translateY(6px)';

  setTimeout(() => {
    if (!data) {
      body.innerHTML = '<p class="skills-panel__hint">↓ Scroll para ver el stack</p>';
    } else {
      let html = `<h3 class="skills-panel__title">${data.label}</h3>`;
      data.groups.forEach(g => {
        html += `<div class="skill-group"><p class="skill-group__label">${g.label}</p>`;
        if (g.type === 'av') {
          html += '<div class="av-grid">';
          g.items.forEach(it => {
            html += `<div class="av-chip" data-desc="${it.desc}">${it.name}</div>`;
          });
          html += '</div>';
        } else {
          html += '<div class="tech-grid">';
          g.items.forEach(key => {
            const ic = DEVICONS[key];
            if (ic) html += `<div class="tech-icon" data-tip="${ic.tip}"><i class="${ic.cls}"></i></div>`;
          });
          html += '</div>';
        }
        html += '</div>';
      });
      body.innerHTML = html;
    }
    body.style.opacity   = '1';
    body.style.transform = 'translateY(0)';
  }, 200);
}

/* ═══════════════════════════════════════════
   TIMELINE — scroll narrativo (list-view)

   Un solo item activo a la vez — el último cuyo top
   ha cruzado el 50 % de la ventana.
   La card se expande en flujo normal (sin sticky),
   empujando hacia abajo los items siguientes.
═══════════════════════════════════════════ */
function updateTimeline() {
  const items    = document.querySelectorAll('.timeline__item');
  const triggerY = window.innerHeight * 0.5; // mitad de la ventana

  // El item activo es el último cuyo top ya pasó triggerY
  let activeItem = null;
  items.forEach(item => {
    if (item.getBoundingClientRect().top <= triggerY) activeItem = item;
  });

  items.forEach(item => {
    const card    = item.querySelector('.timeline__card');
    const isActive = item === activeItem;
    item.classList.toggle('is-active', isActive);
    card.classList.toggle('is-expanded', isActive);
  });

  updateSkillsPanel(activeItem ? activeItem.dataset.tools : null);
}

window.addEventListener('scroll', updateTimeline, { passive: true });
updateTimeline();

/* ═══════════════════════════════════════════
   INIT — cargar idioma guardado o español
═══════════════════════════════════════════ */
applyLang(localStorage.getItem('lang') || 'es');
