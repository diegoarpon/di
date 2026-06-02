// Custom cursor
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (document.documentElement.classList.contains('safari-browser')) return;

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.textContent = '↗';
  document.body.appendChild(dot);

  let mx = -100, my = -100, rotation = 0, rafPending = false;

  function updateDot() {
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-100%, -50%) rotate(${rotation}deg)`;
    rafPending = false;
  }

  function scheduleUpdate() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateDot);
    }
  }

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    scheduleUpdate();
  });

  const SELECTORS = 'a, button, .tile:not(.tile-text), .tile-xl:not(.tile-text), [class*="cursor-pointer"]';
  const TILE_SELECTORS = '.tile:not(.tile-text), .tile-xl:not(.tile-text)';

  document.addEventListener('click', e => {
    const tile = e.target.closest(TILE_SELECTORS);
    if (tile?.closest('#brand-creation-grid')) {
      dot.style.color = tile.classList.contains('pixel-active') ? 'var(--whitest)' : 'var(--main-color)';
    }
  });

  document.addEventListener('mouseover', e => {
    if (e.target.closest(SELECTORS)) {
      rotation = 45;
      const tile = e.target.closest(TILE_SELECTORS);
      if (tile) {
        const inBrandCreation = tile.closest('#brand-creation-grid');
        dot.style.color = (inBrandCreation && !tile.classList.contains('pixel-active')) ? 'var(--main-color)' : 'var(--whitest)';
      }
      scheduleUpdate();
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(SELECTORS) && !e.relatedTarget?.closest(SELECTORS)) {
      rotation = 0;
      dot.style.color = '';
      scheduleUpdate();
    }
  });
})();
