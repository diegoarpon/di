// ── State ────────────────────────────────────────────────────────────────────

const state = {
  'brand-creation':    { handle: null, data: null, dirty: false, key: 'tiles' },
  'brand-development': { handle: null, data: null, dirty: false, key: 'brandDevelopment' },
  'product-design':    { handle: null, data: null, dirty: false, key: 'productDesign' },
};

let activeTab = 'brand-creation';
let selectedIdx = null;
let dirHandle = null;
let imgCatalog = { backgrounds: [], logos: [], visuals: [], videos: [] };
let dragSrc = null;

const FILE_MAP = {
  'brand-creation':    'brand-creation.json',
  'brand-development': 'brand-development.json',
  'product-design':    'product-design.json',
};

// ── IndexedDB ────────────────────────────────────────────────────────────────

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('reorder-tool', 2);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles');
    };
    req.onsuccess = e => res(e.target.result);
    req.onerror = e => rej(e.target.error);
  });
}

async function dbPut(key, val) {
  const db = await openDB();
  const tx = db.transaction('handles', 'readwrite');
  tx.objectStore('handles').put(val, key);
}

async function dbGet(key) {
  const db = await openDB();
  return new Promise(res => {
    const tx = db.transaction('handles', 'readonly');
    const req = tx.objectStore('handles').get(key);
    req.onsuccess = e => res(e.target.result || null);
    req.onerror = () => res(null);
  });
}

// ── Directory picker ─────────────────────────────────────────────────────────

document.getElementById('btn-open-dir').addEventListener('click', pickDir);

async function pickDir() {
  if (!window.showDirectoryPicker) { toast('Usá Chrome o Edge.', 'error'); return; }
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await initFromDir(handle);
    await dbPut('dir', handle);
  } catch(e) {
    if (e.name !== 'AbortError') toast('Error: ' + e.message, 'error');
  }
}

async function initFromDir(handle) {
  dirHandle = handle;
  await buildImgCatalog(handle);
  await loadAllJSONs(handle);
  toast('Carpeta cargada', 'success');
}

async function loadAllJSONs(root) {
  for (const [tab, filename] of Object.entries(FILE_MAP)) {
    try {
      const fileHandle = await root.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const parsed = JSON.parse(await file.text());
      state[tab].handle = fileHandle;
      state[tab].data = parsed;
      state[tab].dirty = false;
      const s = state[tab];
      const items = parsed[s.key] || [];
      document.getElementById('count-' + tab.replace('brand-', 'b').replace('product-', 'p').replace('creation','c').replace('development','d').replace('design','d')).textContent = items.length;
      document.querySelector('[data-tab="' + tab + '"]').classList.remove('not-loaded');
    } catch(e) {
      console.warn('No se pudo cargar', filename, e);
    }
  }
  updateCounts();
  renderGrid(activeTab);
}

function updateCounts() {
  const map = { 'brand-creation': 'count-bc', 'brand-development': 'count-bd', 'product-design': 'count-pd' };
  for (const [tab, id] of Object.entries(map)) {
    const s = state[tab];
    const el = document.getElementById(id);
    if (s.data) {
      el.textContent = (s.data[s.key] || []).length;
      document.querySelector('[data-tab="' + tab + '"]').classList.remove('not-loaded');
    }
  }
}

// ── Image catalog ─────────────────────────────────────────────────────────────

async function buildImgCatalog(root) {
  imgCatalog = { backgrounds: [], logos: [], visuals: [], videos: [] };
  try {
    const imgDir = await root.getDirectoryHandle('img');
    await walkDir(imgDir, 'img');
  } catch(e) { console.warn('No se encontró img/', e); }
}

async function walkDir(handle, path) {
  const IMG = new Set(['.webp','.png','.jpg','.jpeg','.svg','.gif']);
  const VID = new Set(['.mp4','.webm']);
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'directory') {
      await walkDir(entry, path + '/' + name);
    } else {
      const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
      const full = path + '/' + name;
      if (VID.has(ext)) { imgCatalog.videos.push(full); }
      else if (IMG.has(ext)) {
        if (path.includes('/backgrounds') || path.includes('/new_visuals')) imgCatalog.backgrounds.push(full);
        else if (path.includes('/logos')) imgCatalog.logos.push(full);
        else imgCatalog.visuals.push(full);
      }
    }
  }
}

async function buildImgCatalog(root) {
  imgCatalog = { backgrounds: [], logos: [], visuals: [], videos: [] };
  try {
    const imgDir = await root.getDirectoryHandle('img');
    await walkDir(imgDir, 'img');
  } catch(e) { console.warn('No se encontró img/', e); }
  Object.keys(imgCatalog).forEach(k => imgCatalog[k].sort((a, b) => a.split('/').pop().localeCompare(b.split('/').pop())));
}

// ── Restore on load ───────────────────────────────────────────────────────────

window.addEventListener('load', async () => {
  const saved = await dbGet('dir');
  if (!saved) return;
  try {
    const perm = await saved.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') { await initFromDir(saved); }
    else {
      // Mostrar botón para re-solicitar permiso
      document.getElementById('btn-open-dir').textContent = 'Reconectar carpeta';
    }
  } catch(e) { /* ignorar */ }
});

// ── Tabs ──────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.panel-wrap').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + activeTab).classList.add('active');
    closePanel();
    renderGrid(activeTab);
    updateSaveBtn();
  });
});

// ── Save ──────────────────────────────────────────────────────────────────────

document.getElementById('btn-save').addEventListener('click', saveAll);

async function saveAll() {
  let saved = 0;
  for (const [tab, s] of Object.entries(state)) {
    if (!s.dirty || !s.handle || !s.data) continue;
    try {
      (s.data[s.key] || []).forEach((item, i) => { item.order = i + 1; });
      const writable = await s.handle.createWritable();
      await writable.write(JSON.stringify(s.data, null, 2) + '\n');
      await writable.close();
      s.dirty = false;
      saved++;
    } catch(e) {
      toast('Error guardando ' + FILE_MAP[tab] + ': ' + e.message, 'error');
    }
  }
  if (saved) { updateSaveBtn(); toast('Guardado', 'success'); }
}

function markDirty() {
  state[activeTab].dirty = true;
  updateSaveBtn();
  scheduleAutoSave();
}

let autoSaveTimer = null;
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveAll, 1000);
}

function updateSaveBtn() {
  const anyDirty = Object.values(state).some(s => s.dirty);
  const anyLoaded = Object.values(state).some(s => s.handle);
  const btn = document.getElementById('btn-save');
  const status = document.getElementById('save-status');
  btn.disabled = !anyDirty;
  if (!anyLoaded) { status.textContent = ''; status.className = 'save-status'; }
  else if (anyDirty) { status.textContent = '● cambios sin guardar'; status.className = 'save-status unsaved'; }
  else { status.textContent = '✓ guardado'; status.className = 'save-status'; }
}

// ── Render grid ───────────────────────────────────────────────────────────────

function renderGrid(tab) {
  const wrap = document.getElementById('panel-' + tab);
  const s = state[tab];

  if (!s.data) {
    wrap.innerHTML = '<div class="empty-state"><div class="icon">◆</div><p>Abrí la carpeta <strong>public_html/</strong> para empezar.</p></div>';
    return;
  }

  const items = s.data[s.key] || [];

  const hint = document.createElement('p');
  hint.className = 'grid-hint';
  hint.textContent = 'Arrastrá para reordenar · click para editar · ' + items.length + ' tiles';

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  items.forEach((item, i) => grid.appendChild(makeCard(item, i, tab)));

  wrap.innerHTML = '';
  wrap.appendChild(hint);
  wrap.appendChild(grid);
}

function makeCard(item, idx, tab) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.dataset.idx = idx;
  if (idx === selectedIdx) card.classList.add('selected');

  const bg = document.createElement('div');
  bg.className = 'card-bg';
  const bgSrc = item.bgImage || '';
  const logoSrc = item.src || '';
  if (bgSrc && !bgSrc.endsWith('.mp4')) {
    bg.style.backgroundImage = 'url(public_html/' + bgSrc + ')';
  } else if (!bgSrc && item.bgColor) {
    bg.style.backgroundColor = item.bgColor;
  }
  card.appendChild(bg);

  if (!bgSrc && !logoSrc) {
    const ph = document.createElement('div');
    ph.className = 'card-placeholder';
    ph.textContent = '◆';
    card.appendChild(ph);
  }

  const logoWrap = document.createElement('div');
  logoWrap.className = 'card-logo-wrap';
  logoWrap.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;padding:16px;';
  if (!logoSrc) logoWrap.style.display = 'none';
  const logoImg = document.createElement('img');
  logoImg.src = logoSrc ? 'public_html/' + logoSrc : '';
  logoImg.style.cssText = 'max-width:80%;max-height:50%;object-fit:contain;filter:brightness(0) invert(1);opacity:.9;';
  logoWrap.appendChild(logoImg);
  card.appendChild(logoWrap);

  const order = document.createElement('div');
  order.className = 'card-order';
  order.textContent = idx + 1;
  card.appendChild(order);

  const info = document.createElement('div');
  info.className = 'card-info';
  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = getItemName(item);
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.textContent = getItemMeta(item, tab);
  info.appendChild(name);
  info.appendChild(meta);
  card.appendChild(info);

  card.addEventListener('click', (e) => {
    if (card.classList.contains('dragging')) return;
    selectedIdx = idx;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    openPanel(item, idx, tab);
  });

  card.addEventListener('dragstart', onDragStart);
  card.addEventListener('dragover', onDragOver);
  card.addEventListener('dragleave', onDragLeave);
  card.addEventListener('drop', onDrop);
  card.addEventListener('dragend', onDragEnd);

  return card;
}

function getItemName(item) {
  return item.label?.name || item.label?.es?.name || item.alt || item.title?.es || '—';
}

function getItemMeta(item, tab) {
  if (tab === 'product-design') return item.subtitle?.es || item.year || '';
  return [item.workType || item.title?.es || '', item.year || ''].filter(Boolean).join(' · ');
}

// ── Drag & Drop ───────────────────────────────────────────────────────────────

function onDragStart(e) {
  dragSrc = this;
  setTimeout(() => this.classList.add('dragging'), 0);
  e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== dragSrc) this.classList.add('drag-over');
}
function onDragLeave() { this.classList.remove('drag-over'); }
function onDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (this === dragSrc) return;
  const from = parseInt(dragSrc.dataset.idx);
  const to = parseInt(this.dataset.idx);
  const items = state[activeTab].data[state[activeTab].key];
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);
  selectedIdx = null;
  closePanel();
  markDirty();
  renderGrid(activeTab);
  updateCounts();
}
function onDragEnd() {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('dragging', 'drag-over'));
}

// ── Editor Panel ──────────────────────────────────────────────────────────────

document.getElementById('panel-close').addEventListener('click', closePanel);

document.getElementById('grid-area').addEventListener('click', e => {
  if (document.getElementById('editor-panel').classList.contains('open') && !e.target.closest('.card')) closePanel();
});

function closePanel() {
  document.getElementById('panel-body').innerHTML = '';
  document.getElementById('panel-title').textContent = 'Seleccioná un tile para editar';
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
  selectedIdx = null;
}

function openPanel(item, idx, tab) {
  const title = document.getElementById('panel-title');
  const body = document.getElementById('panel-body');
  title.textContent = getItemName(item) || 'Tile ' + (idx + 1);
  body.innerHTML = '';
  if (tab === 'brand-creation') body.appendChild(buildBCForm(item, idx));
  else if (tab === 'brand-development') body.appendChild(buildBDForm(item, idx));
  else body.appendChild(buildPDForm(item, idx));
}

function onChange(item, key, value) {
  item[key] = value;
  markDirty();
}

function onChangeRoot(item, key, value) {
  item[key] = value;
  markDirty();
  updateCardFromItem(item);
}

function updateCardFromItem(item) {
  const card = document.querySelector('.card.selected');
  if (!card) return;
  const nameEl = card.querySelector('.card-name');
  if (nameEl) nameEl.textContent = getItemName(item);
  const bgEl = card.querySelector('.card-bg');
  if (bgEl) {
    if (item.bgImage) {
      bgEl.style.backgroundImage = 'url(public_html/' + item.bgImage + ')';
      bgEl.style.backgroundColor = '';
    } else if (item.bgColor) {
      bgEl.style.backgroundImage = '';
      bgEl.style.backgroundColor = item.bgColor;
    } else {
      bgEl.style.backgroundImage = '';
      bgEl.style.backgroundColor = '';
    }
  }
  const logoWrap = card.querySelector('.card-logo-wrap');
  if (logoWrap) {
    if (item.src) {
      logoWrap.style.display = 'flex';
      const img = logoWrap.querySelector('img');
      if (img) img.src = 'public_html/' + item.src;
    } else {
      logoWrap.style.display = 'none';
    }
  }
}

// ── Field builders ────────────────────────────────────────────────────────────

function field(label, input, hint) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  if (hint) {
    const help = document.createElement('span');
    help.className = 'field-help';
    help.textContent = '?';
    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.textContent = hint;
    help.appendChild(tip);
    lbl.appendChild(help);
  }
  wrap.appendChild(lbl);
  wrap.appendChild(input);
  return wrap;
}

function textInput(item, key, label, placeholder, hint, changeFn) {
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = item[key] || '';
  if (placeholder) inp.placeholder = placeholder;
  inp.addEventListener('input', () => (changeFn || onChange)(item, key, inp.value));
  return field(label, inp, hint);
}

function numberInput(item, key, label, hint, changeFn) {
  const inp = document.createElement('input');
  inp.type = 'number';
  inp.value = item[key] || 0;
  inp.addEventListener('input', () => (changeFn || onChange)(item, key, parseFloat(inp.value) || 0));
  return field(label, inp, hint);
}

function toggle(item, key, label, hint) {
  const row = document.createElement('div');
  row.className = 'toggle-row';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  if (hint) {
    const help = document.createElement('span');
    help.className = 'field-help';
    help.textContent = '?';
    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.textContent = hint;
    help.appendChild(tip);
    lbl.appendChild(help);
  }
  const tog = document.createElement('label');
  tog.className = 'toggle';
  const inp = document.createElement('input');
  inp.type = 'checkbox';
  inp.checked = !!item[key];
  inp.addEventListener('change', () => onChange(item, key, inp.checked));
  const slider = document.createElement('span');
  slider.className = 'toggle-slider';
  tog.appendChild(inp);
  tog.appendChild(slider);
  row.appendChild(lbl);
  row.appendChild(tog);
  return row;
}

function imgPicker(item, key, label, catalog, rootItem, hint) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  if (hint) {
    const help = document.createElement('span');
    help.className = 'field-help';
    help.textContent = '?';
    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.textContent = hint;
    help.appendChild(tip);
    lbl.appendChild(help);
  }
  wrap.appendChild(lbl);

  const picker = document.createElement('div');
  picker.className = 'img-picker';

  const preview = document.createElement('div');
  preview.className = 'img-preview';
  updatePreview(preview, item[key]);

  const row = document.createElement('div');
  row.className = 'img-picker-row';

  const sel = document.createElement('select');
  const emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = '— ninguna —';
  sel.appendChild(emptyOpt);
  catalog.forEach(path => {
    const opt = document.createElement('option');
    opt.value = path;
    opt.textContent = path.split('/').pop();
    opt.selected = path === item[key];
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    item[key] = sel.value;
    markDirty();
    updatePreview(preview, sel.value);
    // solo actualizar card si es el item raíz
    if (!rootItem) updateCardFromItem(item);
  });

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn btn-sm';
  clearBtn.textContent = '✕';
  clearBtn.addEventListener('click', () => {
    sel.value = '';
    item[key] = '';
    markDirty();
    updatePreview(preview, '');
    if (!rootItem) updateCardFromItem(item);
  });

  row.appendChild(sel);
  row.appendChild(clearBtn);
  picker.appendChild(preview);
  picker.appendChild(row);
  wrap.appendChild(picker);
  return wrap;
}

function updatePreview(el, src) {
  el.innerHTML = '';
  el.style.backgroundImage = '';
  if (!src) { el.textContent = 'sin imagen'; return; }
  if (src.endsWith('.mp4') || src.endsWith('.webm')) {
    el.textContent = '▶ ' + src.split('/').pop();
    return;
  }
  const img = document.createElement('img');
  img.src = 'public_html/' + src;
  img.style.maxHeight = '70px';
  img.style.objectFit = 'contain';
  el.appendChild(img);
}

function i18nField(item, key, label) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';
  const title = document.createElement('div');
  title.className = 'field-group-title';
  title.textContent = label;
  wrap.appendChild(title);
  if (!item[key]) item[key] = { es: '', en: '' };
  ['es', 'en'].forEach(lang => {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = item[key][lang] || '';
    inp.placeholder = lang.toUpperCase();
    inp.style.marginBottom = '6px';
    inp.addEventListener('input', () => { item[key][lang] = inp.value; markDirty(); });
    const f = document.createElement('div');
    f.className = 'field';
    const lbl = document.createElement('label');
    lbl.textContent = lang.toUpperCase();
    f.appendChild(lbl);
    f.appendChild(inp);
    wrap.appendChild(f);
  });
  return wrap;
}

function tagsField(item) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';
  const title = document.createElement('div');
  title.className = 'field-group-title';
  title.textContent = 'Tags';
  wrap.appendChild(title);
  if (!item.tag) item.tag = { es: [], en: [] };

  ['es', 'en'].forEach(lang => {
    const lbl = document.createElement('label');
    lbl.className = 'field';
    lbl.style.marginBottom = '4px';
    lbl.textContent = lang.toUpperCase();
    wrap.appendChild(lbl);

    const list = document.createElement('div');
    list.className = 'tags-list';
    const renderTags = () => {
      list.innerHTML = '';
      (item.tag[lang] || []).forEach((tag, i) => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        chip.textContent = tag;
        const del = document.createElement('button');
        del.textContent = '×';
        del.addEventListener('click', () => {
          item.tag[lang].splice(i, 1);
          markDirty();
          renderTags();
        });
        chip.appendChild(del);
        list.appendChild(chip);
      });
    };
    renderTags();

    const addRow = document.createElement('div');
    addRow.className = 'tag-add-row';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Nuevo tag...';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => {
      const val = inp.value.trim();
      if (!val) return;
      if (!item.tag[lang]) item.tag[lang] = [];
      item.tag[lang].push(val);
      inp.value = '';
      markDirty();
      renderTags();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });
    addRow.appendChild(inp);
    addRow.appendChild(addBtn);
    wrap.appendChild(list);
    wrap.appendChild(addRow);
  });
  return wrap;
}

function sectionTitle(text) {
  const el = document.createElement('div');
  el.className = 'field-group-title';
  el.style.marginBottom = '12px';
  el.style.paddingBottom = '8px';
  el.style.borderBottom = '1px solid var(--border)';
  el.textContent = text;
  return el;
}

function group(title, ...children) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';
  wrap.appendChild(sectionTitle(title));
  children.forEach(c => c && wrap.appendChild(c));
  return wrap;
}

// ── Brand Creation form ───────────────────────────────────────────────────────

function buildBCForm(item, idx) {
  const frag = document.createDocumentFragment();
  const bgImgs = [...imgCatalog.backgrounds, ...imgCatalog.videos];

  frag.appendChild(group('General',
    textInput(item, 'year', 'Año', '', 'Año del proyecto. Aparece en el hover overlay.', onChangeRoot),
    textInput(item, 'project', 'Project ID', '', 'Si está definido, el tile es clickeable y navega a project.html?p=ID.'),
    textInput(item, 'projectLink', 'Project link', '', 'URL directa. Activa la flecha ↗ en el hover overlay.'),
  ));

  frag.appendChild(group('Tamaño',
    (() => {
      const sel = document.createElement('select');
      ['tile-xl', 'tile'].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v; o.selected = item.size === v;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => onChangeRoot(item, 'size', sel.value));
      return field('Size', sel, 'Altura del tile. tile-xl es más alto.');
    })(),
    (() => {
      const sel = document.createElement('select');
      [4, 6, 8].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = 'span ' + v; o.selected = item.span === v;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => onChangeRoot(item, 'span', parseInt(sel.value)));
      return field('Span', sel, 'Ancho en columnas. 4 = mitad, 6 = dos tercios, 8 = completo.');
    })(),
  ));

  frag.appendChild(group('Fondo',
    textInput(item, 'bgColor', 'BG color', '#1a1a2e', 'Color de fondo cuando no hay bgImage. Acepta hex, rgb() o var(--variable).'),
    imgPicker(item, 'bgImage', 'Background image', bgImgs, false, 'Imagen de fondo del tile.'),
    imgPicker(item, 'bgVideo', 'Background video', imgCatalog.videos, false, 'Video en loop. Reemplaza bgImage si está definido.'),
    toggle(item, 'overlay', 'Overlay negro', 'Aplica un overlay negro sobre el fondo (imagen, video o color).'),
    (() => {
      const inp = document.createElement('input');
      inp.type = 'range';
      inp.min = 0; inp.max = 100; inp.step = 1;
      inp.value = item.overlayOpacity ?? 50;
      inp.style.width = '100%';
      const val = document.createElement('span');
      val.textContent = inp.value + '%';
      val.style.cssText = 'font-size:11px;color:var(--text-muted);margin-left:8px;';
      inp.addEventListener('input', () => { val.textContent = inp.value + '%'; onChange(item, 'overlayOpacity', parseInt(inp.value)); });
      const wrap = document.createElement('div');
      wrap.className = 'field';
      const lbl = document.createElement('label');
      lbl.textContent = 'Overlay opacidad';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;';
      row.appendChild(inp);
      row.appendChild(val);
      wrap.appendChild(lbl);
      wrap.appendChild(row);
      return wrap;
    })(),
    textInput(item, 'bgPosition', 'BG position', 'center', 'Posición CSS del fondo. Ej: center, top, 50% 20%.'),
  ));

  frag.appendChild(group('Logo principal',
    imgPicker(item, 'src', 'Logo src', imgCatalog.logos, false, 'Logo principal del tile.'),
    imgPicker(item, 'darkSrc', 'Logo dark src', imgCatalog.logos, false, 'Versión alternativa del logo para dark mode.'),
    textInput(item, 'alt', 'Alt text', '', 'Texto alternativo del logo. Usado por lectores de pantalla.', onChangeRoot),
    numberInput(item, 'logoSize', 'Logo size (px)', 'Ancho máximo del logo en píxeles.'),
    toggle(item, 'invertLogo', 'Invertir logo', 'Aplica filter: brightness(0) al logo, convirtiéndolo en negro. En dark mode se invierte a blanco automáticamente.'),
    toggle(item, 'noFilterDark', 'No filtrar en dark mode', 'Evita la inversión automática en dark mode. Usalo cuando el logo ya tiene color propio.'),
  ));

  frag.appendChild(group('Logo secundario',
    imgPicker(item, 'multi', 'Multi logo src', imgCatalog.logos, false, 'Segundo logo para tiles con dos marcas.'),
    numberInput(item, 'multiLogoSize', 'Multi logo size (px)', 'Ancho máximo del segundo logo.'),
  ));

  frag.appendChild(group('Pixel / Hover',
    textInput(item, 'pixelColor', 'Pixel color', 'ej: #ff7518', 'Color del pixel grid en hover. Sobreescribe el default por tema.'),
    textInput(item, 'hoverColor', 'Hover color', 'ej: var(--main-color)', 'Color alternativo para el efecto hover.'),
  ));

  if (!item.label) item.label = { name: '', src: '', invertLogo: false, logoSize: 80, es: { industry: '', workType: '' }, en: { industry: '', workType: '' } };
  const labelGroup = document.createElement('div');
  labelGroup.className = 'field-group';
  labelGroup.appendChild(sectionTitle('Label (hover overlay)'));
  labelGroup.appendChild(textInput(item.label, 'name', 'Nombre', '', 'Nombre visible en el overlay de hover.'));
  labelGroup.appendChild(imgPicker(item.label, 'src', 'Logo', imgCatalog.logos, true, 'Logo que aparece en el overlay de hover.'));
  labelGroup.appendChild(numberInput(item.label, 'logoSize', 'Logo size', 'Tamaño del logo en el overlay de hover.'));
  labelGroup.appendChild(toggle(item.label, 'invertLogo', 'Invertir logo'));
  if (!item.label.es) item.label.es = { industry: '', workType: '' };
  if (!item.label.en) item.label.en = { industry: '', workType: '' };
  ['es', 'en'].forEach(lang => {
    labelGroup.appendChild(textInput(item.label[lang], 'industry', 'Industry (' + lang + ')', '', 'Descripción de la industria. Aparece en el overlay de hover.'));
    labelGroup.appendChild(textInput(item.label[lang], 'workType', 'Work type (' + lang + ')', '', 'Tipo de trabajo realizado. Aparece en el overlay de hover.'));
  });
  frag.appendChild(labelGroup);

  return frag;
}

// ── Brand Development form ────────────────────────────────────────────────────

function buildBDForm(item, idx) {
  const frag = document.createDocumentFragment();
  const bgImgs = [...imgCatalog.backgrounds, ...imgCatalog.videos];

  frag.appendChild(group('General',
    textInput(item, 'alt', 'Alt text'),
    textInput(item, 'project', 'Project ID'),
    textInput(item, 'projectName', 'Project name'),
    textInput(item, 'hoverColor', 'Hover color', 'var(--main-color)'),
    toggle(item, 'hideProjectMeta', 'Ocultar project meta'),
  ));

  frag.appendChild(group('Tamaño',
    (() => {
      const sel = document.createElement('select');
      ['tile-xl', 'tile'].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v; o.selected = item.size === v;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => onChange(item, 'size', sel.value));
      return field('Size', sel);
    })(),
    (() => {
      const sel = document.createElement('select');
      [4, 6, 8].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = 'span ' + v; o.selected = item.span === v;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => onChange(item, 'span', parseInt(sel.value)));
      return field('Span', sel);
    })(),
  ));

  frag.appendChild(group('Fondo',
    imgPicker(item, 'bgImage', 'Background image', bgImgs),
    textInput(item, 'bgColor', 'BG color', '#000000'),
  ));

  frag.appendChild(group('Logo',
    imgPicker(item, 'src', 'Logo src', imgCatalog.logos),
    numberInput(item, 'logoSize', 'Logo size (px)'),
    toggle(item, 'invertLogo', 'Invertir logo'),
  ));

  frag.appendChild(i18nField(item, 'title', 'Título (tipo de trabajo)'));

  // Label
  if (!item.label) item.label = { es: { name: '', industry: '' }, en: { name: '', industry: '' } };
  const labelGroup = document.createElement('div');
  labelGroup.className = 'field-group';
  labelGroup.appendChild(sectionTitle('Label'));
  ['es', 'en'].forEach(lang => {
    if (!item.label[lang]) item.label[lang] = { name: '', industry: '' };
    labelGroup.appendChild(textInput(item.label[lang], 'name', 'Nombre (' + lang + ')'));
    labelGroup.appendChild(textInput(item.label[lang], 'industry', 'Industry (' + lang + ')'));
  });
  frag.appendChild(labelGroup);

  frag.appendChild(i18nField(item, 'description', 'Descripción'));

  return frag;
}

// ── Product Design form ───────────────────────────────────────────────────────

function buildPDForm(item, idx) {
  const frag = document.createDocumentFragment();

  frag.appendChild(group('General',
    textInput(item, 'year', 'Año'),
    textInput(item, 'hoverColor', 'Hover color', 'var(--mint)'),
    textInput(item, 'URLFigma', 'URL Figma'),
    (() => {
      const sel = document.createElement('select');
      [4, 6, 8].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = 'span ' + v; o.selected = item.span === v;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => onChange(item, 'span', parseInt(sel.value)));
      return field('Span', sel);
    })(),
  ));

  frag.appendChild(group('Logo',
    imgPicker(item, 'src', 'Logo src', imgCatalog.logos),
    numberInput(item, 'logoSize', 'Logo size (px)'),
    toggle(item, 'invertLogo', 'Invertir logo'),
    imgPicker(item, 'secondaryLogo', 'Logo secundario', imgCatalog.logos),
    numberInput(item, 'secondaryLogoSize', 'Logo secundario size (px)'),
  ));

  frag.appendChild(i18nField(item, 'title', 'Título'));
  frag.appendChild(i18nField(item, 'subtitle', 'Subtítulo'));

  return frag;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + (type || '') + ' show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}
