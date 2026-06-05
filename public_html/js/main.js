let _dataReady = false;
let _resolveData;
const dataReadyPromise = new Promise(r => { _resolveData = r; });
window.signalDataReady = () => { _dataReady = true; _resolveData(); };

const _videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      if (!video.src) {
        video.src = video.dataset.src;
        video.play();
      }
      _videoObserver.unobserve(video);
    }
  });
}, { rootMargin: "200px" });

const _bgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("tile-bg-loaded");
      _bgObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: "300px" });

document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("menu-overlay");
  if (overlay) overlay.addEventListener("click", () => toggleSidebar());
  initSwipeClose();
  initScrollToggle();

  window.switchLanguage(currentLang);

  const hasGridTabs = document.getElementById("brand-creation");
  if (hasGridTabs) {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    showContent(urlTab || "brand-creation", true);
  }
});

window.switchLanguage = function (lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text && text !== key) el.innerHTML = text;
  });

  const activeTab = localStorage.getItem('activeTab') || 'brand-creation';
  updateFooter(activeTab, true);
  if (activeTab === 'brand-creation' && typeof brandCreationItems !== "undefined" && brandCreationItems.length) {
    renderBrandCreationGrid(brandCreationItems);
    requestAnimationFrame(() => addCol4Panels());
  } else if (activeTab === 'brand-development' && typeof brandDevItems !== "undefined" && brandDevItems.length) {
    renderBrandCreationGrid(brandDevItems, "brand-development-grid");
    if (typeof window.initGsapHovers === "function") window.initGsapHovers();
  } else if (activeTab === 'product-design' && typeof brandPdItems !== "undefined" && brandPdItems.length) {
    renderProductDesignGrid(brandPdItems);
  } else {
    addCol4Panels();
  }

  document.querySelectorAll("#lang-en, #lang-es").forEach((btn) => btn.classList.remove("active"));
  const btn = document.getElementById("lang-" + lang);
  if (btn) btn.classList.add("active");

  document.documentElement.lang = lang;
  updateVersionLabel();
};

// Add panels to col-4 elements
function addCol4Panels() {
  document
    .querySelectorAll("#brand-creation .tile:not(.tile-text), #brand-creation .tile-xl:not(.tile-text)")
    .forEach((tile) => {
      const wasActive = tile.classList.contains("pixel-active");
      tile
        .querySelectorAll(".brand-hover-overlay, .brand-hover-text, .pixel-grid")
        .forEach((el) => el.remove());
      if (wasActive) tile.classList.remove("pixel-active");

      const labelData = tile.dataset.label ? JSON.parse(tile.dataset.label) : null;
      const content = (labelData && (labelData[currentLang] || labelData.es)) || {};
      const displayName = content.name || tile.dataset.name || '';

      const overlay = document.createElement("div");
      overlay.className = "brand-hover-overlay";
      tile.appendChild(overlay);

      const text = document.createElement("div");
      text.className = "brand-hover-text";
      if (tile.dataset.labelSize) text.style.fontSize = tile.dataset.labelSize;
      if (tile.classList.contains("pixel-active")) text.style.opacity = "1";
      const img = tile.dataset.panelImage ? `<img src="${tile.dataset.panelImage}" class="brand-hover-image" alt="" loading="lazy"${tile.dataset.panelImageSize ? ` style="max-height:${tile.dataset.panelImageSize}px"` : ''}>` : '';
      const meta = (tile.dataset.workType || tile.dataset.year) ? `<div class="brand-hover-meta"><span class="brand-hover-worktype">${tile.dataset.workType || ''}</span><span class="brand-hover-year">${tile.dataset.year || ''}</span></div>` : '';
      const tagRaw = tile.dataset.tag ? JSON.parse(tile.dataset.tag) : null;
      const tagArr = tagRaw ? (Array.isArray(tagRaw) ? tagRaw : (tagRaw[currentLang] || tagRaw.es || [])) : [];
      const tagText = tagArr.join(' / ');
      text.innerHTML = `${meta}${displayName ? `<h2 class="brand-hover-name">${displayName}</h2>` : ''}${tagText ? `<span class="brand-hover-tags">${tagText}</span>` : ''}${content.industry ? `<span class="brand-hover-industry">${content.industry}</span>` : ''}${img}`;
      tile.appendChild(text);
    });

  if (typeof window.initGsapHovers === "function") window.initGsapHovers();
}
function showContent(category, isInitial) {
  const validTabs = ["brand-creation", "brand-development", "product-design"];
  if (!validTabs.includes(category)) category = "brand-creation";

  const currentTab = localStorage.getItem("activeTab");
  localStorage.setItem("activeTab", category);

  const sidebar = document.getElementById("sidebar");
  if (sidebar?.classList.contains("open")) toggleSidebar();

  document.querySelectorAll(".sidebar-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === category);
  });

  const contentArea = document.querySelector(".content-area");
  const needsFade = currentTab && currentTab !== category;

  function applyTab() {
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.toggle("d-block", tab.id === category);
      tab.classList.toggle("d-none", tab.id !== category);
    });
    if (category === "brand-creation" && typeof brandCreationItems !== "undefined" && brandCreationItems.length) {
      const grid = document.getElementById("brand-creation-grid");
      if (grid && !grid.hasChildNodes()) {
        renderBrandCreationGrid(brandCreationItems);
        requestAnimationFrame(() => addCol4Panels());
      }
    }
    contentArea.scrollTop = 0;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    updateFooter(category);
  }

  function reveal() {
    applyTab();
    contentArea.classList.remove("fading");
  }

  if (isInitial) {
    dataReadyPromise.then(() => {
      applyTab();
      setTimeout(() => contentArea.classList.remove("fading"), 50);
    });
  } else if (needsFade && contentArea) {
    contentArea.classList.add("fading");
    setTimeout(reveal, 500);
  } else {
    applyTab();
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
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    const items = sidebar.querySelectorAll(".sidebar-nav-btn, .contact-link, .lang-selector");
    items.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transition = "none";
      setTimeout(() => {
        el.style.transition = `opacity 0.3s ease ${i * 0.07}s`;
        el.style.opacity = "1";
      }, 20);
    });
  } else {
    const items = sidebar.querySelectorAll(".sidebar-nav-btn, .contact-link, .lang-selector");
    items.forEach(el => {
      el.style.opacity = "";
      el.style.transition = "";
    });
  }

  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const toggleContainer = document.querySelector(".mobile-menu-toggle-container");
  if (isTablet && toggleContainer) {
    toggleContainer.style.transition = "";
    toggleContainer.style.right = "";
  }
}

function initScrollToggle() {
  const el = document.querySelector(".mobile-menu-toggle");
  if (!el) return;
  const onScroll = () => el.classList.toggle("scrolled", document.body.scrollTop > 200);
  document.body.addEventListener("scroll", onScroll, { passive: true });
  el.addEventListener("click", () => requestAnimationFrame(() => el.classList.remove("scrolled")));
}

function initSwipeClose() {
  const sidebar = document.getElementById("sidebar");
  let startX = 0;
  sidebar.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  sidebar.addEventListener("touchend", e => {
    if (startX - e.changedTouches[0].clientX > 60) toggleSidebar();
  }, { passive: true });
}

function createDevInner(logos, title, metaText, arrowText, bottomLogos, showTool) {
  const inner = document.createElement("div");
  inner.className = "d-flex flex-column justify-content-between h-100 w-100 p-2rem";
  const logoWrap = document.createElement("div");
  logoWrap.className = "d-flex justify-content-start align-items-start flex-grow-1";
  logos.forEach(logo => logoWrap.appendChild(createBrandLogo(logo)));
  inner.appendChild(logoWrap);
  const arrow = document.createElement("div");
  arrow.className = "brand-dev-arrow d-flex align-items-center gap-2";
  if (showTool) {
    arrow.innerHTML = `${arrowText}<img src="img/visuals/logos/figma-logo.svg" class="brand-dev-tool-icon" alt="Figma" loading="lazy">`;
  } else {
    arrow.textContent = arrowText;
  }
  inner.appendChild(arrow);
  const bottom = document.createElement("div");
  if (bottomLogos) bottomLogos.forEach(logo => bottom.appendChild(createBrandLogo(logo)));
  const h2 = document.createElement("h2");
  h2.className = "fw-bold mb-2 display-5";
  h2.textContent = title;
  const meta = document.createElement("div");
  meta.className = "d-flex gap-2";
  meta.textContent = metaText;
  bottom.appendChild(h2);
  bottom.appendChild(meta);
  inner.appendChild(bottom);
  return inner;
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
  tile.className = tileConfig.tileClass || tileConfig.size || "tile";
  if (tileConfig.bgColor) tile.classList.add(tileConfig.bgColor);
  if (tileConfig.bgImage) {
    const uid = `tbg-${Math.random().toString(36).slice(2, 7)}`;
    tile.classList.add("tile-bg-image", uid);
    tile.dataset.bgImage = tileConfig.bgImage;
    let sheet = document.getElementById("tile-bg-styles");
    if (!sheet) {
      sheet = document.createElement("style");
      sheet.id = "tile-bg-styles";
      document.head.appendChild(sheet);
    }
    sheet.sheet.insertRule(`.${uid}.tile-bg-loaded::before { background-image: url(${tileConfig.bgImage}); }`, sheet.sheet.cssRules.length);
    _bgObserver.observe(tile);
  }
  if (tileConfig.bgVideo) {
    tile.classList.add("tile-has-video");
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.dataset.src = tileConfig.bgVideo;
    video.className = "tile-bg-video";
    tile.appendChild(video);
    _videoObserver.observe(video);
  }
  if (tileConfig.label) tile.dataset.label = JSON.stringify(tileConfig.label);
  if (tileConfig.name) tile.dataset.name = tileConfig.name;
  if (tileConfig.tag) tile.dataset.tag = tileConfig.tag;
  if (tileConfig.labelSize) tile.dataset.labelSize = tileConfig.labelSize;
  if (tileConfig.panelImage) tile.dataset.panelImage = tileConfig.panelImage;
  if (tileConfig.panelImageSize) tile.dataset.panelImageSize = tileConfig.panelImageSize;
  if (tileConfig.workType) tile.dataset.workType = tileConfig.workType;
  if (tileConfig.year) tile.dataset.year = tileConfig.year;
  if (tileConfig.activeClient) {
    const badge = document.createElement("span");
    badge.className = "active-client-badge";
    badge.innerHTML = (t("activeClient") || "cliente\nactivo").replace("\n", "<br>");
    tile.appendChild(badge);
  }

  if (tileConfig.project) {
    tile.dataset.project = tileConfig.project;
    tile.classList.add("cursor-pointer");
    tile.addEventListener("click", () => {
      const ca = document.querySelector(".content-area");
      ca.classList.add("fading");
      setTimeout(() => { window.location.href = `project.html?p=${tileConfig.project}`; }, 500);
    });
  }

  if (tileConfig.pixelColor) tile.dataset.pixelColor = tileConfig.pixelColor;
  if (tileConfig.hoverColor) tile.dataset.hoverColor = tileConfig.hoverColor;

  if (tileConfig.type === "text") {
    tile.classList.add("tile-text");
    const p = document.createElement("p");
    p.className = "tile-text-content";
    if (tileConfig.textSize) p.style.fontSize = tileConfig.textSize;
    p.innerHTML = tileConfig.text?.[currentLang] || tileConfig.text?.es || "";
    tile.appendChild(p);
    if (tileConfig.panelImage) {
      const img = document.createElement("img");
      img.src = tileConfig.panelImage;
      img.className = "tile-text-image";
      img.alt = "";
      img.loading = "lazy";
      tile.appendChild(img);
    }
    return tile;
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
    tile.appendChild(createDevInner(tileConfig.logos || [], title, content.industry, "→", null, false));
  } else {
    tile.appendChild(inner);
  }

  return tile;
}

function createBrandWrapper(item) {
  const wrapper = document.createElement("article");
  wrapper.className = `brand-grid-item span-${item.span}`;
  wrapper.appendChild(createBrandGuide("guide-h-double-100"));
  if (item.guides && item.guides.includes("left")) wrapper.appendChild(createBrandGuide("guide-v-double-100"));
  const shell = document.createElement("div");
  shell.className = "brand-grid-shell position-relative";
  wrapper.appendChild(shell);
  return { wrapper, shell };
}

function createBrandSingleItem(item) {
  const { wrapper, shell } = createBrandWrapper(item);
  shell.appendChild(createBrandTile(item));
  return wrapper;
}

function createBrandStackedItem(item) {
  const { wrapper, shell } = createBrandWrapper(item);
  const stack = document.createElement("div");
  stack.className = "brand-grid-stack";
  (item.tiles || []).forEach((tileConfig) => {
    const slot = document.createElement("div");
    slot.className = "brand-grid-slot position-relative";
    slot.appendChild(createBrandTile(tileConfig));
    stack.appendChild(slot);
  });
  shell.appendChild(stack);
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

        const tile = document.createElement("div");
        tile.className = "tile tile-xl";
        if (item.hoverColor) {
          tile.dataset.hoverColor = item.hoverColor;
          tile.style.setProperty("--tile-hover-color", item.hoverColor);
        }
        if (item.URLFigma) {
          tile.classList.add("cursor-pointer");
          tile.addEventListener("click", () => window.open(item.URLFigma, "_blank"));
        }

        const title = item.title?.[currentLang] || item.title?.es || "";
        const subtitle = item.subtitle?.[currentLang] || item.subtitle?.es || "";
        const metaText = [subtitle, item.tool].filter(Boolean).join(" / ");
        const logos = [{ src: item.src, loading: "lazy", alt: item.src, logoSize: item.logoSize }];
        const bottomLogos = item.secondaryLogo ? [{ src: item.secondaryLogo, className: "mb-3", loading: "lazy", alt: "", logoSize: item.secondaryLogoSize }] : null;
        tile.appendChild(createDevInner(logos, title, metaText, "↗", bottomLogos, true));
        if (item.year) {
          const yearEl = document.createElement("span");
          yearEl.className = "pd-tile-year";
          yearEl.textContent = item.year;
          tile.appendChild(yearEl);
        }
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
