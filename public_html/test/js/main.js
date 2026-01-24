document.addEventListener("DOMContentLoaded", function () {
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
    document
      .querySelectorAll(".guide-h-double-100, .guide-v-double-100")
      .forEach((el) => {
        el.style.opacity = "1";
      });

    if (window.innerWidth >= 768) {
      if (mobileMenu) {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        overlay.classList.remove("active");
      }
    }
  }

  handleResize();
  window.addEventListener("resize", handleResize);

  window.switchLanguage = function (lang) {
    currentLang = lang;
    localStorage.setItem("language", lang);

    // Update all elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = t(key);
      if (text && text !== key) {
        el.innerHTML = text;
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

  // Show default content or saved tab
  const savedTab = localStorage.getItem("activeTab") || "brand-creation";
  showContent(savedTab);
});

// Logo randomizer
const logos = [
  "img/logos/logo-ambar.svg",
  "img/logos/logo-ambrosia.svg",
  "img/logos/logo-art-climate.svg",
  "img/logos/logo-avenue-solutions.svg",
  "img/logos/logo-banegas-day.svg",
  "img/logos/logo-banegas-day-full.svg",
  "img/logos/logo-bronx-gym.svg",
  "img/logos/logo-comoyacomo.svg",
  "img/logos/logo-conception.svg",
  "img/logos/logo-corvalius.svg",
  "img/logos/logo-courtside.svg",
  "img/logos/logo-duarte.svg",
  "img/logos/logo-eg.svg",
  "img/logos/logo-farolatino-icon.svg",
  "img/logos/logo-farolatino.svg",
  "img/logos/flitzz.svg",
  "img/logos/logo-food-traders.svg",
  "img/logos/logo-form-stream.svg",
  "img/logos/logo-fx-prom.svg",
  "img/logos/logo-hit-pr.svg",
  "img/logos/logo-iblum.svg",
  "img/logos/logo-IMD.svg",
  "img/logos/logo-kamea.svg",
  "img/logos/logo-lexpressmedia.svg",
  "img/logos/logo-lu-maria.svg",
  "img/logos/logo-mena-lombard.svg",
  "img/logos/logo-meta.svg",
  "img/logos/logo-nestseekers-full-white.svg",
  "img/logos/logo-nestseekers-icons.svg",
  "img/logos/logo-nestseekers-previous.svg",
  "img/logos/logo-nestseekers-white.svg",
  "img/logos/logo-nestseekers.svg",
  "img/logos/logo-players-color.svg",
  "img/logos/logo-players.svg",
  "img/logos/logo-ponti-tosi.svg",
  "img/logos/logo-reale.svg",
  "img/logos/logo-upmid-gold.svg",
  "img/logos/logo-upmid-white.svg",
  "img/logos/logo-virtualmind-color.png",
  "img/logos/logo-virtualmind.svg",
  "img/logos/logo-zlatar-nario.svg",
  "img/logos/logo-zoom.svg",
];

const brandCreationLogos = [
  "img/logos/logo-bronx-gym.svg",
  "img/logos/logo-comoyacomo.svg",
  "img/logos/logo-corvalius.svg",
  "img/logos/logo-courtside.svg",
  "img/logos/logo-duarte.svg",
  "img/logos/flitzz.svg",
  "img/logos/logo-food-traders.svg",
  "img/logos/logo-form-stream.svg",
  "img/logos/logo-fx-prom.svg",
  "img/logos/logo-hit-pr.svg",
  "img/logos/logo-iblum.svg",
  "img/logos/logo-IMD.svg",
  "img/logos/logo-kamea.svg",
  "img/logos/logo-lu-maria.svg",
  "img/logos/logo-mena-lombard.svg",
  "img/logos/logo-nestseekers.svg",
  "img/logos/logo-players.svg",
  "img/logos/logo-zoom.svg",
  "img/logos/logo-zlatar-nario.svg",
  "img/logos/logo-ambrosia.svg",
  "img/logos/logo-art-climate.svg",
];

function randomizeBrandCreationLogos() {
  const tilesToRandomize = Array.from(
    document.querySelectorAll(
      "#brand-creation .row .tile img:not(.tile-end img)",
    ),
  ).filter((img) => !img.closest(".carousel") && !img.closest(".tile-xl"));

  const shuffledLogos = [
    ...brandCreationLogos.filter((logo) => !logo.includes("zoom")),
  ].sort(() => Math.random() - 0.5);
  shuffledLogos.push("img/logos/logo-zoom.svg");

  tilesToRandomize.forEach((img, index) => {
    img.src = index < shuffledLogos.length ? shuffledLogos[index] : "";
  });

  requestAnimationFrame(() => addCol4Panels());
}

// Add panels to tiles
function addPanelsToTiles() {
  document
    .querySelectorAll("#brand-creation .tile:not(.carousel):not(.tile-xl)")
    .forEach((tile) => {
      if (tile.querySelector(".tile-panel")) return;

      const img = tile.querySelector("img");
      if (!img || !img.src) return;

      const filename = img.src.split("/").pop();
      const content = getProjectContent(filename, currentLang) || {
        name: "Project",
        industry: "Brand Design",
        year: "2023",
      };
      const panelHTML = content.year
        ? `<h3>${content.name}</h3><p>${content.industry}</p><p>${content.year}</p>`
        : `<h3>${content.name}</h3><p>${content.industry}</p>`;

      const panel = document.createElement("div");
      panel.className = "tile-panel";
      panel.innerHTML = panelHTML;
      tile.appendChild(panel);

      tile.addEventListener(
        "click",
        function handleTileClick() {
          if (window.innerWidth <= 767) {
            tile.classList.toggle("active");
          }
        },
        { once: false },
      );
    });
}

// Update panel content based on current logos
function updatePanelContent() {
  document
    .querySelectorAll("#brand-creation .tile:not(.carousel):not(.tile-xl)")
    .forEach((tile) => {
      const img = tile.querySelector("img");
      const panel = tile.querySelector(".tile-panel");

      if (img && panel && img.src) {
        const filename = img.src.split("/").pop();
        const content = getProjectContent(filename, currentLang) || {
          name: "Project",
          industry: "Brand Design",
          year: "2023",
        };

        const panelHTML = content.year
          ? `<h3>${content.name}</h3><p>${content.industry}</p><p>${content.year}</p>`
          : `<h3>${content.name}</h3><p>${content.industry}</p>`;

        panel.innerHTML = panelHTML;
      }
    });
}

// Add panels to col-4 elements
function addCol4Panels() {
  document
    .querySelectorAll("#brand-creation .tile, #brand-creation .tile-xl")
    .forEach((tile) => {
      tile
        .querySelectorAll(".brand-hover-overlay, .brand-hover-text")
        .forEach((el) => el.remove());

      const img = tile.querySelector("img");
      if (!img || !img.src) return;

      const filename = img.src.split("/").pop();
      const content = getProjectContent(filename, currentLang) || {
        name: "Project",
        industry: "Brand Design",
      };

      const overlay = document.createElement("div");
      overlay.className = "brand-hover-overlay";
      tile.appendChild(overlay);

      const text = document.createElement("div");
      text.className = "brand-hover-text";
      text.innerHTML = `<strong>${content.name}</strong>${content.industry}`;
      tile.appendChild(text);

      tile.addEventListener(
        "click",
        function handleTileClick() {
          if (window.innerWidth <= 767) {
            tile.classList.toggle("active");
          }
        },
        { once: false },
      );
    });
}
function showContent(category) {
  localStorage.setItem("activeTab", category);

  document
    .querySelectorAll(".sidebar-nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(
    `[onclick="showContent('${category}')\"]`,
  );
  if (activeBtn) activeBtn.classList.add("active");

  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.toggle("tab-visible", tab.id === category);
    tab.classList.toggle("tab-hidden", tab.id !== category);
  });

  if (category === "brand-creation") {
    randomizeBrandCreationLogos();
    requestAnimationFrame(() => addCol4Panels());
  }
}

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar-container");
  const fixedToggle = document.querySelector(
    'div[style*="position: fixed"] .mobile-menu-toggle',
  );

  sidebar.classList.toggle("open");

  if (sidebar.classList.contains("open")) {
    fixedToggle.classList.add("open");
  } else {
    fixedToggle.classList.remove("open");
  }
}

// Project tile navigation for brand development
document.addEventListener("DOMContentLoaded", function () {
  const projectTiles = document.querySelectorAll("[data-project]");
  projectTiles.forEach((tile) => {
    tile.addEventListener("click", function () {
      const projectName = this.getAttribute("data-project");
      window.location.href = `project-${projectName}.html`;
    });
  });
});
