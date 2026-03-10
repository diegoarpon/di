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
      "Hi, I'm Diego — most people call me D.<br>Designer with 20 years of experience in branding, web and product design.<br>I help brands grow, evolve and build meaningful digital experiences.<br>More human than any AI.<br>Available for freelance work → <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a>",

    // Tab intros
    brandDevelopmentIntro:
      "Comprehensive brand development projects that establish strong visual identities and strategic positioning for businesses across various industries.",
    productDesignIntro:
      "User-centered product design solutions that transform complex ideas into intuitive digital experiences and innovative interfaces.",

    // Footer
    end: "There's more work available upon request.",
    test: "To complicate is easy. To simplify is difficult.",

    // Project descriptions
    projects: {
      "logo-si-salud-integral.svg": {
        name: "SI Salud Integral",
        industry: "Comprehensive health center focused on the harmony between body, mind and emotion",
      },
      "logo-juliana-oppici.svg": {
        name: "Juliana Oppici",
        industry: "Aesthetic physician, director of Essenza, Advanced Aesthetics Center",
      },
      "logo-ponti-tosi.svg": {
        name: "Ponti Tosi",
        industry: "Brand for outreach society on Functional Dermatology with PNIE orientation",
      },
      "logo-meta.svg": { name: "Meta", industry: "Aesthetic Medicine, Technology & Antiaging Congress of Uruguay" },
      "logo-upmid-white.svg": {
        name: "Upmid",
        industry: "Advanced aesthetic medicine course for the upper and middle facial third by EG Marketing",
      },
      "logo-virtualmind-color.png": {
        name: "Virtualmind",
        industry: "Software house that provides software development services to boost product engineering and digital transformation capabilities",
      },
      "logo-reale.svg": { name: "Reale", industry: "Aesthetic medicine specialist" },
      "logo-eg-white.svg": {
        name: "EG Marketing",
        industry: "Consulting firm specialized in medicine, creator and organizer of events for the professional community",
      },
      "logo-farolatino-icon-white.svg": {
        name: "Faro Latino",
        industry: "Founded in 1995 as the first Latin American digital distributor, protecting and empowering the intellectual property of musicians and content creators",
      },
      "logo-farolatino-white.svg": {
        name: "Faro Latino",
        industry: "Founded in 1995 as the first Latin American digital distributor, protecting and empowering the intellectual property of musicians and content creators",
      },
      "logo-banegas-day.svg": {
        name: "Banegas Day",
        industry: "Live cadaveric dissection day with applications and talks",
      },
      "logo-banegas-day-full.svg": {
        name: "Banegas Day",
        industry: "Live cadaveric dissection day with applications and talks",
      },
      "logo-bronx-gym.svg": {
        name: "Bronx",
        industry: "Functional training gym",
      },
      "logo-comoyacomo.svg": {
        name: "Como Ya Como",
        industry: "Food delivery app (Buenos Aires, Argentina)",
      },
      "logo-corvalius.svg": {
        name: "Corvalius",
        industry: "Design and optimization of technological products and services that address business from the user perspective",
      },
      "logo-courtside.svg": {
        name: "Courtside",
        industry: "Restaurant brand (Idaho, US)",
      },
      "logo-duarte.svg": { name: "Duarte & Asociados", industry: "Accounting firm from Rosario, Santa Fe, Argentina" },
      "flitzz.svg": { name: "Flitzz", industry: "Easy way to buy news articles à la carte or in curated collections from US/Canada news publishers" },
      "logo-food-traders.svg": {
        name: "Food Traders",
        industry: "Online news and digital magazine dedicated to the international food trader community",
      },
      "logo-form-stream.svg": {
        name: "Form Stream",
        industry: "Ultimate solution designed to handle the challenges of getting data to and from complex forms",
      },
      "logo-fx-prom.svg": {
        name: "FX Prom",
        industry: "Women's Online Formalwear Boutique (Jefferson City, Tennessee)",
      },
      "logo-hit-pr.svg": {
        name: "Hit",
        industry: "Public relations agency",
      },
      "logo-iblum.svg": { name: "iBlum", industry: "Software consulting firm (Rosario, Argentina)" },
      "logo-IMD.svg": { name: "IMD", industry: "Full service model and product development house (Culver City, California)" },
      "logo-kamea.svg": { name: "Kamea", industry: "NYC based indie pop band" },
      "logo-lu-maria.svg": {
        name: "Lu María",
        industry: "Singer-songwriter from Buenos Aires, Argentina",
      },
      "logo-mena-lombard.svg": {
        name: "Mena Lombard",
        industry: "Fashion designer and educator",
      },
      "logo-nestseekers.svg": {
        name: "Nestseekers",
        industry: "Global real estate brokerage at the nexus of technology and media",
      },
      "logo-players.svg": {
        name: "Players",
        industry: "Restaurant brand (Idaho, US)",
      },
      "logo-zoom.svg": {
        name: "Zoom",
        industry: "Communication and design agency",
      },
      "logo-zlatar-nario.svg": {
        name: "Zlatar Nario",
        industry: "Law firm",
      },
      "logo-ambrosia.svg": {
        name: "Ambrosia",
        industry: "Pastry business brand identity",
      },
      "logo-art-climate.svg": {
        name: "Art Climate",
        industry: "A Bay Area platform supporting artists, cultural producers, and arts organizations committed to imagining and realizing climate resilient futures",
      },
    },
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
      "Hola, soy Diego — la mayoría me dice D.<br>Diseñador con 20 años de experiencia en branding, web y diseño de producto.<br>Ayudo a las marcas a crecer, evolucionar y construir experiencias digitales significativas.<br>Más humano que cualquier IA.<br>Disponible para trabajo freelance → <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a>",

    // Tab intros
    brandDevelopmentIntro:
      "Proyectos integrales de desarrollo de marca que establecen identidades visuales sólidas y posicionamiento estratégico para empresas de diversas industrias.",
    productDesignIntro:
      "Soluciones de diseño de producto centradas en el usuario que transforman ideas complejas en experiencias digitales intuitivas e interfaces innovadoras.",

    // Footer
    end: "Más trabajos disponibles para mostrar a pedido.",
    test: "Complicar es fácil. Simplificar es difícil.",

    // Project descriptions
    projects: {
      "logo-si-salud-integral.svg": {
        name: "SI Salud Integral",
        industry: "Centro de salud integral, enfocado en la armonía entre cuerpo, mente y emoción",
      },
      "logo-juliana-oppici.svg": {
        name: "Juliana Oppici",
        industry: "Médica estética, directora de Essenza, Centro de estética avanzada",
      },
      "logo-ponti-tosi.svg": {
        name: "Ponti Tosi",
        industry: "Marca para sociedad de divulgación sobre Dermatología Funcional con Orientación en PNIE",
      },
      "logo-meta.svg": {
        name: "Meta",
        industry: "Congreso de Medicina Estética, Tecnología & Antiaging de Uruguay",
      },
      "logo-upmid-white.svg": {
        name: "Upmid",
        industry: "Curso avanzado de medicina estética para el tercio superior y medio facial by EG Marketing",
      },
      "logo-virtualmind-color.png": {
        name: "Virtualmind",
        industry: "Casa de software que proporciona servicios de desarrollo de software para impulsar las capacidades de ingeniería de productos y transformación digital",
      },
      "logo-reale.svg": { name: "Reale", industry: "Especialista en medicina estética" },
      "logo-eg-white.svg": {
        name: "EG Marketing",
        industry: "Consultora especializada en Medicina, creadora y organizadora de eventos para la comunidad profesional",
      },
      "logo-farolatino-icon-white.svg": {
        name: "Faro Latino",
        industry: "Fundada en 1995 como la primera distribuidora digital latinoamericana, protege y potencia la propiedad intelectual de músicos y creadores de contenido",
      },
      "logo-farolatino-white.svg": {
        name: "Faro Latino",
        industry: "Fundada en 1995 como la primera distribuidora digital latinoamericana, protege y potencia la propiedad intelectual de músicos y creadores de contenido",
      },
      "logo-banegas-day.svg": {
        name: "Banegas Day",
        industry: "Jornada de disección cadavérica live con aplicaciones y charlas",
      },
      "logo-banegas-day-full.svg": {
        name: "Banegas Day",
        industry: "Jornada de disección cadavérica live con aplicaciones y charlas",
      },
      "logo-bronx-gym.svg": {
        name: "Bronx",
        industry: "Gimnasio entrenamiento funcional",
      },
      "logo-comoyacomo.svg": {
        name: "Como Ya Como",
        industry: "App de delivery de comida en Bs As Argentina",
      },
      "logo-corvalius.svg": {
        name: "Corvalius",
        industry: "Diseño y optimización de productos y servicios tecnológicos que atienden el negocio desde la perspectiva del usuario",
      },
      "logo-courtside.svg": {
        name: "Courtside",
        industry: "Marca de restaurante (Idaho, US)",
      },
      "logo-duarte.svg": {
        name: "Duarte & Asociados",
        industry: "Estudio contable de la ciudad de Rosario, Santa Fe, Argentina",
      },
      "flitzz.svg": { name: "Flitzz", industry: "Manera fácil para que cualquiera compre artículos de noticias a la carta o en colecciones curadas de editores de noticias de EE.UU./Canadá" },
      "logo-food-traders.svg": {
        name: "Food Traders",
        industry: "Revista digital y noticias online dedicada a la comunidad internacional de comercio de alimentos",
      },
      "logo-form-stream.svg": {
        name: "Form Stream",
        industry: "Solución definitiva diseñada para manejar los desafíos de obtener y enviar datos desde y hacia formularios complejos",
      },
      "logo-fx-prom.svg": {
        name: "FX Prom",
        industry: "Boutique online de ropa formal para mujeres (Jefferson City, Tennessee)",
      },
      "logo-hit-pr.svg": {
        name: "Hit",
        industry: "Agencia de relaciones públicas",
      },
      "logo-iblum.svg": { name: "iBlum", industry: "Consultora de software en Rosario, Argentina" },
      "logo-IMD.svg": { name: "IMD", industry: "Casa de desarrollo de modelos y productos de servicio completo (Culver City, California)" },
      "logo-kamea.svg": { name: "Kamea", industry: "Banda de indie pop basada en NYC" },
      "logo-lu-maria.svg": {
        name: "Lu María",
        industry: "Identidad para cantautora de Bs As, Argentina",
      },
      "logo-mena-lombard.svg": {
        name: "Mena Lombard",
        industry: "Diseñadora y educadora de moda",
      },
      "logo-nestseekers.svg": {
        name: "Nestseekers",
        industry: "Correduría inmobiliaria global en el nexo de la tecnología y los medios",
      },
      "logo-players.svg": {
        name: "Players",
        industry: "Marca de restaurante (Idaho, US)",
      },
      "logo-zoom.svg": {
        name: "Zoom",
        industry: "Agencia de comunicación y diseño",
      },
      "logo-zlatar-nario.svg": {
        name: "Zlatar Nario",
        industry: "Estudio jurídico",
      },
      "logo-ambrosia.svg": {
        name: "Ambrosia",
        industry: "Identidad para emprendimiento de pastelería",
      },
      "logo-art-climate.svg": {
        name: "Art Climate",
        industry: "Plataforma del área de la Bahía que apoya a artistas, productores culturales y organizaciones artísticas comprometidas con imaginar y realizar futuros resilientes al clima",
      },
    },
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

// Función helper para obtener proyecto traducido
function getProjectContent(filename, lang = currentLang || "es") {
  return (
    translations[lang].projects[filename] || {
      name: "Project",
      industry: "Brand Design",
    }
  );
}
