# estudio.d — Portfolio site

Portfolio de Diego Fabbri Arpon. Branding, identidad visual y diseño web.  
URL: [estudiod.site](https://estudiod.site)

---

## Stack

- HTML5 + CSS3 + Vanilla JavaScript — sin frameworks JS
- Bootstrap 5 — solo grid y utilidades (`.d-flex`, `.gap-2`, etc.). Muchas utilidades están reimplementadas nativamente en `styles.css` para reducir dependencia
- jQuery 2.2.4 — legacy, **no agregar más dependencias de jQuery**
- GSAP 3.12.5 — animaciones pixel hover, cargado desde CDN con SRI
- Vercel — hosting + analytics

---

## Estructura de archivos

```
public_html/
├── index.html                  # Página principal (portfolio)
├── project.html                # Página de proyecto individual
├── css/
│   └── styles.css              # Todos los estilos
├── js/
│   ├── translations.js         # Strings ES/EN + footer quotes + updateVersionLabel()
│   ├── brand-config.js         # Fetch de JSONs + buildBrandCreationItems()
│   ├── main.js                 # Lógica principal
│   ├── hover-gsap.js           # Animaciones pixel hover con GSAP
│   └── cursor.js               # Cursor personalizado (solo desktop)
├── brand-creation.json         # Datos de tiles — Brand Creation
├── brand-development.json      # Datos de tiles — Brand Development + galerías
├── product-design.json         # Datos de tiles — Product Design
├── img/
│   ├── backgrounds/            # Fondos de tiles (.webp, .mp4)
│   ├── logos/                  # Logos de clientes (.svg, .webp)
│   ├── visuals/                # Imágenes de galería por proyecto
│   └── new_visuals/            # Imágenes nuevas pendientes de integrar
├── fonts/                      # FG Futurist TRIAL (OTF, WOFF, WOFF2)
├── design-kit/                 # Design kit de Virtualmind (embebido via iframe)
├── admin/                      # Decap CMS (solo entorno test)
├── api/                        # Auth handlers para Decap CMS
└── vercel.json                 # Headers de seguridad (CSP, X-Frame-Options, etc.)
```

### Orden de carga de scripts en `index.html`

```html
<script src="js/translations.js" defer></script>   <!-- 1. currentLang, t(), translations -->
<script src="js/brand-config.js" defer></script>   <!-- 2. fetch JSONs, buildBrandCreationItems() -->
<script src="js/main.js" defer></script>           <!-- 3. render, tabs, tema, idioma -->
<script src="js/hover-gsap.js" defer></script>     <!-- 4. initGsapHovers() -->
<script src="js/cursor.js" defer></script>         <!-- 5. cursor gooey -->
```

El orden importa: `translations.js` define `currentLang` y `t()` que usan todos los demás.

---

## Ramas

| Rama | Base | Descripción |
|------|------|-------------|
| `main` | — | Producción estable |
| `test` | `main` | Rama de trabajo principal |
| `dev` | `test` | Desarrollo activo, en sync con `test` |
| `hybrid` | `main` | Experimento separado — **no mezclar con `test`/`dev`** |

**Nunca pushear directamente a `main`.**

### Flujo de trabajo

```bash
git checkout test

# hacer cambios...

git add <archivos>
git commit -m "descripción"
git push origin test

# pasar a dev
git checkout dev && git merge test && git push origin dev && git checkout test
```

---

## Arquitectura JS

### `translations.js`

Se carga primero. Define:

- `currentLang` — lee `localStorage.getItem('language')` o default `'en'`
- `APP_VERSION` — string de versión (ej. `"7.2"`)
- `translations` — objeto con claves `en` y `es`, cada una con los strings de la UI
- `t(key)` — helper que devuelve el string traducido para `currentLang`
- `updateVersionLabel()` — escribe `v7.2 — mes año` en `#version-label`
- `updateFooter(category, keepCurrent?)` — rota quotes del footer por tab
- `_footerQuotes` — pool de citas por categoría (`brand-creation`, `brand-development`, `product-design`)

Los strings se aplican en el HTML via atributos `data-i18n`. `switchLanguage()` en `main.js` los actualiza.

---

### `brand-config.js`

Hace `Promise.all` con tres `fetch()` en paralelo:

```
brand-creation.json   → brandCreationItems  → renderBrandCreationGrid() + addCol4Panels()
brand-development.json → brandDevItems      → renderBrandCreationGrid('brand-development-grid')
product-design.json   → brandPdItems        → renderProductDesignGrid()
```

Cuando termina llama `window.signalDataReady()`, que resuelve `dataReadyPromise` en `main.js` y dispara el reveal inicial.

**`buildBrandCreationItems(logos)`** — transforma los entries del JSON en objetos que `createBrandTile()` entiende:

- Si `entry.type === "text"` → tile de texto
- Si `entry.stack` → layout `"stacked"` (columna con dos tiles apilados)
- Si no → layout `"single"` (tile normal)

Los tiles de brand development se pasan con `showLabel: true` forzado, lo que activa el layout interno con título e industria.

---

### `main.js`

Todo el código de UI. Funciones principales:

#### Render

- **`renderBrandCreationGrid(items, containerId?)`** — renderiza brand creation y brand development. `containerId` default: `"brand-creation-grid"`
- **`renderProductDesignGrid(items)`** — renderiza product design con layout distinto (usa `createDevInner`)
- **`createBrandTile(config)`** — crea un tile individual. Maneja: bgImage lazy, bgVideo, logos, label, project link, pixel colors
- **`createBrandWrapper(item)`** — crea el `<article>` con guides y shell
- **`createBrandSingleItem(item)`** / **`createBrandStackedItem(item)`** — wrappers para cada layout
- **`createBrandLogo(logo)`** — crea un `<img>` con soporte para `darkSrc`, `logoSize`, `invertLogo`, `noFilterDark`
- **`createDevInner(logos, title, metaText, arrowText, bottomLogos, showTool)`** — layout interno de tiles brand development y product design

#### Hover overlay (brand creation)

- **`addCol4Panels()`** — recorre todos los tiles de `#brand-creation` y les inyecta el `.brand-hover-text` con nombre, año, industria, logo y flecha `↗`. Al final llama `initGsapHovers()`. Se llama después de cada render y cambio de idioma.

#### Tabs

- **`showContent(category, isInitial?)`** — cambia de tab. Categorías válidas: `brand-creation`, `brand-development`, `product-design`. Si `isInitial`, espera `dataReadyPromise` antes de mostrar. Persiste en `localStorage('activeTab')`.

#### Idioma y tema

- **`switchLanguage(lang)`** — actualiza todos los `[data-i18n]`, el link del CV, llama `_onSwitchLanguage` si existe (usado en `project.html`), re-renderiza el grid activo
- **`switchTheme(theme)`** — aplica `data-theme` en `<html>`, swapea logos dark/light, actualiza pixel grids activos, actualiza íconos de tema
- **`applyDarkSrcSwap()`** — swapea `img[data-light-src]` / `img[data-dark-src]` según tema actual

#### Navegación

- **`toggleSidebar()`** — abre/cierra sidebar en mobile/tablet con animación de items
- **`initScrollToggle()`** — agrega clase `.scrolled` al toggle cuando el body scrollea >200px
- **`initSwipeClose()`** — cierra sidebar con swipe left en touch

#### Seguridad

- **`sanitizeHTML(html)`** — limpia HTML antes de inyectarlo al DOM. Solo permite tags: `a`, `br`, `img`, `span`, `strong`, `em`. Siempre usar antes de `innerHTML`.
- **`_safeSrc(src)`** — valida paths de imágenes (solo caracteres seguros)
- **`_safeSize(val)`** — valida valores numéricos de tamaño
- **`_safeCSSValue(val, pattern)`** — valida valores CSS contra un regex

#### Navegación a proyectos

Cuando un tile tiene `project` definido en el JSON, `createBrandTile` le agrega un listener de click:

```js
tile.addEventListener('click', () => {
  document.querySelector('.content-area').classList.add('fading');
  setTimeout(() => { window.location.href = `project.html?p=${encodeURIComponent(project)}`; }, 500);
});
```

El fade dura 500ms via `.content-area.fading { opacity: 0 }`.

---

### `hover-gsap.js`

Tres funciones de hover, cada una para una sección distinta:

#### `initPixelHover(tile)` — Brand Creation

Hover con pixel fill animado + texto overlay. Requiere que el tile ya tenga `.brand-hover-text` (lo agrega `addCol4Panels()`).

- **Desktop** (`pointer: fine` + `min-width: 1025px`): mouseenter/mouseleave activan/desactivan el pixel grid
- **Mobile**: primer click activa, segundo click desactiva. Si hay otros tiles activos, los cierra primero

El color del pixel grid se determina en runtime según el tema: `var(--manteca)` en light, `var(--blackest)` en dark.

**Importante**: `initPixelHover` no tiene guard (`_pixelHoverInit`). Si se llama múltiples veces sobre el mismo tile (por re-renders), acumula listeners. Esto es inofensivo pero hay que tenerlo en cuenta.

#### `initPixelHoverVariant(tile, variant)` — Brand Development

Tiene guard `tile._pixelHoverInit`. Variantes disponibles:

| Variante | Cols | Color | Patrón |
|----------|------|-------|--------|
| `dissolve` | 16 | `--blackest` | random |
| `brandColor` | 14 | `--main-color` | random |
| `sweep` | 20 | `--main-color` | start→end |
| `burst` | 8 | `--main-color` | center |
| `glitch` | 18 | `--main-color` | random + overlay SVG |

Si el tile tiene `data-hover-color` o `data-pixel-color`, sobreescribe el color de la variante.

Brand development usa `dissolve` en desktop. En mobile no se inicializa (solo el pixel grid locked de product design).

#### `initPixelHoverSimple(tile, locked)` — Product Design

Tiene guard `tile._pixelHoverInit`. Si `locked: true`, aplica el pixel grid estático al 95% de opacidad sin hover. Si `locked: false`, hover normal.

#### `initGsapHovers()`

Función global que inicializa los tres tipos. Se llama desde `addCol4Panels()` y desde `brand-config.js` después del render.

```js
function initGsapHovers() {
  // brand creation: initPixelHover en todos los tiles
  // brand development: initPixelHoverVariant('dissolve') solo en desktop
  // product design: initPixelHoverSimple(locked) en mobile, initPixelHoverVariant en desktop
}
window.initGsapHovers = initGsapHovers;
```

---

### `cursor.js`

Cursor gooey animado solo en desktop (`pointer: fine`). Elemento `#cursor-dot` con `◆` rotado 45° en hover sobre elementos interactivos. El color cambia según contexto:
- Tiles de brand creation: `var(--main-color)`
- Otros tiles: `var(--whitest)`

---

## CSS

### Variables principales

```css
--main-color: #ff7518       /* naranja */
--manteca: #f6f6e4          /* blanco cálido — bg light */
--blackest: #171f25         /* negro — bg dark */
--manteca-dark              /* manteca oscurecida 5% */
--blackest-light            /* blackest aclarado 5% */
--bg                        /* token de tema: manteca en light, blackest en dark */
--text                      /* token de tema: blackest en light, manteca en dark */
```

### Font sizes (todas con `clamp`)

```css
--fs-nav                    /* sidebar desktop */
--fs-nav-mobile             /* sidebar mobile */
--fs-nav-tablet             /* sidebar tablet */
--fs-heading                /* h1 de tabs y project */
--fs-heading-tile           /* h2 dentro de tiles brand dev */
--fs-hover-name             /* nombre en hover overlay */
--fs-tile-text              /* texto en overlays, tags, footer */
--fs-tile-body              /* texto largo en tiles tipo texto */
--fs-gallery-text           /* texto en celdas de color en galería */
--fs-meta-label             /* etiquetas pequeñas: año, tipo */
--fs-caption                /* pie de foto, version label */
--fs-back-arrow             /* flecha del botón volver */
--fs-back-label             /* texto del botón volver */
--fs-arrow                  /* flecha decorativa en tiles */
--fs-cursor                 /* cursor gooey */
```

### Z-index scale

```css
--z-tile: 10
--z-tile-overlay: 20        /* pixel grid */
--z-tile-text: 21           /* texto sobre pixel grid */
--z-overlay: 5000           /* overlay del menú mobile */
--z-content: 4000
--z-sidebar: 6000
--z-toggle: 9999            /* botón hamburguesa */
```

### Breakpoints

| Rango | Comportamiento |
|-------|---------------|
| ≤767px | Mobile: grid 1 columna, sidebar fullscreen, font sizes grandes |
| 768px–1024px | Tablet: grid 2 columnas, sidebar fullscreen, font sizes medianos |
| 1025px–1365px | Desktop chico: sidebar fija pero sin padding extra |
| ≥1366px | Desktop: sidebar fija con padding, `margin-left: 25.5rem` en content |

### Clases de estado

- `.active` — tab activo, botón de idioma/tema activo
- `.open` — sidebar abierta
- `.fading` — content-area con `opacity: 0` (transición de página)
- `.pixel-active` — tile con hover activo en brand creation
- `.tile-bg-loaded` — tile con bgImage cargada (activa el `::before` con la imagen)
- `.theme-transitioning` — fuerza transiciones de color en todo el DOM durante el cambio de tema
- `.safari-browser` — clase en `<html>` para fixes específicos de Safari

---

## Estructura de datos

### `brand-creation.json`

```json
{
  "tiles": [
    {
      "order": 1,
      "size": "tile-xl",
      "span": 4,
      "src": "img/logos/nombre-logo.svg",
      "alt": "Nombre del cliente",
      "logoSize": 200,
      "invertLogo": false,
      "darkSrc": "",
      "noFilterDark": false,
      "multi": "",
      "multiLogoSize": 0,
      "bgImage": "img/backgrounds/nombre.webp",
      "bgPosition": "center",
      "bgVideo": "",
      "workType": "Branding",
      "year": "2024",
      "project": "nombre-proyecto",
      "projectLink": "project.html?p=nombre-proyecto",
      "pixelColor": "",
      "hoverColor": "",
      "label": {
        "name": "Nombre visible",
        "src": "img/logos/nombre-logo.svg",
        "invertLogo": false,
        "logoSize": 80,
        "es": { "industry": "Industria", "workType": "Tipo de trabajo" },
        "en": { "industry": "Industry", "workType": "Work type" }
      }
    }
  ]
}
```

**Campos clave:**

| Campo | Descripción |
|-------|-------------|
| `order` | Orden de aparición en el grid |
| `size` | `"tile-xl"` o `"tile"` |
| `span` | Columnas del grid: `4` = mitad, `6` = dos tercios, `8` = completo |
| `project` | ID del proyecto — activa click y navegación a `project.html?p=ID` |
| `projectLink` | URL directa — muestra la flecha `↗` en el hover overlay |
| `label` | Datos del overlay de hover (nombre, logo, industria, tipo de trabajo) |
| `pixelColor` | Color del pixel grid, sobreescribe el default por tema |
| `hoverColor` | Color alternativo para el hover (brand development) |
| `invertLogo` | Aplica `filter: brightness(0)` al logo (para logos negros sobre fondo oscuro) |
| `noFilterDark` | Evita la inversión automática en dark mode |
| `darkSrc` | Versión alternativa del logo para dark mode |
| `multi` | Segunda imagen de logo (para tiles con dos logos) |
| `bgVideo` | Path a `.mp4` — se reproduce en loop, muted, lazy |

**Tile de texto** (tipo especial):

```json
{
  "type": "text",
  "span": 4,
  "text": { "es": "Texto en español", "en": "Text in English" },
  "textSize": "1.5rem"
}
```

**Tile apilado** (dos tiles en una columna):

```json
{
  "span": 4,
  "stack": [
    { "size": "tile-xl", "src": "...", ... },
    { "size": "tile-xl", "src": "...", ... }
  ]
}
```

---

### `brand-development.json`

```json
{
  "brandDevelopment": [
    {
      "order": 1,
      "src": "img/logos/nombre-logo.svg",
      "alt": "Nombre",
      "size": "tile-xl",
      "span": 6,
      "logoSize": 250,
      "invertLogo": true,
      "bgImage": "img/backgrounds/nombre-dev.webp",
      "hoverColor": "var(--main-color)",
      "project": "nombre-proyecto",
      "projectName": "Nombre completo del proyecto",
      "title": { "es": "tipo de trabajo", "en": "work type" },
      "label": {
        "es": { "name": "Nombre", "industry": "Descripción en español" },
        "en": { "name": "Name", "industry": "Description in English" }
      },
      "description": {
        "es": "Descripción larga del proyecto",
        "en": "Long project description"
      },
      "hideProjectMeta": false,
      "gallery": [
        { "src": "img/visuals/nombre/imagen.webp", "cols": 3 },
        { "src": "img/visuals/nombre/imagen2.webp", "cols": 3, "caption": { "es": "Pie de foto", "en": "Caption" } },
        {
          "type": "text",
          "cols": 1,
          "bg": "#color",
          "text": { "es": "Texto", "en": "Text" },
          "textSize": "1.25rem",
          "logo": "img/logos/nombre-logo.svg",
          "logoSize": 60
        },
        { "src": "img/visuals/nombre/video.mp4", "cols": 4, "loop": true }
      ]
    }
  ]
}
```

**Columnas de galería (`cols`):**

| `cols` | `grid-column` | Uso |
|--------|--------------|-----|
| `1` | span 3 (25%) | Texto o imagen pequeña |
| `2` | span 6 (50%) | Imagen mediana |
| `3` | span 4 (33%) | Imagen estándar |
| `4` | span 12 (100%) | Imagen full width |

**Proyecto especial — Virtualmind**: cuando `project === "virtualmind"`, `project.html` renderiza un `<iframe>` apuntando a `design-kit/index.html` en lugar de la galería normal.

---

### `product-design.json`

```json
{
  "productDesign": [
    {
      "order": 1,
      "src": "img/visuals/logos/nombre-logo.svg",
      "span": 6,
      "logoSize": 100,
      "hoverColor": "var(--mint)",
      "title": { "es": "Nombre del proyecto", "en": "Project name" },
      "subtitle": { "es": "Descripción corta", "en": "Short description" },
      "year": "2024",
      "URLFigma": "https://www.figma.com/...",
      "secondaryLogo": "img/logos/otro-logo.svg",
      "secondaryLogoSize": 60
    }
  ]
}
```

Los tiles de product design no tienen galería. El click abre `URLFigma` en nueva pestaña.

---

## Navegación entre páginas

```
index.html  →  project.html?p=ID   (click en tile con `project` definido)
project.html  →  index.html?tab=brand-development   (botón volver)
```

Todas las navegaciones usan fade de 500ms:
1. Se agrega `.fading` a `.content-area` → `opacity: 0`
2. Después de 500ms → `window.location.href = url`
3. Al cargar la nueva página, `.content-area` empieza con `.fading` en el HTML
4. Se remueve `.fading` cuando los datos están listos → fade in

En `project.html`, `pageshow` con `e.persisted` (bfcache) remueve `.fading` y recarga si el grid está vacío.

---

## Idioma y tema

- **Idioma**: `localStorage.getItem('language')` → `'es'` o `'en'`. Default: `'en'`
- **Tema**: `localStorage.getItem('theme')` → `'light'` o `'dark'`. Default: `'light'`
- El tema se aplica en `<html data-theme="...">` via script inline antes del render para evitar flash
- Los logos con versión dark usan `data-light-src` / `data-dark-src` en el `<img>`, swapeados por `applyDarkSrcSwap()`
- Los logos con `invertLogo: true` usan `filter: brightness(0)` (negro puro) — en dark mode se invierten automáticamente via CSS a blanco
- Los logos con `noFilterDark: true` no se invierten en dark mode (para logos ya en color)

---

## Deploy

Vercel detecta pushes a las ramas configuradas y hace deploy automático. Los headers de seguridad están en `vercel.json`:

- `Content-Security-Policy` — permite scripts de CDN (GSAP, Vercel Analytics), bloquea el resto
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — deshabilita cámara, micrófono, geolocalización

Para agregar una rama al deploy de Vercel, configurarla desde el dashboard.

---

## Reglas importantes

- **No pushear a `main` directamente** — siempre via `test` → `dev`
- **No mezclar `hybrid` con `test`/`dev`** — son líneas de desarrollo separadas
- **No agregar dependencias JS** — el stack es intencional: HTML + CSS + Vanilla JS
- **Siempre usar `sanitizeHTML()` antes de `innerHTML`** — nunca inyectar strings externos sin sanitizar
- **Siempre usar `_safeSrc()` para paths de imágenes** — evita XSS via URLs maliciosas
- **El orden de los scripts importa** — `translations.js` debe cargarse antes que `brand-config.js` y `main.js`
- **`addCol4Panels()` debe llamarse después de `renderBrandCreationGrid()`** — y siempre dentro de un `requestAnimationFrame` para que el DOM esté listo
- **`initPixelHover` no tiene guard** — si se llama múltiples veces acumula listeners. No es un bug crítico pero hay que saberlo
