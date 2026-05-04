# Portfolio — Carlos Rolán Díaz

## Proyecto
Portfolio personal estático (HTML/CSS/JS puro, sin framework).
- **Deploy:** Vercel → `carlosrolan.vercel.app`
- **Rama de producción:** `main`
- **Rama de desarrollo:** `desarrollo`
- Siempre desarrollar en `desarrollo`, luego merge a `main` para desplegar.

---

## Estructura de archivos
```
portfolio/
├── index.html          # Toda la UI (una sola página)
├── styles.css          # Todos los estilos
├── main.js             # Toda la lógica JS
├── avatar.jpeg         # Foto de perfil (Carlos)
├── locales/
│   ├── es.json         # Español (idioma por defecto)
│   ├── en.json         # English
│   └── de.json         # Deutsch
└── CLAUDE.md           # Este fichero
```

---

## Sistema i18n
- `loadLocale(lang)` fetches `locales/{lang}.json` y cachea el resultado.
- `applyLang(lang)` actualiza el DOM:
  - `data-i18n="key.subkey"` → `el.textContent`
  - `data-i18n-placeholder="key.subkey"` → `el.placeholder`
  - `data-i18n-aria="key.subkey"` → `el.setAttribute('aria-label', ...)`
- `currentT` es la variable module-level con las traducciones activas (usada por el popup del stack).
- `get(obj, 'dot.notation.key')` para acceder a claves anidadas.
- **Regla:** todo texto visible debe estar en los 3 JSON. Nunca hardcodear texto en HTML.

---

## Secciones de la página (en orden)

### 1. Nav
- Logo: texto "Portfolio" (`.nav__logo`)
- Links: inicio / proyectos / experiencia / contacto
- Selector de idioma con banderas (flag-icon-css)
- Burger menu para móvil

### 2. Hero (`#inicio`)
- Avatar con foto (`avatar.jpeg`) dentro de `.avatar-ring` con animación `spin`
- **Floating avatar:** `#floatingAvatar` — burbuja que sigue el scroll desde el hero hasta la esquina del nav. Al llegar al nav muestra iniciales "CR" en lugar de la foto. CSS en `.floating-avatar`, lógica en `updateAvatar()` en main.js. `endSize` fijo a 36px.

### 3. Proyectos (`#proyectos`)
- Grid de 4 cards. Filtros: All / Web / Mobile / AI.
- **Bushy Labyrinth** (web): card real con descripción, highlights y tags con devicons.
- **Beta, Gamma, Delta:** placeholders — pendiente de rellenar con proyectos reales.
- Tags usan `.tag` con `display: inline-flex` para soportar `<i class="devicon-...">` + texto.
- i18n keys: `projects.bushy_title`, `bushy_desc`, `bushy_h1/h2/h3`.

### 4. Stack (`stack-section`)
- Grid CSS `repeat(auto-fill, minmax(110px, 1fr))` con 23 tecnologías.
- Animación `tech-float` escalonada (8 offsets via `nth-child(8n)`).
- Click → popup no bloqueante (`#techPopup`) con descripción desde `currentT['stack'][key]`.
- Los nombres de las tecnologías son los `data-tech` de cada `.stack-item`.

### 5. Experiencia (`#experiencia`)
- Layout de dos columnas: panel izquierdo dinámico + timeline derecho.
- **Timeline:** list-view model. `updateTimeline()` activa el último item cuyo `top ≤ 50vh`. No hay `position: sticky`.
- **Panel izquierdo (`#skillsPanel`):** muestra herramientas del item activo. `updateSkillsPanel(itemId)` lee `TOOLS_MAP[itemId]` y renderiza chips AV o devicons. Fade transition en el body.
- **Background dinámico:** `#pageBg` — dos capas CSS (A/B) con crossfade 1.6s. `updateBackground(itemId)` cambia `background-image` al hacer scroll. `.experience` tiene `background: transparent`. Las URLs están en `BG_IMAGES` al inicio de main.js.
- **Sección educación vs trabajo:** separadas por `.timeline__section-label`.

#### Timeline items (en orden):
| id | Empresa | Tipo |
|---|---|---|
| `epo` | European Patent Office · Munich | Trabajo (AV Technician, External Contractor) |
| `freelance` | Upwork / Fiverr | Trabajo (Full Stack Developer) |
| `demesix` | Demesix · Vigo | Trabajo (Full Stack Developer) |
| `galvintec` | Galvintec · Vigo | Trabajo (Full Stack Developer) |
| `hackaboss` | Hack a Boss | Educación (AI & Data Bootcamp) |
| `daw` | Campus Politécnico Aceimar | Educación (DAW) |
| `dam` | Campus Politécnico Aceimar | Educación (DAM) |

#### TOOLS_MAP (en main.js):
Cada item tiene `groups` con `{ label, type: 'av'|'dev', items }`.
- `type: 'av'` → chips de texto con nombre y descripción.
- `type: 'dev'` → devicons desde el mapa `DEVICONS`.

#### BG_IMAGES (en main.js, ~línea 15):
```js
const BG_IMAGES = {
  epo:       'https://commons.wikimedia.org/wiki/Special:FilePath/European_Patent_Office_Munich.jpg',
  freelance: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?...',
  demesix:   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?...',
  galvintec: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?...',
  hackaboss: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?...',
  daw:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?...',
  dam:       'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?...',
};
```
**Carlos tiene fotos propias del EPO que quiere subir para reemplazar estas URLs.**

### 6. Contacto (`#contacto`)
- Formulario con nombre, email, mensaje.
- **Pendiente:** conectar a EmailJS o Formspree para envío real.

### 7. Footer
- Copyright + links de navegación.

---

## CSS — variables clave
Definidas en `:root` al inicio de styles.css:
- `--clr-bg`, `--clr-surface`, `--clr-surface2` — fondos (dark theme)
- `--clr-accent` (#0ea5e9), `--clr-accent2` (#7c6bff) — colores de acento
- `--clr-muted`, `--clr-border` — textos secundarios y bordes
- `--font-head` (Space Grotesk), `--font-body` (Inter)
- `--radius` — border-radius general
- `--transition` — duración de transiciones

---

## CDNs usados
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/css/flag-icons.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
```
Google Fonts: Inter + Space Grotesk.

---

## Pendiente (por orden de prioridad)
1. **Fotos propias EPO** — Carlos las enviará. Guardar en raíz del proyecto y actualizar `BG_IMAGES` en main.js. Nombres sugeridos: `epo-1.jpg` (switcher Panasonic), `epo-2.jpg` (SQ-6), `epo-3.jpg` (Crestron touchpanel).
2. **Proyectos Beta/Gamma/Delta** — Rellenar con proyectos reales o añadir cards "coming soon". Candidatos discutidos: Gesture AV Controller (Python+TensorFlow+MediaPipe), Room Booking Manager (React+Node), app mobile propia.
3. **Formulario de contacto** — Conectar EmailJS o Formspree.
4. **og-image.jpg** — Crear imagen para preview de LinkedIn/redes.
5. **Proyecto Gesture AV Controller** — Python + TensorFlow/Keras + MediaPipe + OpenCV + Gradio (HuggingFace Spaces para demo). Carlos quiere construirlo para mostrar skills ML con aplicación AV real.

---

## Convenciones de desarrollo
- Todo texto visible → en los 3 JSON (nunca hardcodeado en HTML).
- Commits descriptivos en inglés.
- No crear archivos `.md` de documentación adicionales salvo este.
- Rama `desarrollo` para todo el trabajo, merge a `main` solo para desplegar.
