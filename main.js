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

// Close mobile menu on link click
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
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ═══════════════════════════════════════════
   CONTACT FORM — placeholder submit
═══════════════════════════════════════════ */
const form = document.getElementById('contactForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = '¡Mensaje enviado!';
  btn.style.background = 'var(--clr-green)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Enviar mensaje';
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
