function createPixelGrid(tile, cols = 14, color = "var(--main-color)", glitch = false) {
  if (tile.querySelector(".pixel-grid")) return;
  const { offsetWidth: w, offsetHeight: h } = tile;
  const cellSize = w / cols;
  const rows = Math.ceil(h / cellSize);
  const pg = document.createElement("div");
  pg.className = "pixel-grid";
  Object.assign(pg.style, {
    position: "absolute", inset: "0",
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    zIndex: "var(--z-tile-overlay)",
    pointerEvents: "none"
  });
  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement("div");
    cell.style.backgroundColor = color;
    cell.style.opacity = "0";
    if (glitch) cell.dataset.glitchOpa = (Math.random() < 0.4 ? 0.4 + Math.random() * 0.3 : 0.85 + Math.random() * 0.1).toFixed(2);
    pg.appendChild(cell);
  }
  tile.appendChild(pg);
  return pg;
}

function initPixelHover(tile) {
  const overlay = tile.querySelector(".brand-hover-overlay");
  const text = tile.querySelector(".brand-hover-text");
  if (!overlay || !text) return;

  gsap.set(overlay, { opacity: 0 });
  gsap.set(text, { opacity: 0 });

  let active = false;

  function activate() {
    active = true;
    createPixelGrid(tile, 14);
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.killTweensOf(text);
    gsap.to(cells, { opacity: 0.95, duration: 0.03, stagger: { each: 0.001, from: "random" }, ease: "none" });
    gsap.to(text, { opacity: 1, duration: 0.1, ease: "none", delay: 0.12 });
  }

  function deactivate() {
    active = false;
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.killTweensOf(text);
    gsap.to(text, { opacity: 0, duration: 0.05, ease: "power2.in",
      onComplete: () => gsap.to(cells, { opacity: 0, duration: 0.01, stagger: { each: 0.0003, from: "random" }, ease: "none" })
    });
  }

  tile.addEventListener("click", () => {
    if (active) { deactivate(); tile.classList.remove("pixel-active"); }
    else {
      document.querySelectorAll("#brand-creation-grid .tile.pixel-active").forEach(t => {
        if (t !== tile) t.click();
      });
      activate(); tile.classList.add("pixel-active");
    }
  });
}

function initPixelHoverVariant(tile, variant) {
  const variants = {
    brandColor: { cols: 14, color: "var(--main-color)", from: "random", dur: 0.03,  each: 0.001,  outEach: 0.0003 },
    sweep:      { cols: 20, color: "var(--main-color)", from: "start",  dur: 0.02,  each: 0.0008, outEach: 0.0002 },
    burst:      { cols: 8,  color: "var(--main-color)", from: "center", dur: 0.04,  each: 0.008,  outEach: 0.004  },
    glitch:     { cols: 18, color: "var(--main-color)", from: "random", dur: 0.015, each: 0.0006, outEach: 0.0002, isGlitch: true, bgImage: "img/visuals/meta/meta-bg-opa.svg" },
    dissolve:   { cols: 16, color: "var(--main-color)", from: "random", dur: 0.25,  each: 0.004,  outEach: 0.002, ease: "power1.out" },
  };
  const v = { ...variants[variant] || variants.brandColor };
  if (tile.dataset.hoverColor) v.color = tile.dataset.hoverColor;
  else if (tile.dataset.pixelColor) v.color = tile.dataset.pixelColor;

  const logo = tile.querySelector("img");

  tile.addEventListener("mouseenter", () => {
    createPixelGrid(tile, v.cols, v.color, v.isGlitch);
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    if (logo) gsap.killTweensOf(logo);
    const staggerCfg = { each: v.each, from: v.from };
    if (v.axis) staggerCfg.axis = v.axis;
    const totalDur = v.each * cells.length + v.dur;
    const onFilled = () => {
      if (logo) gsap.to(logo, { duration: 0.2, ease: "none" });
    };
    if (v.isGlitch) {
      cells.forEach(c => gsap.to(c, { opacity: parseFloat(c.dataset.glitchOpa), duration: v.dur, delay: Math.random() * 0.15, ease: "none" }));
      if (v.bgImage) {
        let overlay = tile.querySelector(".pixel-bg-image");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.className = "pixel-bg-image";
          Object.assign(overlay.style, {
            position: "absolute", inset: "0",
            backgroundImage: `url(${v.bgImage})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: "0", zIndex: "var(--z-tile-text)", pointerEvents: "none"
          });
          tile.appendChild(overlay);
        }
        gsap.killTweensOf(overlay);
        gsap.to(overlay, { opacity: 0.75, duration: 0.4, delay: totalDur * 0.7, ease: "power1.out", onComplete: onFilled });
      } else {
        gsap.delayedCall(totalDur, onFilled);
      }
    } else {
      gsap.to(cells, { opacity: 0.95, duration: v.dur, stagger: staggerCfg, ease: v.ease || "none", onComplete: onFilled });
    }
  });

  tile.addEventListener("mouseleave", () => {
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    if (logo) { gsap.killTweensOf(logo); gsap.to(logo, { duration: 0.15, ease: "none", zIndex: "" }); }
    if (v.bgImage) {
      const overlay = tile.querySelector(".pixel-bg-image");
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.15, ease: "none" });
    }
    gsap.to(cells, { opacity: 0, duration: 0.01, stagger: { each: v.outEach, from: v.from }, ease: "none" });
  });
}

function initPixelHoverSimple(tile, locked) {
  if (tile._pixelHoverInit) return;
  tile._pixelHoverInit = true;
  const color = tile.dataset.hoverColor || tile.dataset.pixelColor || "var(--main-color)";

  if (locked) {
    const applyLocked = () => {
      if (!tile.offsetWidth) return requestAnimationFrame(applyLocked);
      createPixelGrid(tile, 14, color);
      tile.querySelectorAll(".pixel-grid div").forEach(c => c.style.opacity = "0.95");
    };
    applyLocked();
    return;
  }

  tile.addEventListener("mouseenter", () => {
    createPixelGrid(tile, 14, color);
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.to(cells, { opacity: 0.95, duration: 0.03, stagger: { each: 0.001, from: "random" }, ease: "none" });
  });

  tile.addEventListener("mouseleave", () => {
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.to(cells, { opacity: 0, duration: 0.01, stagger: { each: 0.0003, from: "random" }, ease: "none" });
  });
}

/* --- Gradient pixel helpers --- */

function resolveColor(raw) {
  const tmp = document.createElement("div");
  tmp.style.color = raw;
  document.body.appendChild(tmp);
  const rgb = getComputedStyle(tmp).color;
  tmp.remove();
  return rgb;
}

function parseRGB(str) {
  const m = str.match(/[\d.]+/g);
  return m ? m.map(Number) : [0, 0, 0];
}

function lerpColor(a, b, t) {
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
}

function createGradientPixelGrid(tile, cols, colorTop, colorBottom, mode) {
  if (tile.querySelector(".pixel-grid")) return;
  const { offsetWidth: w, offsetHeight: h } = tile;
  const cellSize = w / cols;
  const rows = Math.ceil(h / cellSize);
  const rgbTop = parseRGB(resolveColor(colorTop));
  const rgbBottom = parseRGB(resolveColor(colorBottom));
  const pg = document.createElement("div");
  pg.className = "pixel-grid";
  Object.assign(pg.style, {
    position: "absolute", inset: "0",
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    zIndex: "var(--z-tile-overlay)",
    pointerEvents: "none"
  });
  for (let i = 0; i < cols * rows; i++) {
    const row = Math.floor(i / cols);
    const t = rows > 1 ? row / (rows - 1) : 0;
    const cell = document.createElement("div");
    cell.style.opacity = "0";
    if (mode === "color-gradient") {
      cell.style.backgroundColor = lerpColor(rgbTop, rgbBottom, t);
      cell.dataset.targetOpa = "0.95";
    } else if (mode === "opacity-gradient") {
      cell.style.backgroundColor = colorTop;
      cell.dataset.targetOpa = (0.3 + 0.65 * t).toFixed(2);
    } else if (mode === "full-gradient") {
      cell.style.backgroundColor = lerpColor(rgbTop, rgbBottom, t);
      cell.dataset.targetOpa = (0.4 + 0.55 * t).toFixed(2);
    }
    pg.appendChild(cell);
  }
  tile.appendChild(pg);
  return pg;
}

function initPixelHoverGradient(tile, mode) {
  if (tile._pixelHoverInit) return;
  tile._pixelHoverInit = true;
  const color = tile.dataset.hoverColor || tile.dataset.pixelColor || "var(--main-color)";
  const colorEnd = "var(--blackest)";

  tile.addEventListener("mouseenter", () => {
    createGradientPixelGrid(tile, 14, color, colorEnd, mode);
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    cells.forEach(c => {
      gsap.to(c, { opacity: parseFloat(c.dataset.targetOpa), duration: 0.03, delay: Math.random() * 0.05, ease: "none" });
    });
  });

  tile.addEventListener("mouseleave", () => {
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.to(cells, { opacity: 0, duration: 0.01, stagger: { each: 0.0003, from: "random" }, ease: "none" });
  });
}

function initGsapHovers() {
  const grid = document.getElementById("brand-creation-grid");
  if (grid) grid.querySelectorAll(".tile").forEach(initPixelHover);

  const isMobile = window.innerWidth <= 1024;

  const devGrid = document.getElementById("brand-development-grid");
  if (devGrid) devGrid.querySelectorAll(".tile, .tile-xl").forEach(t => { if (!isMobile) initPixelHoverSimple(t); });

  const pdGrid = document.getElementById("product-design-grid");
  if (pdGrid) pdGrid.querySelectorAll(".tile, .tile-xl").forEach(t => initPixelHoverSimple(t, isMobile));
}

window.initGsapHovers = initGsapHovers;
