let currentLang = localStorage.getItem('language') || 'es';

const translations = {
  en: {
    // Navigation
    brandCreation: 'Brand Creation',
    brandDevelopment: 'Brand Development',
    productDesign: 'Product Design',
    
    // Contact
    whatsapp: 'whatsapp',
    linkedin: 'linkedin',
    
    // Language
    langES: 'es',
    langEN: 'en',
    
    // Main intro
    intro: "Hi, I'm Diego — most people call me D.<br>Designer with 20 years of experience in branding, web and product design.<br>I help brands grow, evolve and build meaningful digital experiences.<br>More human than any AI.<br>Available for freelance work → <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a>",
    
    // Tab intros
    brandDevelopmentIntro: "Comprehensive brand development projects that establish strong visual identities and strategic positioning for businesses across various industries.",
    productDesignIntro: "User-centered product design solutions that transform complex ideas into intuitive digital experiences and innovative interfaces.",
    
    // Footer
    end: "There's more work available upon request.",
    test: "To complicate is easy. To simplify is difficult.",
    
    // Project descriptions
    projects: {
      'logo-si-salud-integral.svg': { name: 'SI Salud Integral', industry: 'Healthcare brand identity' },
      'logo-juliana-oppici.svg': { name: 'Juliana Oppici', industry: 'Personal professional brand' },
      'logo-ponti-tosi.svg': { name: 'Ponti Tosi', industry: 'Consulting firm identity' },
      'logo-meta.svg': { name: 'Meta', industry: 'Technology rebrand' },
      'logo-upmid-white.svg': { name: 'Upmid', industry: 'Digital solutions brand' },
      'logo-virtualmind-color.png': { name: 'Virtualmind', industry: 'Software development brand' },
      'logo-reale.svg': { name: 'Reale', industry: 'Insurance brand identity' },
      'logo-eg-white.svg': { name: 'EG Marketing', industry: 'Marketing agency brand' },
      'logo-farolatino-icon-white.svg': { name: 'Faro Latino', industry: 'Cultural media brand' },
      'logo-farolatino-white.svg': { name: 'Faro Latino', industry: 'Cultural media brand' },
      'logo-banegas-day.svg': { name: 'Banegas Day', industry: 'Real estate development brand' },
      'logo-banegas-day-full.svg': { name: 'Banegas Day', industry: 'Real estate development brand' },
      'logo-bronx-gym.svg': { name: 'Bronx Gym', industry: 'Fitness gym brand' },
      'logo-comoyacomo.svg': { name: 'Como Ya Como', industry: 'Restaurant brand identity' },
      'logo-corvalius.svg': { name: 'Corvalius', industry: 'Consulting firm identity' },
      'logo-courtside.svg': { name: 'Courtside', industry: 'Restaurant brand (Idaho)' },
      'logo-duarte.svg': { name: 'Duarte', industry: 'Legal services brand' },
      'flitzz.svg': { name: 'Flitzz', industry: 'Technology brand' },
      'logo-food-traders.svg': { name: 'Food Traders', industry: 'Food industry brand' },
      'logo-form-stream.svg': { name: 'Form Stream', industry: 'Digital workflow platform' },
      'logo-fx-prom.svg': { name: 'FX Prom', industry: 'Financial services brand' },
      'logo-hit-pr.svg': { name: 'Hit PR', industry: 'Public relations agency' },
      'logo-iblum.svg': { name: 'iBlum', industry: 'Technology brand' },
      'logo-IMD.svg': { name: 'IMD', industry: 'Medical services brand' },
      'logo-kamea.svg': { name: 'Kamea', industry: 'Luxury brand identity' },
      'logo-lu-maria.svg': { name: 'Lu María', industry: 'Lifestyle consultant brand' },
      'logo-mena-lombard.svg': { name: 'Mena Lombard', industry: 'Legal services brand' },
      'logo-nestseekers.svg': { name: 'Nestseekers', industry: 'Real estate brand' },
      'logo-players.svg': { name: 'Players', industry: 'Restaurant brand (Idaho)' },
      'logo-zoom.svg': { name: 'Zoom', industry: 'Video conferencing platform' },
      'logo-zlatar-nario.svg': { name: 'Zlatar Nario', industry: 'Luxury jewelry brand' },
      'logo-ambrosia.svg': { name: 'Ambrosia', industry: 'Restaurant brand identity' },
      'logo-art-climate.svg': { name: 'Art Climate', industry: 'Environmental art project' }
    }
  },
  es: {
    // Navigation
    brandCreation: 'Creación de Marca',
    brandDevelopment: 'Desarrollo de Marca',
    productDesign: 'Diseño de Producto',
    
    // Contact
    whatsapp: 'whatsapp',
    linkedin: 'linkedin',
    
    // Language
    langES: 'es',
    langEN: 'en',
    
    // Main intro
    intro: "Hola, soy Diego — la mayoría me dice D.<br>Diseñador con 20 años de experiencia en branding, web y diseño de producto.<br>Ayudo a las marcas a crecer, evolucionar y construir experiencias digitales significativas.<br>Más humano que cualquier IA.<br>Disponible para trabajo freelance → <a href='mailto:hello@disenod.com' class='fw-bold link' target='_blank' rel=''>hello@disenod.com</a>",
    
    // Tab intros
    brandDevelopmentIntro: "Proyectos integrales de desarrollo de marca que establecen identidades visuales sólidas y posicionamiento estratégico para empresas de diversas industrias.",
    productDesignIntro: "Soluciones de diseño de producto centradas en el usuario que transforman ideas complejas en experiencias digitales intuitivas e interfaces innovadoras.",
    
    // Footer
    end: "Más trabajos disponibles para mostrar a pedido.",
    test: "Complicar es fácil. Simplificar es difícil.",
    
    // Project descriptions
    projects: {
      'logo-si-salud-integral.svg': { name: 'SI Salud Integral', industry: 'Identidad de marca de salud' },
      'logo-juliana-oppici.svg': { name: 'Juliana Oppici', industry: 'Marca personal profesional' },
      'logo-ponti-tosi.svg': { name: 'Ponti Tosi', industry: 'Identidad de consultora' },
      'logo-meta.svg': { name: 'Meta', industry: 'Cambio de marca tecnológico' },
      'logo-upmid-white.svg': { name: 'Upmid', industry: 'Marca de soluciones digitales' },
      'logo-virtualmind-color.png': { name: 'Virtualmind', industry: 'Marca de desarrollo de software' },
      'logo-reale.svg': { name: 'Reale', industry: 'Identidad de marca de seguros' },
      'logo-eg-white.svg': { name: 'EG Marketing', industry: 'Marca de agencia de marketing' },
      'logo-farolatino-icon-white.svg': { name: 'Faro Latino', industry: 'Marca de medios culturales' },
      'logo-farolatino-white.svg': { name: 'Faro Latino', industry: 'Marca de medios culturales' },
      'logo-banegas-day.svg': { name: 'Banegas Day', industry: 'Marca de desarrollo inmobiliario' },
      'logo-banegas-day-full.svg': { name: 'Banegas Day', industry: 'Marca de desarrollo inmobiliario' },
      'logo-bronx-gym.svg': { name: 'Bronx Gym', industry: 'Marca de gimnasio' },
      'logo-comoyacomo.svg': { name: 'Como Ya Como', industry: 'Identidad de marca de restaurante' },
      'logo-corvalius.svg': { name: 'Corvalius', industry: 'Identidad de consultora' },
      'logo-courtside.svg': { name: 'Courtside', industry: 'Marca de restaurante (Idaho)' },
      'logo-duarte.svg': { name: 'Duarte', industry: 'Marca de servicios legales' },
      'flitzz.svg': { name: 'Flitzz', industry: 'Marca tecnológica' },
      'logo-food-traders.svg': { name: 'Food Traders', industry: 'Marca de industria alimentaria' },
      'logo-form-stream.svg': { name: 'Form Stream', industry: 'Plataforma de flujos digitales' },
      'logo-fx-prom.svg': { name: 'FX Prom', industry: 'Marca de servicios financieros' },
      'logo-hit-pr.svg': { name: 'Hit PR', industry: 'Agencia de relaciones públicas' },
      'logo-iblum.svg': { name: 'iBlum', industry: 'Marca tecnológica' },
      'logo-IMD.svg': { name: 'IMD', industry: 'Marca de servicios médicos' },
      'logo-kamea.svg': { name: 'Kamea', industry: 'Marca de lujo' },
      'logo-lu-maria.svg': { name: 'Lu María', industry: 'Marca de consultora de estilo' },
      'logo-mena-lombard.svg': { name: 'Mena Lombard', industry: 'Marca de servicios legales' },
      'logo-nestseekers.svg': { name: 'Nestseekers', industry: 'Marca inmobiliaria' },
      'logo-players.svg': { name: 'Players', industry: 'Marca de restaurante (Idaho)' },
      'logo-zoom.svg': { name: 'Zoom', industry: 'Plataforma de videoconferencia' },
      'logo-zlatar-nario.svg': { name: 'Zlatar Nario', industry: 'Marca de joyería de lujo' },
      'logo-ambrosia.svg': { name: 'Ambrosia', industry: 'Identidad de marca de restaurante' },
      'logo-art-climate.svg': { name: 'Art Climate', industry: 'Proyecto de arte ambiental' }
    }
  }
};

// Función helper para obtener texto traducido
function t(key) {
  const keys = key.split('.');
  let obj = translations[currentLang || 'es'];
  
  for (let k of keys) {
    obj = obj[k];
    if (!obj) return key; // Fallback si la clave no existe
  }
  
  return obj;
}

// Función helper para obtener proyecto traducido
function getProjectContent(filename, lang = currentLang || 'es') {
  return translations[lang].projects[filename] || { name: 'Project', industry: 'Brand Design' };
}
