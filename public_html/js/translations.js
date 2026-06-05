let currentLang = localStorage.getItem("language") || "es";

const APP_VERSION = "7.0";

const _MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const _MONTHS_EN = ["january","february","march","april","may","june","july","august","september","october","november","december"];

function updateVersionLabel() {
  const el = document.getElementById("version-label");
  if (!el) return;
  const d = new Date();
  const months = currentLang === "en" ? _MONTHS_EN : _MONTHS_ES;
  el.textContent = `v${APP_VERSION} — ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const translations = {
  en: {
    // Navigation
    brandCreation: "Brand Creation",
    brandDevelopment: "Brand Development",
    productDesign: "Product Design",

    // Contact
    whatsapp: "whatsapp",
    linkedin: "linkedin",

    // Language
    langES: "es",
    langEN: "en",

    // Main intro
    intro:
      "Hi, I’m Diego (d) — a graphic designer focused on branding, web, and product. <br> I develop visual systems that bring clarity, structure, and longevity to brands. <br> Designed for humans, by a human. <span class='d-block mt-4'> Available for freelance work <span class='intro-arrow'>→</span> <a href='mailto:hola@disenod.com' class='fw-normal link' target='_blank' rel=''>hola@disenod.com</a></span>",

    // Tab intros
    brandDevelopmentIntro:
      "Brand development across contexts: identity, communication, and creative direction applied to products, spaces, and experiences. <br> Systems designed to adapt and perform within their context.",
    productDesignIntro:
      "    Designing products focused on shaping complex ideas into intuitive and refined digital experiences. <span class='d-block mt-4 fs-2 fw-normal'>Currently in development</span>",

    back: "back",
    activeClient: "active\nclient",
  },
  es: {
    // Navigation
    brandCreation: "Creación de Marca",
    brandDevelopment: "Desarrollo de Marca",
    productDesign: "Diseño de Producto",

    // Contact
    whatsapp: "whatsapp",
    linkedin: "linkedin",

    // Language
    langES: "es",
    langEN: "en",

    // Main intro
    intro:
      "Hola, soy Diego (d) — diseñador gráfico especializado en branding, web y producto. <br> Resuelvo problemas de comunicación creando sistemas visuales claros, escalables y consistentes. Diseño humano, para humanos. <span class='d-block mt-4'> Disponible para trabajo freelance <span class='intro-arrow'>→</span> <a href='mailto:hola@disenod.com' class='fw-normal link' target='_blank' rel=''>hola@disenod.com</a></span>",
    // Tab intros
    brandDevelopmentIntro:
      "Proyectos de marca en acción: identidad, comunicación y dirección creativa aplicadas a productos, espacios y experiencias. <br> Sistemas que se adaptan y funcionan de acuerdo al contexto.",
    productDesignIntro:
      "Diseño de producto enfocado en transformar ideas complejas en experiencias digitales intuitivas y funcionales. <span class='d-block mt-4 fs-2 fw-normal'>Actualmente en desarrollo.</span>",

    back: "volver",
    activeClient: "cliente\nactivo",
  },
};

// Función helper para obtener texto traducido
function t(key) {
  const keys = key.split(".");
  let obj = translations[currentLang || "es"];

  for (let k of keys) {
    obj = obj[k];
    if (!obj) return key; // Fallback si la clave no existe
  }

  return obj;
}



const _footerQuotes = {
  'brand-creation': [
    {
      es: { quote: 'La creatividad no es improvisación sin método.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' },
      en: { quote: 'Creativity is not improvisation without method.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' }
    },
    {
      es: { quote: 'El diseño responde a una necesidad.', author: 'Charles Eames, <em>Design Q&A</em>, 1972' },
      en: { quote: 'Design addresses itself to the need.', author: 'Charles Eames, <em>Design Q&A</em>, 1972' }
    },
    {
      es: { quote: 'El buen diseño comunica.', author: 'Paul Rand, <em>A Designer\'s Art</em>, 1985' },
      en: { quote: 'Good design communicates.', author: 'Paul Rand, <em>A Designer\'s Art</em>, 1985' }
    }
  ],
  'brand-development': [
    {
      es: { quote: 'La simplicidad es el resultado de un largo trabajo.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' },
      en: { quote: 'Simplicity is the result of a long process of work.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' }
    },
    {
      es: { quote: 'El buen diseño es la menor cantidad de diseño posible.', author: 'Dieter Rams, <em>Ten Principles for Good Design</em>, c. 1970s' },
      en: { quote: 'Good design is as little design as possible.', author: 'Dieter Rams, <em>Ten Principles for Good Design</em>, c. 1970s' }
    },
    {
      es: { quote: 'El buen diseño es honesto.', author: 'Dieter Rams, <em>Ten Principles for Good Design</em>, c. 1970s' },
      en: { quote: 'Good design is honest.', author: 'Dieter Rams, <em>Ten Principles for Good Design</em>, c. 1970s' }
    }
  ],
  'product-design': [
    {
      es: { quote: 'Complicar es fácil, simplificar es difícil.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' },
      en: { quote: "It's easy to complicate, but hard to simplify.", author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' }
    },
    {
      es: { quote: 'El buen diseño es la menor cantidad de diseño posible.', author: 'Dieter Rams, <em>Ten Principles for Good Design</em>, c. 1970s' },
      en: { quote: 'Good design is as little design as possible.', author: 'Dieter Rams, <em>Ten Principles for Good Design</em>, c. 1970s' }
    }
  ]
};

const _lastFooterIndex = {};

function updateFooter(category, keepCurrent = false) {
  const q = document.getElementById('footer-quote');
  const a = document.getElementById('footer-author');
  if (!q || !a) return;
  const pool = _footerQuotes[category];
  if (!pool) return;
  if (!keepCurrent || _lastFooterIndex[category] === undefined) {
    let idx;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (pool.length > 1 && idx === _lastFooterIndex[category]);
    _lastFooterIndex[category] = idx;
  }
  const data = pool[_lastFooterIndex[category]][currentLang] || pool[_lastFooterIndex[category]].es;
  q.textContent = `\u201c${data.quote}\u201d`;
  a.innerHTML = `\u2014 ${data.author}`;
}
