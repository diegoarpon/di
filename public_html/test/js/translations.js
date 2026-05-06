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
      "Hi, I’m Diego (d) — a graphic designer focused on branding, web, and product. <br> I develop visual systems that bring clarity, structure, and longevity to brands. <br> Designed for humans, by a human. <span class='d-lg-block mt-4'> Available for freelance work <span class='intro-arrow'>→</span> <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a></span>",

    // Tab intros
    brandDevelopmentIntro:
      "Brand development across contexts: identity, communication, and creative direction applied to products, spaces, and experiences. <br> Systems designed to adapt and perform within their context.",
    productDesignIntro:
      "Product design focused on shaping complex ideas into intuitive and refined digital experiences.",

    // Footer
    end: "There's more work available upon request.",
    back: "back",
    test: "To complicate is easy. To simplify is difficult.",

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
      "Hola, soy Diego (d) — diseñador gráfico especializado en branding, web y producto. <br> Resuelvo problemas de comunicación creando sistemas visuales claros, escalables <br class='d-none d-lg-block'>y consistentes. Diseño humano, para humanos. <span class='d-lg-block mt-4'> Disponible para trabajo freelance <span class='intro-arrow'>→</span> <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a></span>",
    // Tab intros
    brandDevelopmentIntro:
      "Proyectos de marca en acción: identidad, comunicación y dirección creativa aplicadas a productos, espacios y experiencias. <br> Sistemas que se adaptan y funcionan de acuerdo al contexto.",
    productDesignIntro:
      "Diseño de producto enfocado en transformar ideas complejas en experiencias digitales intuitivas y funcionales.",

    // Footer
    back: "volver",
    test: "Complicar es fácil. Simplificar es difícil.",

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


