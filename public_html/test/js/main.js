document.addEventListener("DOMContentLoaded", function () {
  // Cerrar sidebar al tocar el overlay
  const overlay = document.getElementById("menu-overlay");
  if (overlay) overlay.addEventListener("click", () => toggleSidebar());

  // Initialize language and UI
  window.switchLanguage(currentLang);

  // Leer ?tab= de la URL
  const urlTab = new URLSearchParams(window.location.search).get("tab");
  showContent(urlTab || "brand-creation");
});

window.switchLanguage = function (lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text && text !== key) el.innerHTML = text;
  });

  addCol4Panels();

  document.querySelectorAll("#lang-en, #lang-es").forEach((btn) => btn.classList.remove("active"));
  const btn = document.getElementById("lang-" + lang);
  if (btn) btn.classList.add("active");

  document.documentElement.lang = lang;
};

// Add panels to col-4 elements
function addCol4Panels() {
  document
    .querySelectorAll("#brand-creation .tile, #brand-creation .tile-xl")
    .forEach((tile) => {
      tile
        .querySelectorAll(".brand-hover-overlay, .brand-hover-text")
        .forEach((el) => el.remove());

      const labelData = tile.dataset.label ? JSON.parse(tile.dataset.label) : null;
      const content = (labelData && labelData[currentLang]) ||
        (labelData && labelData.es) || { name: "Project", industry: "Brand Design" };

      const overlay = document.createElement("div");
      overlay.className = "brand-hover-overlay";
      tile.appendChild(overlay);

      const text = document.createElement("div");
      text.className = "brand-hover-text";
      const tag = tile.dataset.tag ? `<span class="brand-hover-tags">${JSON.parse(tile.dataset.tag).map(t => `<span class="brand-hover-tag">#${t}</span>`).join('')}</span>` : '';
      text.innerHTML = `<strong>${content.name}</strong>${content.industry}${tag}`;
      tile.appendChild(text);
    });

  if (typeof window.initGsapHovers === "function") window.initGsapHovers();
}
function showContent(category) {
  const validTabs = ["brand-creation", "brand-development", "product-design"];
  if (!validTabs.includes(category)) category = "brand-creation";
  localStorage.setItem("activeTab", category);

  document.querySelectorAll(".sidebar-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === category);
  });

  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.toggle("tab-visible", tab.id === category);
    tab.classList.toggle("tab-hidden", tab.id !== category);
  });

  if (category === "brand-creation" && typeof brandCreationItems !== "undefined" && brandCreationItems.length) {
    renderBrandCreationGrid(brandCreationItems);
    requestAnimationFrame(() => addCol4Panels());
  }

  // Cerrar sidebar en mobile al seleccionar tab
  if (window.innerWidth <= 1024) {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.querySelector(".mobile-menu-toggle");
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      toggle?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", false);
    }
  }
}

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.querySelector(".mobile-menu-toggle");
  const overlay = document.getElementById("menu-overlay");

  sidebar.classList.toggle("open");
  const isOpen = sidebar.classList.contains("open");
  toggle.classList.toggle("open", isOpen);
  toggle.setAttribute("aria-expanded", isOpen);
  overlay.classList.toggle("active", isOpen);
}

function createBrandGuide(className) {
  const guide = document.createElement("div");
  guide.className = className;
  guide.setAttribute("aria-hidden", "true");
  return guide;
}

function createBrandLogo(logo) {
    const img = document.createElement("img");
    img.src = logo.src;
    img.alt = logo.alt || "";
    img.loading = logo.loading || "lazy";
    if (logo.className) img.className = logo.className;
    if (logo.logoSize) {
      img.style.setProperty("--logo-size", `min(${logo.logoSize}px, 100%)`);
      img.classList.add("logo-sized");
    }
    if (logo.invertLogo) img.style.filter = "brightness(0) invert(1)";
    return img;
}

function createBrandTile(tileConfig) {
  const tile = document.createElement("div");
  tile.className = tileConfig.tileClass;
  if (tileConfig.bgColor) tile.classList.add(tileConfig.bgColor);
  if (tileConfig.bgImage) {
    const uid = `tbg-${Math.random().toString(36).slice(2, 7)}`;
    tile.classList.add("tile-bg-image", uid);
    const s = document.createElement("style");
    s.textContent = `.${uid}::before { background-image: url(${tileConfig.bgImage}); }`;
    tile.appendChild(s);
  }
  if (tileConfig.label) tile.dataset.label = JSON.stringify(tileConfig.label);
  if (tileConfig.tag) tile.dataset.tag = tileConfig.tag;
  if (tileConfig.project) {
    tile.dataset.project = tileConfig.project;
    tile.classList.add("cursor-pointer");
    tile.addEventListener("click", () => {
      document.body.classList.add("fade-out");
      setTimeout(() => window.location.href = `project.html?p=${tileConfig.project}`, 300);
    });
  }

  const inner = document.createElement("div");
  inner.className = tileConfig.innerClass || "brand-grid-logo-wrap";

  if (!tileConfig.placeholder) {
    (tileConfig.logos || []).forEach((logo) => {
      inner.appendChild(createBrandLogo(logo));
    });
  }

  if (tileConfig.showLabel && tileConfig.label) {
    const content = tileConfig.label[currentLang] || tileConfig.label.es;
    const title = tileConfig.title?.[currentLang] || tileConfig.title?.es || "";
    const devInner = document.createElement("div");
    devInner.className = "d-flex flex-column justify-content-between h-100 w-100 p-2rem";
    const logoWrap = document.createElement("div");
    logoWrap.className = "d-flex justify-content-start align-items-start flex-grow-1";
    (tileConfig.logos || []).forEach(logo => logoWrap.appendChild(createBrandLogo(logo)));
    devInner.appendChild(logoWrap);
    const bottom = document.createElement("div");
    const h4 = document.createElement("h4");
    h4.className = "fw-bold mb-2 display-5";
    h4.textContent = title;
    const meta = document.createElement("div");
    meta.className = "d-flex gap-2";
    meta.textContent = content.industry;
    bottom.appendChild(h4);
    bottom.appendChild(meta);
    devInner.appendChild(bottom);
    tile.appendChild(devInner);
  } else {
    tile.appendChild(inner);
  }


  return tile;
}

function createBrandSingleItem(item) {
  const wrapper = document.createElement("article");
  wrapper.className = `brand-grid-item span-${item.span}`;

  const hGuide = createBrandGuide("guide-h-double-100");
  wrapper.appendChild(hGuide);

  if (item.guides && item.guides.includes("left")) {
    const vGuide = createBrandGuide("guide-v-double-100");
    wrapper.appendChild(vGuide);
  }

  const shell = document.createElement("div");
  shell.className = "brand-grid-shell position-relative";

  shell.appendChild(createBrandTile(item));
  wrapper.appendChild(shell);
  return wrapper;
}

function createBrandStackedItem(item) {
  const wrapper = document.createElement("article");
  wrapper.className = `brand-grid-item span-${item.span}`;

  const hGuide = createBrandGuide("guide-h-double-100");
  wrapper.appendChild(hGuide);

  if (item.guides && item.guides.includes("left")) {
    const vGuide = createBrandGuide("guide-v-double-100");
    wrapper.appendChild(vGuide);
  }

  const shell = document.createElement("div");
  shell.className = "brand-grid-shell position-relative";

  const stack = document.createElement("div");
  stack.className = "brand-grid-stack";

  (item.tiles || []).forEach((tileConfig) => {
    const slot = document.createElement("div");
    slot.className = "brand-grid-slot position-relative";

    slot.appendChild(createBrandTile(tileConfig));
    stack.appendChild(slot);
  });

  shell.appendChild(stack);
  wrapper.appendChild(shell);
  return wrapper;
}

function renderProductDesignGrid(items) {
    const container = document.getElementById("product-design-grid");
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item) => {
        const wrapper = document.createElement("article");
        wrapper.className = `brand-grid-item span-${item.span}`;
        wrapper.appendChild(createBrandGuide("guide-h-double-100"));
        wrapper.appendChild(createBrandGuide("guide-v-double-100"));

        const uid = `ph-${Math.random().toString(36).slice(2, 7)}`;
        const s = document.createElement("style");
        s.textContent = `.${uid}::before { background: ${item.hoverColor}; }`;

        const tile = document.createElement("div");
        tile.className = `tile tile-xl product-hover-custom ${uid}`;
        tile.appendChild(s);

        const inner = document.createElement("div");
        inner.className = "d-flex flex-column justify-content-between h-100 w-100 p-4";

        const logoWrap = document.createElement("div");
        logoWrap.className = "d-flex justify-content-start align-items-start flex-grow-1";
        const img = createBrandLogo({ src: item.src, loading: "lazy", alt: item.src, logoSize: item.logoSize });
        logoWrap.appendChild(img);
        inner.appendChild(logoWrap);

        const bottom = document.createElement("div");
        if (item.secondaryLogo) {
            const secImg = createBrandLogo({ src: item.secondaryLogo, className: "mb-3", loading: "lazy", alt: "", logoSize: item.secondaryLogoSize });
            bottom.appendChild(secImg);
        }
        const title = item.title?.[currentLang] || item.title?.es || "";
        const subtitle = item.subtitle?.[currentLang] || item.subtitle?.es || "";
        const h4 = document.createElement("h4");
        h4.className = "fw-bold mb-2 display-4";
        h4.textContent = title;
        bottom.appendChild(h4);
        const meta = document.createElement("div");
        meta.className = "d-flex gap-2";
        meta.textContent = [subtitle, item.year, item.tool].filter(Boolean).join(" / ");
        bottom.appendChild(meta);
        inner.appendChild(bottom);

        tile.appendChild(inner);
        wrapper.appendChild(tile);
        container.appendChild(wrapper);
    });
}

function renderBrandCreationGrid(items, containerId = "brand-creation-grid") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item) => {
        const element = item.layout === "stacked"
            ? createBrandStackedItem(item)
            : createBrandSingleItem(item);
        container.appendChild(element);
    });
}


window.addCol4Panels = addCol4Panels;
