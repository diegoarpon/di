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
      "Hi, I'm Diego (D) — Designer with 20 years of experience in branding, web and product design.<br>I work on real problems: brands that aren't understood, products that don't scale, interfaces that don't work.<br>I design clear, usable and sustainable solutions. More human than any AI.<br>Available for freelance work <span class='intro-arrow'>→</span> <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a>",

    // Tab intros
    brandDevelopmentIntro:
      "Comprehensive brand development projects that establish strong visual identities and strategic positioning for businesses across various industries.",
    productDesignIntro:
      "User-centered product design solutions that transform complex ideas into intuitive digital experiences and innovative interfaces.",

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
      "Hola, soy Diego (D) — Diseñador gráfico, con experiencia en marcas, web y diseño de producto.<br>Resuelvo problemas reales con soluciones claras, escalables y sostenibles en el tiempo. Más humano que cualquier IA.<br>Disponible para trabajo freelance <span class='intro-arrow'>→</span> <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a>",

    // Tab intros
    brandDevelopmentIntro:
      "Proyectos integrales de desarrollo de marca que establecen identidades visuales sólidas y posicionamiento estratégico para empresas de diversas industrias.",
    productDesignIntro:
      "Soluciones de diseño de producto centradas en el usuario que transforman ideas complejas en experiencias digitales intuitivas e interfaces innovadoras.",

    // Footer
    end: "Más trabajos disponibles para mostrar a pedido.",
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


