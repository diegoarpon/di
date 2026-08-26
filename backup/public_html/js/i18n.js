const translations = {
  en: {
    intro:
      "My name is Diego, but everybody calls me <span class='fw-bold'>D.</span><br><span class='fw-bold'>20</span> years of experience. <span class='fw-bold'>Branding</span>. <span class='fw-bold'>Web Front End</span>. <br class='d-block d-sm-none'>Friendlier than any AI.<br>Available for freelance work. <a href='#' class='fw-bold' target='_blank'>hola@disenod.com</a>",
    test: "To complicate is easy. To simplify is difficult.",
    end: "There's more work available upon request",
    projects: {
      "art-climate.svg": {
        title: "Art Climate + Action",
        description: "Environmental awareness campaign branding",
      },
      "logo-hit-pr.svg": {
        title: "Hit PR",
        description: "Public relations agency identity design",
      },
      "logo-food-traders.svg": {
        title: "Food Traders",
        description: "Restaurant chain visual identity",
      },
    },
  },
  es: {
    intro:
      "Mi nombre es Diego, pero todos me llaman <span class='fw-bold'>D.</span><br><span class='fw-bold'>20</span> años de experiencia. <span class='fw-bold'>Branding</span>. <span class='fw-bold'>Desarrollo Front End</span>. <br class='d-block d-sm-none'>Más amigable que cualquier IA.<br>Disponible para trabajo freelance. <a href='#' class='fw-bold' target='_blank'>hola@disenod.com</a>",
    test: "Complicar es fácil. Simplificar es difícil.",
    end: "Hay más trabajo para mostrar a pedido",
    projects: {
      "art-climate.svg": {
        title: "Art Climate + Action",
        description: "Campaña de branding para conciencia ambiental",
      },
      "logo-hit-pr.svg": {
        title: "Hit PR",
        description: "Diseño de identidad para agencia de relaciones públicas",
      },
      "logo-food-traders.svg": {
        title: "Food Traders",
        description: "Identidad visual para cadena de restaurantes",
      },
    },
  },
};

let currentLang = localStorage.getItem("language") || "en";

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);
  updateContent();
  updateProjectPanels();
}

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const keys = key.split(".");
    let value = translations[currentLang];

    keys.forEach((k) => (value = value?.[k]));
    if (value) el.innerHTML = value;
  });

  document.documentElement.lang = currentLang;
}

function updateProjectPanels() {
  const tiles = document.querySelectorAll(".tile:not(.carousel):not(.tile-xl)");
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
}
