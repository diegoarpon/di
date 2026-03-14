# Proyecto Di — Contexto del workspace

## Stack
- HTML5 + CSS3 + Vanilla JavaScript (sin frameworks JS)
- Bootstrap 5 para grid y utilidades puntuales
- jQuery 2.2.4 (legacy, evitar añadir más dependencias de jQuery)
- Vercel Analytics

## Estructura
- `public_html/` — producción
- `public_html/test/` — entorno de desarrollo/pruebas
- `public_html/test/js/main.js` — lógica principal
- `public_html/test/css/styles.css` — estilos principales
- `public_html/test/brand-config.json` — configuración de proyectos de marca

## Convenciones CSS
- Variables CSS en `:root` para colores, z-index y easing
- Colores principales: `--main-color`, `--manteca`, `--blackest`, `--black-95`
- Z-index via variables: `--z-sidebar`, `--z-content`, `--z-toggle`, `--z-tile-overlay`, `--z-tile-text`
- Clases de estado: `.active`, `.open`, `.tab-visible`, `.tab-hidden`
- Mobile-first con breakpoints: 767px (mobile), 1024px (tablet), 1025px+ (desktop)

## Arquitectura JS
- Todo en `DOMContentLoaded`
- Tabs: `showContent(category)` — categorías válidas: `brand-creation`, `brand-development`, `product-design`
- Idiomas: `switchLanguage(lang)` — `es` / `en`, persistido en `localStorage`
- Grid de marca renderizado dinámicamente desde `brandCreationItems` vía `renderBrandCreationGrid()`
- Sidebar fija en desktop (≥1025px), overlay en mobile/tablet con `toggleSidebar()`

## Idioma
- La interfaz es bilingüe (ES/EN) usando atributos `data-i18n`
- Responde siempre en español
