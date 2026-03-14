function createPixelGrid(tile) {
  if (tile.querySelector(".pixel-grid")) return;
  const COLS = 14, ROWS = 14;
  const pg = document.createElement("div");
  pg.className = "pixel-grid";
  Object.assign(pg.style, {
    position: "absolute", inset: "0",
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
    zIndex: "var(--z-tile-overlay)",
    pointerEvents: "none"
  });
  for (let i = 0; i < COLS * ROWS; i++) {
    const cell = document.createElement("div");
    cell.style.backgroundColor = "var(--main-color)";
    cell.style.opacity = "0";
    cell.style.aspectRatio = "1";
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

  tile.addEventListener("mouseenter", () => {
    createPixelGrid(tile);
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.killTweensOf(text);
    gsap.to(cells, {
      opacity: 0.95,
      duration: 0.03,
      stagger: { each: 0.001, from: "random" },
      ease: "none"
    });
    gsap.to(text, { opacity: 1, duration: 0.1, ease: "none", delay: 0.12 });
  });

  tile.addEventListener("mouseleave", () => {
    const cells = Array.from(tile.querySelectorAll(".pixel-grid div"));
    gsap.killTweensOf(cells);
    gsap.killTweensOf(text);
    gsap.to(text, { opacity: 0, duration: 0.05, ease: "power2.in",
      onComplete: () => gsap.to(cells, {
        opacity: 0,
        duration: 0.01,
        stagger: { each: 0.0003, from: "random" },
        ease: "none"
      })
    });
  });
}

function initGsapHovers() {
  const grid = document.getElementById("brand-creation-grid");
  if (!grid) return;
  grid.querySelectorAll(".tile").forEach(initPixelHover);
}

window.initGsapHovers = initGsapHovers;
