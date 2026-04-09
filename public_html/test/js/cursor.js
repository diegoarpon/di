// Custom cursor
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const wrap = document.createElement('div');
  wrap.id = 'cursor-wrap';
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.textContent = '↗';

  wrap.appendChild(dot);
  document.body.appendChild(wrap);

  let rotation = 0;

  window.addEventListener('mousemove', e => {
    dot.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%)) rotate(${rotation}deg)`;
  });

  const SELECTORS = 'a, button, .tile, .tile-xl, [class*="cursor-pointer"]';
  const TILE_SELECTORS = '.tile, .tile-xl';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(SELECTORS)) {
      rotation = 45;
      if (e.target.closest(TILE_SELECTORS)) dot.style.color = 'var(--whitest)';
      dot.style.transform = dot.style.transform.replace(/rotate\([^)]+\)/, `rotate(${rotation}deg)`);
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(SELECTORS) && !e.relatedTarget?.closest(SELECTORS)) {
      rotation = 0;
      dot.style.color = '';
      dot.style.transform = dot.style.transform.replace(/rotate\([^)]+\)/, `rotate(${rotation}deg)`);
    }
  });
})();
