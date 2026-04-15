// Custom cursor
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.textContent = '↗';
  document.body.appendChild(dot);

  let mx = -100, my = -100, rotation = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) rotate(${rotation}deg)`;
  });

  const SELECTORS = 'a, button, .tile, .tile-xl, [class*="cursor-pointer"]';
  const TILE_SELECTORS = '.tile, .tile-xl';

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
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) rotate(${rotation}deg)`;
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(SELECTORS) && !e.relatedTarget?.closest(SELECTORS)) {
      rotation = 0;
      dot.style.color = '';
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) rotate(${rotation}deg)`;
    }
  });
})();
