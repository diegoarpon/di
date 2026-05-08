let currentLang = localStorage.getItem("language") || "es";

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
      "Hi, I’m Diego (d) — a graphic designer focused on branding, web, and product. <br> I develop visual systems that bring clarity, structure, and longevity to brands. <br> Designed for humans, by a human. <span class='d-lg-block mt-4'> Available for freelance work <span class='intro-arrow'>→</span> <a href='mailto:hola@disenod.com' class='fw-normal link' target='_blank' rel=''>hola@disenod.com</a></span>",

    // Tab intros
    brandDevelopmentIntro:
      "Brand development across contexts: identity, communication, and creative direction applied to products, spaces, and experiences. <br> Systems designed to adapt and perform within their context.",
    productDesignIntro:
      "    Designing products focused on shaping complex ideas into intuitive and refined <br class='d-none d-lg-block'>digital experiences. <span class='d-lg-block mt-4 fs-2 fw-normal'>Currently in development</span>",


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
      "Hola, soy Diego (d) — diseñador gráfico especializado en branding, web y producto. <br> Resuelvo problemas de comunicación creando sistemas visuales claros, escalables <br class='d-none d-lg-block'>y consistentes. Diseño humano, para humanos. <span class='d-lg-block mt-4'> Disponible para trabajo freelance <span class='intro-arrow'>→</span> <a href='mailto:hola@disenod.com' class='fw-normal link' target='_blank' rel=''>hola@disenod.com</a></span>",
    // Tab intros
    brandDevelopmentIntro:
      "Proyectos de marca en acción: identidad, comunicación y dirección creativa aplicadas a productos, espacios y experiencias. <br> Sistemas que se adaptan y funcionan de acuerdo al contexto.",
    productDesignIntro:
      "Diseño de producto enfocado en transformar ideas complejas en experiencias digitales intuitivas y funcionales. <span class='d-lg-block mt-4 fs-2 fw-normal'>Actualmente en desarrollo.</span>",

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
  'brand-creation': {
    es: { quote: 'La creatividad no es improvisación sin método.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' },
    en: { quote: 'Creativity is not improvisation without method.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' }
  },
  'brand-development': {
    es: { quote: 'La simplicidad es el resultado de un largo trabajo.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' },
    en: { quote: 'Simplicity is the result of a long process of work.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' }
  },
  'product-design': {
    es: { quote: 'Complicar es fácil, simplificar es difícil.', author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' },
    en: { quote: "It's easy to complicate, but hard to simplify.", author: 'Bruno Munari, <em>Da cosa nasce cosa</em>, 1981' }
  }
};

function updateFooter(category) {
  const q = document.getElementById('footer-quote');
  const a = document.getElementById('footer-author');
  if (!q || !a) return;
  const data = _footerQuotes[category]?.[currentLang] || _footerQuotes[category]?.es;
  if (!data) return;
  q.textContent = `\u201c${data.quote}\u201d`;
  a.innerHTML = `\u2014 ${data.author}`;
}
