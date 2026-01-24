document.addEventListener("DOMContentLoaded", function () {
  // Logo Randomizer
  const logos = [
    "img/logos/logo-art-climate.svg",
    "img/logos/logo-hit-pr.svg",
    "img/logos/logo-food-traders.svg",
    "img/logos/logo-zlatar-nario.svg",
    "img/logos/logo-mena-lombard.svg",
    "img/logos/logo-duarte.svg",
    "img/logos/logo-IMD.svg",
    "img/logos/logo-bronx-gym.svg",
    "img/logos/logo-comoyacomo.svg",
    "img/logos/logo-ambrosia.svg",
    "img/logos/logo-players-color.svg",
    "img/logos/logo-corvalius.svg",
    "img/logos/logo-iblum.svg",
    "img/logos/logo-kamea.svg",
    "img/logos/logo-zoom.svg",
    "img/logos/logo-fx-prom.svg",
    //'img/logos/logo-lexpressmedia.svg'
  ];

  const tileImages = Array.from(
    document.querySelectorAll(
      ".tile:not(.carousel):not(.tile-xl):not(.tile-large):not(.tile-end) img",
    ),
  ).filter((img) => {
    const tile = img.closest(".tile");
    const parent = tile.closest('[class*="d-none"]');
    return !parent || !getComputedStyle(parent).display.includes("none");
  });

  let logoDistribution = [...logos];

  while (logoDistribution.length < tileImages.length) {
    const randomLogo = logos[Math.floor(Math.random() * logos.length)];
    logoDistribution.push(randomLogo);
  }

  for (let i = logoDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [logoDistribution[i], logoDistribution[j]] = [
      logoDistribution[j],
      logoDistribution[i],
    ];
  }

  tileImages.forEach((img, index) => {
    img.src = logoDistribution[index];
  });

  // Tile Panels
  const projectMap = {
    "logo-art-climate.svg": {
      title: "Art Climate + Action",
      description: "Environmental awareness campaign branding",
    },
    "logo-hit-pr.svg": {
      title: "Hit PR",
      description: "Public relations agency identity design",
    },
    "logo-food-traders.svg": {
      title: "International Food Trader",
      description: "Restaurant chain visual identity",
    },
    "logo-zlatar-nario.svg": {
      title: "Zlatar Nario Studio",
      description: "Jewelry brand logo and packaging",
    },
    "logo-mena-lombard.svg": {
      title: "Mena Lombard",
      description: "Financial services branding",
    },
    "logo-duarte.svg": {
      title: "Duarte",
      description: "Personal brand development",
    },
    "logo-IMD.svg": {
      title: "Industrial Model & Design",
      description: "Medical institute corporate identity",
    },
    "logo-bronx-gym.svg": {
      title: "Bronx Gym",
      description: "Fitness center branding",
    },
    "logo-comoyacomo.svg": {
      title: "ComoYaComo",
      description: "Food delivery app design",
    },
    "logo-ambrosia.svg": {
      title: "Ambrosia Pastelería",
      description: "Premium restaurant branding",
    },
    "logo-players.svg": {
      title: "Players Sports Grill",
      description: "Sports brand identity",
    },
    "logo-corvalius.svg": {
      title: "Corvalius",
      description: "Tech startup branding",
    },
    "logo-iblum.svg": {
      title: "Iblum",
      description: "Digital agency visual identity",
    },
    "logo-kamea.svg": {
      title: "Kamea",
      description: "Fashion brand development",
    },
    "logo-zoom.svg": {
      title: "ZOom",
      description: "Communication platform redesign",
    },
    "logo-fx-prom.svg": {
      title: "FX Prom",
      description: "Event management branding",
    },
    "logo-ambar.svg": {
      title: "Ambar",
      description: "Hospitality brand identity",
    },
    "logo-lexpressmedia.svg": {
      title: "Lexpress Media",
      description: "Publishing house branding",
    },
  };

  const tiles = Array.from(
    document.querySelectorAll(
      ".tile:not(.carousel):not(.tile-xl):not(.tile-end):not(.tile-message)",
    ),
  ).filter((tile) => {
    const parent = tile.closest('[class*="d-none"]');
    return !parent || !getComputedStyle(parent).display.includes("none");
  });

  tiles.forEach((tile) => {
    const img = tile.querySelector("img");
    if (img && img.src) {
      const filename = img.src.split("/").pop();
      const project = projectMap[filename] || {
        title: "Project",
        description: "Details coming soon",
      };

      const panel = document.createElement("div");
      panel.className = "tile-panel";
      panel.innerHTML = `<h3>${project.title}</h3><p>${project.description}</p>`;

      tile.appendChild(panel);

      tile.addEventListener("click", function () {
        if (window.innerWidth < 768) {
          tiles.forEach((otherTile) => {
            if (otherTile !== tile) {
              otherTile.classList.remove("active");
            }
          });
          tile.classList.toggle("active");
        }
      });
    }
  });

  // Hamburger Menu
  const hamburger = document.getElementById("hamburger-menu");
  const mobileMenu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("menu-overlay");

  if (hamburger && mobileMenu && overlay) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("open");

      if (window.innerWidth < 768) {
        if (mobileMenu.classList.contains("open")) {
          mobileMenu.classList.remove("open");
          overlay.classList.remove("active");
        } else {
          mobileMenu.classList.add("open");
          overlay.classList.add("active");
        }
      }
    });

    overlay.addEventListener("click", function () {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

  // Responsive Behavior
  function handleResize() {
    if (window.innerWidth < 768) {
      document
        .querySelectorAll(".guide-h-double-100, .guide-v-double-100")
        .forEach((el) => {
          el.style.opacity = "1";
        });
    } else {
      document
        .querySelectorAll(".guide-h-double-100, .guide-v-double-100")
        .forEach((el) => {
          el.style.opacity = "1";
        });
      // Close mobile menu on desktop
      if (mobileMenu) {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        overlay.classList.remove("active");
      }
    }
  }

  handleResize();
  window.addEventListener("resize", handleResize);

  // Internationalization
  const translations = {
    en: {
      intro:
        "My name is Diego, but everybody calls me <span class='fw-bold'>D.</span><br><span class='fw-bold'>20</span> years of experience in <span class='fw-bold'>Branding</span> and <span class='fw-bold'>Web Front End Design</span>. <br class='d-block d-sm-none'>Friendlier than any AI.<br>Available for freelance work.<br class='d-block d-sm-none'> <span class='option'><a href='mailto:hola@disenod.com' class='fw-bold link main-color' target='_blank'>hola@disenod.com</a></span>",
      end: "There's more work available upon request.",
      test: "To complicate is easy. To simplify is difficult.",
      message1:
        "I create <strong>authentic and consistent</strong> visual identities that make your brand <strong>connect with the right people and stand out</strong>.",
      message2:
        "I’ll support you through every stage — <strong>from creating your brand identity to building your website and social presence</strong>. <span class='d-inline d-md-none d-lg-inline'>So your brand looks <strong>professional, consistent, and unique</strong>.</span>",
      message3:
        " If you have an idea or a business and want it to stand out, grow, and connect, <strong>let’s work together to build a brand that tells your story <span class='d-inline d-md-none d-lg-inline'>and shows why people should choose you.</span></strong>",
      flittz:
        "A smarter way to capture data and revenue from users who avoid subscriptions. Its dynamic lettering reflects a sense of freedom, flexibility, and adaptability",
      projects: {
        "art-climate.svg": {
          title: "Art Climate + Action",
          description:
            "Branding for an NGO that connects artists with environmental awareness. California, USA.",
        },
        "logo-hit-pr.svg": {
          title: "Hit PR",
          description:
            "Identity design for a public relations agency. Buenos Aires, Argentina.",
        },
        "logo-food-traders.svg": {
          title: "International Food Trader",
          description:
            "Identity for a virtual magazine focused on the agricultural world. Seattle, USA.",
        },
        "logo-zlatar-nario.svg": {
          title: "Zlatar Nario",
          description:
            "Brand identity for a law firm. Buenos Aires, Argentina.",
        },
        "logo-mena-lombard.svg": {
          title: "Mena Lombard",
          description: "Branding for a fashion designer based in Florida, USA.",
        },
        "logo-duarte.svg": {
          title: "Duarte",
          description: "Identity for an accounting firm. Rosario, Argentina.",
        },
        "logo-IMD.svg": {
          title: "Industrial Model & Design",
          description:
            "Company specializing in model making and sculpture development. California, USA.",
        },
        "logo-bronx-gym.svg": {
          title: "Bronx Gym",
          description: "Branding for a fitness center. Uruguay.",
        },
        "logo-comoyacomo.svg": {
          title: "Como Ya Como",
          description:
            "Branding for a food delivery app. Buenos Aires, Argentina.",
        },
        "logo-ambrosia.svg": {
          title: "Ambrosia",
          description: "Branding for a pastry business. Spain.",
        },
        "logo-players-color.svg": {
          title: "Players",
          description: "Identity for a restaurant chain. Idaho, USA.",
        },
        "logo-corvalius.svg": {
          title: "Corvalius",
          description: "Branding for an IT startup. Buenos Aires, Argentina.",
        },
        "logo-iblum.svg": {
          title: "Iblum",
          description: "Branding for an IT startup. Rosario, Argentina.",
        },
        "logo-kamea.svg": {
          title: "Kamea",
          description: "Logo design for an indie band. New York City.",
        },
        "logo-zoom.svg": {
          title: "Zoom",
          description: "Personal brand. Faraway, so close.",
        },
        "logo-fx-prom.svg": {
          title: "FX Prom",
          description: "Branding for an event management company. USA.",
        },
        "logo-ambar.svg": { title: "Ambar", description: "" },
        "logo-lexpressmedia.svg": { title: "Lexpress Media", description: "" },
      },
    },
    es: {
      intro:
        "Mi nombre es Diego, pero me llaman <span class='fw-bold'>D.</span><br><span class='fw-bold'>20</span> años de experiencia en <span class='fw-bold'>Branding</span> y <span class='fw-bold'>Desarrollo Front End</span>. <br class='d-block d-sm-none'>Más amigable que cualquier IA.<br>Disponible para trabajo freelance.<br class='d-block d-sm-none'> <span class='option'><a href='mailto:hola@disenod.com' class='fw-bold link main-color' target='_blank'>hola@disenod.com</a></span>",
      end: "Más trabajos disponibles para mostrar a pedido.",
      test: "Complicar es fácil. Simplificar es difícil.",
      message1:
        "Creo identidades visuales <strong>auténticas y coherentes</strong> para que tu marca <strong>conecte</strong> con las personas correctas y se destaque.",
      message2:
        "Te acompaño en las etapas que necesites: <strong>desde definir tu branding hasta diseñar tu web y alinear tus redes</strong>. <span class='d-inline d-md-none d-lg-inline'>Todo para que tu marca se vea <strong>profesional, coherente y única</strong>.</span>",
      message3:
        "Si tenés una idea o negocio y querés que se vea, crezca y conecte, <strong>trabajemos juntos para crear un branding sólido</strong> que comunique quién sos.",
      flittz:
        "Una forma inteligente de captar datos e ingresos de usuarios que evitan las suscripciones. Su tipografía dinámica transmite una sensación de libertad, flexibilidad y adaptabilidad.",
      projects: {
        "logo-art-climate.svg": {
          title: "Art Climate + Action",
          description:
            "Branding para ONG que une a artistas con conciencia ambiental. California, USA.",
        },
        "logo-hit-pr.svg": {
          title: "Hit PR",
          description:
            "Diseño de identidad para agencia de relaciones públicas. BA, Argentina.",
        },
        "logo-food-traders.svg": {
          title: "Intl. Food Trader",
          description:
            "Identidad para magazine virtual sobre el mundo agropecuario. Seattle, USA.",
        },
        "logo-zlatar-nario.svg": {
          title: "Estudio Zlatar Nario",
          description:
            "Identidad de marca para estudio de Abogacía. BA, Argentina.",
        },
        "logo-mena-lombard.svg": {
          title: "Mena Lombard",
          description: "Marca para Diseñadora de moda en Florida, USA.",
        },
        "logo-duarte.svg": {
          title: "Estudio Duarte",
          description:
            "Identidad para estudio de contadores. Rosario, Argentina.",
        },
        "logo-IMD.svg": {
          title: "Industrial Model & Design",
          description:
            "Empresa de desarrollo de modelos y esculturas. California, USA.",
        },
        "logo-bronx-gym.svg": {
          title: "Bronx Gym",
          description: "Branding para centro de fitness. Uruguay.",
        },
        "logo-comoyacomo.svg": {
          title: "Como Ya Como",
          description:
            "Branding para app de delivery de comida. BA. Argentina.",
        },
        "logo-ambrosia.svg": {
          title: "Ambrosia",
          description: "Branding para emprendimiento de pastelería. España.",
        },
        "logo-players-color.svg": {
          title: "Players Sports Grill",
          description: "Identidad para cadena de restaurantes. Idaho, USA.",
        },
        "logo-corvalius.svg": {
          title: "Corvalius",
          description: "Branding para startup IT. BA, Argentina.",
        },
        "logo-iblum.svg": {
          title: "Iblum",
          description: "Branding para startup IT. Rosario, Argentina.",
        },
        "logo-kamea.svg": {
          title: "Kamea",
          description: "Logo para banda Indie. NYC.",
        },
        "logo-zoom.svg": {
          title: "Zoom",
          description: "Marca personal. Tan lejos, tan cerca.",
        },
        "logo-fx-prom.svg": {
          title: "FX Prom",
          description: "Branding para empresa de gestión de eventos. USA.",
        },
        "logo-ambar.svg": { title: "Ambar", description: "" },
        "logo-lexpressmedia.svg": { title: "Lexpress Media", description: "" },
      },
    },
  };

  let currentLang = localStorage.getItem("language") || "es";

  window.switchLanguage = function (lang) {
    currentLang = lang;
    localStorage.setItem("language", lang);

    // Update content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[currentLang][key]) {
        el.innerHTML = translations[currentLang][key];
      }
    });

    // Update project panels
    tiles.forEach((tile) => {
      const img = tile.querySelector("img");
      const panel = tile.querySelector(".tile-panel");
      if (img && panel) {
        const filename = img.src.split("/").pop();
        const project = translations[currentLang].projects[filename];
        if (project) {
          panel.innerHTML = `<h3>${project.title}</h3><p>${project.description}</p>`;
        }
      }
    });

    // Update language button states
    document
      .querySelectorAll("#lang-en, #lang-es")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById("lang-" + lang).classList.add("active");

    document.documentElement.lang = currentLang;
  };

  // Initialize language
  window.switchLanguage(currentLang);
});
