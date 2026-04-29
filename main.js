/* ═══════════════════════════════════════════
   PAGE BACKGROUND — crossfade by timeline item
═══════════════════════════════════════════ */
const BG_IMAGES = {
  epo:       'https://commons.wikimedia.org/wiki/Special:FilePath/European_Patent_Office_Munich.jpg',
  freelance: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1920&q=80',
  demesix:   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1920&q=80',
  galvintec: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=80',
  hackaboss: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1920&q=80',
  daw:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80',
  dam:       'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
};

const bgLayerA   = document.getElementById('pageBgA');
const bgLayerB   = document.getElementById('pageBgB');
let   _bgFront   = 'A';
let   _bgCurrent = null;

function updateBackground(itemId) {
  if (!itemId || itemId === _bgCurrent) return;
  _bgCurrent = itemId;
  const url = BG_IMAGES[itemId];
  if (!url) return;

  const next = _bgFront === 'A' ? bgLayerB : bgLayerA;
  const prev = _bgFront === 'A' ? bgLayerA : bgLayerB;

  next.style.backgroundImage = `url("${url}")`;
  requestAnimationFrame(() => {
    next.classList.add('is-visible');
    prev.classList.remove('is-visible');
  });
  _bgFront = _bgFront === 'A' ? 'B' : 'A';
}

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

let currentT = {};  // traducciones activas, accesibles por el popup

async function applyLang(lang) {
  const t = await loadLocale(lang);
  currentT = t;

  // Texto de nodos
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = get(t, el.dataset.i18n);
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = get(t, el.dataset.i18nPlaceholder);
  });

  // Aria labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', get(t, el.dataset.i18nAria));
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
    const endSize = 36;

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

    // Ajuste de font-size de las iniciales
    const inner    = floatingAv.querySelector('.floating-avatar__inner');
    const photo    = floatingAv.querySelector('.floating-avatar__photo');
    const initials = floatingAv.querySelector('.floating-avatar__initials');
    if (inner)    inner.style.fontSize    = Math.max(size * 0.32, 10) + 'px';
    // Cross-fade: foto desaparece, iniciales aparecen
    if (photo)    photo.style.opacity    = 1 - p;
    if (initials) initials.style.opacity = p;
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
      { label: 'Video Production', type: 'av', items: [
        { name: 'Panasonic AV-UHS5M', desc: '4K Live Switcher for multi-source broadcast production' },
        { name: 'Panasonic AW-RP150', desc: 'PTZ camera controller — joystick-based pan/tilt/zoom for live events' },
      ]},
      { label: 'Control & Conference', type: 'av', items: [
        { name: 'Crestron',        desc: 'AV automation & custom touchpanel control (TSW series)' },
        { name: 'Neat / Cisco',    desc: 'Webex-native video conferencing endpoints (Neat Bar, Neat Bar Pro, Neat Center) — managed via NeatPulse' },
        { name: 'Televic Plixus',  desc: 'Conference microphone & simultaneous translation network system' },
      ]},
      { label: 'Audio', type: 'av', items: [
        { name: 'Allen & Heath SQ-6', desc: '48-channel digital mixer for live audio, EQ and translation routing' },
        { name: 'Biamp Tesira',       desc: 'DSP audio processor — integrated via Crestron touchpanel' },
      ]},
      { label: 'Management', type: 'av', items: [
        { name: 'NeatPulse',  desc: 'Cloud-based device management platform for Neat/Cisco endpoints' },
        { name: 'KVM Switch', desc: 'Multi-system keyboard/video/mouse switching for translation booths' },
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
  updateBackground(activeItem ? activeItem.dataset.tools : null);
}

window.addEventListener('scroll', updateTimeline, { passive: true });
updateTimeline();

/* ═══════════════════════════════════════════
   STACK POPUP — descripción al hacer click
═══════════════════════════════════════════ */
// Nombre e icono fijos (igual en todos los idiomas)
// La descripción se lee de currentT.stack[key] en el idioma activo
const TECH_INFO = {
  html5:        { name: 'HTML5',          icon: 'devicon-html5-plain colored'         },
  css3:         { name: 'CSS3',           icon: 'devicon-css3-plain colored'          },
  javascript:   { name: 'JavaScript',     icon: 'devicon-javascript-plain colored'    },
  typescript:   { name: 'TypeScript',     icon: 'devicon-typescript-plain colored'    },
  angular:      { name: 'Angular',        icon: 'devicon-angular-plain colored'       },
  react:        { name: 'React',          icon: 'devicon-react-original colored'      },
  reactnative:  { name: 'React Native',   icon: 'devicon-react-original colored'      },
  redux:        { name: 'Redux',          icon: 'devicon-redux-original colored'      },
  nodejs:       { name: 'Node.js',        icon: 'devicon-nodejs-plain colored'        },
  java:         { name: 'Java',           icon: 'devicon-java-plain colored'          },
  php:          { name: 'PHP',            icon: 'devicon-php-plain colored'           },
  laravel:      { name: 'Laravel',        icon: 'devicon-laravel-plain colored'       },
  androidstudio:{ name: 'Android Studio', icon: 'devicon-androidstudio-plain colored' },
  python:       { name: 'Python',         icon: 'devicon-python-plain colored'        },
  numpy:        { name: 'NumPy',          icon: 'devicon-numpy-plain colored'         },
  pandas:       { name: 'Pandas',         icon: 'devicon-pandas-plain colored'        },
  matplotlib:   { name: 'Matplotlib',     icon: 'devicon-matplotlib-plain colored'    },
  scikitlearn:  { name: 'Scikit-learn',   icon: 'devicon-scikitlearn-plain colored'   },
  tensorflow:   { name: 'TensorFlow',     icon: 'devicon-tensorflow-original colored' },
  keras:        { name: 'Keras',          icon: 'devicon-keras-plain colored'         },
  mysql:        { name: 'MySQL',          icon: 'devicon-mysql-plain colored'         },
  mariadb:      { name: 'MariaDB',        icon: 'devicon-mariadb-plain colored'       },
  git:          { name: 'Git',            icon: 'devicon-git-plain colored'           },
};

(function () {
  const popup     = document.getElementById('techPopup');
  const popupIcon = document.getElementById('techPopupIcon');
  const popupName = document.getElementById('techPopupName');
  const popupDesc = document.getElementById('techPopupDesc');
  const closeBtn  = document.getElementById('techPopupClose');

  function showPopup(techKey) {
    const info = TECH_INFO[techKey];
    if (!info) return;
    popupIcon.className = info.icon;
    popupName.textContent = info.name;
    popupDesc.textContent = get(currentT, 'stack.' + techKey);
    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add('is-visible'));
  }

  function hidePopup() {
    popup.classList.remove('is-visible');
    popup.addEventListener('transitionend', () => { popup.hidden = true; }, { once: true });
  }

  // Delegación en el grid completo
  document.querySelectorAll('.stack-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const key = item.dataset.tech;
      if (popup.classList.contains('is-visible') && popupName.textContent === (TECH_INFO[key]?.name)) {
        hidePopup();
      } else {
        showPopup(key);
      }
    });
  });

  closeBtn.addEventListener('click', e => { e.stopPropagation(); hidePopup(); });
  document.addEventListener('click', () => { if (!popup.hidden) hidePopup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePopup(); });
})();

/* ═══════════════════════════════════════════
   INIT — cargar idioma guardado o español
═══════════════════════════════════════════ */
applyLang(localStorage.getItem('lang') || 'es');
