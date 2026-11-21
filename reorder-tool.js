// ── State ────────────────────────────────────────────────────────────────────

const state = {
  'brand-collection':   { handle: null, data: null, dirty: false, key: 'tiles' },
  'featured-projects':  { handle: null, data: null, dirty: false, key: 'brandDevelopment' },
  'product-design':     { handle: null, data: null, dirty: false, key: 'productDesign' },
};

let activeTab = 'brand-collection';
let selectedIdx = null;
let dirHandle = null;
let imgCatalog = { backgrounds: [], logos: [], visuals: [], videos: [] };
let dragSrc = null;

const SVG_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_CLOSED = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
const SVG_TRASH = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
const SVG_DRAG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;

const FILE_MAP = {
  'brand-collection':   'brand-creation.json',
  'featured-projects':  'brand-development.json',
  'product-design':     'product-design.json',
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
      document.querySelector('[data-tab="' + tab + '"]').classList.remove('not-loaded');
    } catch(e) {
      console.warn('No se pudo cargar', filename, e);
    }
  }
  updateCounts();
  renderGrid(activeTab);
}

function updateCounts() {
  const map = { 'brand-collection': 'count-bc', 'featured-projects': 'count-fp', 'product-design': 'count-pd' };
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

const workspaceEl = document.querySelector('.workspace');

function setWorkspaceSplit(split) {
  workspaceEl.classList.toggle('workspace--split', split);
}

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.panel-wrap').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + activeTab).classList.add('active');
    // Featured Projects & Product Design: split 60/40 (panel 60%)
    setWorkspaceSplit(activeTab === 'featured-projects' || activeTab === 'product-design');
    closePanel();
    renderGrid(activeTab);
    updateSaveBtn();
  });
});

// Aplicar estado inicial según pestaña activa
setWorkspaceSplit(activeTab === 'featured-projects' || activeTab === 'product-design');

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
}

function updateSaveBtn() {
  const anyDirty = Object.values(state).some(s => s.dirty);
  const anyLoaded = Object.values(state).some(s => s.handle);
  const btn = document.getElementById('btn-save');
  const status = document.getElementById('save-status');
  btn.disabled = !anyLoaded;
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

  const addCard = document.createElement('div');
  addCard.className = 'card card-add';
  addCard.innerHTML = '<span>+</span>';
  addCard.addEventListener('click', () => addNewItem(tab));
  grid.appendChild(addCard);

  wrap.innerHTML = '';
  wrap.appendChild(hint);
  wrap.appendChild(grid);
}

function makeCard(item, idx, tab) {
  const card = document.createElement('div');
  card.className = 'card';
  if (item.enabled === false) card.classList.add('card-disabled');
  card.draggable = true;
  card.dataset.tab = tab;
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

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const eyeBtn = document.createElement('button');
  eyeBtn.className = 'card-action-btn card-eye' + (item.enabled === false ? ' eye-closed' : '');
  eyeBtn.title = item.enabled === false ? 'No publicado' : 'Publicado';
  eyeBtn.innerHTML = item.enabled === false ? SVG_EYE_CLOSED : SVG_EYE;
  eyeBtn.addEventListener('click', e => {
    e.stopPropagation();
    const nowEnabled = item.enabled !== false;
    item.enabled = !nowEnabled;
    markDirty();
    eyeBtn.innerHTML = item.enabled ? SVG_EYE : SVG_EYE_CLOSED;
    eyeBtn.title = item.enabled ? 'Publicado' : 'No publicado';
    eyeBtn.classList.toggle('eye-closed', !item.enabled);
    card.classList.toggle('card-disabled', !item.enabled);
  });

  const trashBtn = document.createElement('button');
  trashBtn.className = 'card-action-btn card-trash';
  trashBtn.title = 'Eliminar tile';
  trashBtn.innerHTML = SVG_TRASH;
  trashBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este tile?')) return;
    const t = card.dataset.tab;
    const i = parseInt(card.dataset.idx);
    state[t].data[state[t].key].splice(i, 1);
    if (selectedIdx === i) closePanel();
    selectedIdx = null;
    markDirty();
    renderGrid(t);
    updateCounts();
  });

  actions.appendChild(eyeBtn);
  actions.appendChild(trashBtn);
  card.appendChild(actions);

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
  if (tab === 'brand-collection') body.appendChild(buildBCForm(item, idx));
  else if (tab === 'featured-projects') body.appendChild(buildBDForm(item, idx));
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

  const row = document.createElement('div');
  row.className = 'toggle-inline';

  const tog = document.createElement('label');
  tog.className = 'toggle';
  const inp = document.createElement('input');
  inp.type = 'checkbox';
  inp.checked = !!item[key];
  inp.addEventListener('change', () => { onChange(item, key, inp.checked); });
  const slider = document.createElement('span');
  slider.className = 'toggle-slider';
  tog.appendChild(inp);
  tog.appendChild(slider);
  row.appendChild(tog);

  const txt = document.createElement('span');
  txt.className = 'toggle-inline__label';
  txt.textContent = label;
  row.appendChild(txt);

  wrap.appendChild(row);
  return wrap;
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
  picker.appendChild(row);
  picker.appendChild(preview);
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

  const fieldsWrap = document.createElement('div');
  fieldsWrap.className = 'field-group__fields--fixed';

  ['es', 'en'].forEach(lang => {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = item[key][lang] || '';
    inp.placeholder = lang.toUpperCase();
    inp.addEventListener('input', () => { item[key][lang] = inp.value; markDirty(); });
    const f = document.createElement('div');
    f.className = 'field';
    const lbl = document.createElement('label');
    lbl.textContent = lang.toUpperCase();
    f.appendChild(lbl);
    f.appendChild(inp);
    fieldsWrap.appendChild(f);
  });
  wrap.appendChild(fieldsWrap);
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
  el.textContent = text;
  return el;
}

function group(title, ...children) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';
  // Supportar opciones: { twoCols: true|'fixed' }
  // true = responsive, 'fixed' = 2 columnas fijas en todos los breakpoints
  const opts = children.length && typeof children[children.length - 1] === 'object' && !children[children.length - 1].tagName
    ? children.pop()
    : {};

  wrap.appendChild(sectionTitle(title));

  if (opts.twoCols) {
    const fieldsWrap = document.createElement('div');
    fieldsWrap.className = opts.twoCols === 'fixed' ? 'field-group__fields--fixed' : 'field-group__fields';
    children.forEach(c => c && fieldsWrap.appendChild(c));
    wrap.appendChild(fieldsWrap);
  } else {
    children.forEach(c => c && wrap.appendChild(c));
  }
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
    { twoCols: true },
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
    { twoCols: true },
  ));

  frag.appendChild(group('Fondo',
    imgPicker(item, 'bgImage', 'Background image', bgImgs),
    textInput(item, 'bgColor', 'BG color', '#000000'),
    { twoCols: true },
  ));

  frag.appendChild(group('Logo',
    imgPicker(item, 'src', 'Logo src', imgCatalog.logos),
    numberInput(item, 'logoSize', 'Logo size (px)'),
    toggle(item, 'invertLogo', 'Invertir logo'),
    { twoCols: true },
  ));

  frag.appendChild(i18nField(item, 'title', 'Título (tipo de trabajo)'));

  // Label
  if (!item.label) item.label = { es: { name: '', industry: '' }, en: { name: '', industry: '' } };
  const labelFields = [];
  // Agrupar por campo: Nombre (es/en juntos), luego Industry (es/en juntos)
  ['name', 'industry'].forEach(fieldKey => {
    const fieldLabel = fieldKey === 'name' ? 'Nombre' : 'Industry';
    ['es', 'en'].forEach(lang => {
      if (!item.label[lang]) item.label[lang] = { name: '', industry: '' };
      labelFields.push(textInput(item.label[lang], fieldKey, fieldLabel + ' (' + lang + ')'));
    });
  });
  frag.appendChild(group('Label', ...labelFields, { twoCols: 'fixed' }));

  // Gallery editor
  frag.appendChild(buildGalleryEditor(item));

  return frag;
}

// ── Product Design form ───────────────────────────────────────────────────────

function buildPDForm(item, idx) {
  const frag = document.createDocumentFragment();
  const bgImgs = [...imgCatalog.backgrounds, ...imgCatalog.videos];
  const allImgs = [...imgCatalog.backgrounds, ...imgCatalog.visuals, ...imgCatalog.logos];

  // Ensure arrays exist
  if (!item.objectives) item.objectives = [];
  if (!item.decisions) item.decisions = [];
  if (!item.walkthrough) item.walkthrough = [];
  if (!item.nextProject) item.nextProject = { slug: '', title: { es: '', en: '' } };
  if (!item.roles) item.roles = ['Product Design'];

  // General fields
  frag.appendChild(group('General',
    textInput(item, 'project', 'Project ID (slug)', 'formstream', 'Identificador único para la URL'),
    textInput(item, 'projectName', 'Project Name', 'FormStream', 'Nombre visible'),
    textInput(item, 'slug', 'Slug', 'formstream', 'Slug para navegación (nextProject)'),
    textInput(item, 'title', 'Title', 'FormStream', 'Título del caso de estudio'),
    textInput(item, 'category', 'Category', 'Desktop Application', 'Categoría: Desktop Application, Mobile App, etc.'),
    textInput(item, 'year', 'Year', '2025'),
    textInput(item, 'hoverColor', 'Hover color', 'var(--gold-yellow)'),
    textInput(item, 'URLFigma', 'URL Figma'),
    { twoCols: true },
  ));

  // I18n fields
  frag.appendChild(i18nField(item, 'subtitle', 'Subtítulo'));
  frag.appendChild(i18nField(item, 'summary', 'Resumen'));
  frag.appendChild(i18nField(item, 'challenge', 'Desafío'));
  frag.appendChild(i18nField(item, 'outcome', 'Resultado'));

  // Team & Duration (i18n)
  frag.appendChild(i18nField(item, 'team', 'Equipo / Rol'));
  frag.appendChild(i18nField(item, 'duration', 'Duración'));

  // Roles (simple array for now)
  frag.appendChild(group('Roles',
    (() => {
      const wrap = document.createElement('div');
      wrap.className = 'field';
      const lbl = document.createElement('label');
      lbl.textContent = 'Roles (separados por comas)';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = (item.roles || []).join(', ');
      inp.addEventListener('input', () => {
        item.roles = inp.value.split(',').map(s => s.trim()).filter(Boolean);
        markDirty();
      });
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return wrap;
    })(),
  ));

  // Hero Image
  frag.appendChild(group('Hero Image',
    imgPicker(item, 'heroImage', 'Hero Image', allImgs, false, 'Imagen principal del caso de estudio'),
  ));

  // Size & Logo (tile settings for listing)
  frag.appendChild(group('Tile Settings',
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
    imgPicker(item, 'src', 'Logo src', imgCatalog.logos),
    numberInput(item, 'logoSize', 'Logo size (px)'),
    toggle(item, 'invertLogo', 'Invertir logo'),
    imgPicker(item, 'secondaryLogo', 'Logo secundario', imgCatalog.logos),
    numberInput(item, 'secondaryLogoSize', 'Logo secundario size (px)'),
    { twoCols: true },
  ));

  // Label for hover overlay
  if (!item.label) item.label = { es: { name: '', industry: '' }, en: { name: '', industry: '' } };
  const labelFields = [];
  ['name', 'industry'].forEach(fieldKey => {
    const fieldLabel = fieldKey === 'name' ? 'Nombre' : 'Industry';
    ['es', 'en'].forEach(lang => {
      if (!item.label[lang]) item.label[lang] = { name: '', industry: '' };
      labelFields.push(textInput(item.label[lang], fieldKey, fieldLabel + ' (' + lang + ')'));
    });
  });
  frag.appendChild(group('Label (Hover Overlay)', ...labelFields, { twoCols: 'fixed' }));

  // Objectives Editor
  frag.appendChild(buildObjectivesEditor(item));

  // Decisions Editor
  frag.appendChild(buildDecisionsEditor(item, allImgs));

  // Walkthrough Editor
  frag.appendChild(buildWalkthroughEditor(item, allImgs));

  // Next Project
  frag.appendChild(group('Next Project',
    textInput(item.nextProject, 'slug', 'Next Project Slug', 'quikforms-app'),
    i18nField(item.nextProject, 'title', 'Next Project Title'),
  ));

  return frag;
}

// ── Objectives Editor ─────────────────────────────────────────────────────────

function buildObjectivesEditor(item) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  const titleRow = document.createElement('div');
  titleRow.className = 'field-group-title';
  titleRow.textContent = 'Objectives (Objetivos)';
  wrap.appendChild(titleRow);

  const list = document.createElement('div');
  list.className = 'gallery-list';
  wrap.appendChild(list);

  function render() {
    list.innerHTML = '';
    (item.objectives || []).forEach((obj, idx) => {
      list.appendChild(renderObjective(obj, idx));
    });
    // Add button
    const addBtn = document.createElement('div');
    addBtn.className = 'gallery-item-add';
    addBtn.innerHTML = '<span>+ Add Objective</span>';
    addBtn.addEventListener('click', () => {
      item.objectives.push({ title: { es: '', en: '' }, description: { es: '', en: '' } });
      markDirty();
      render();
    });
    list.appendChild(addBtn);
  }

  function renderObjective(obj, idx) {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.draggable = true;
    el.dataset.idx = idx;

    const dragHandle = document.createElement('div');
    dragHandle.className = 'gallery-drag-handle';
    dragHandle.innerHTML = SVG_DRAG;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gallery-item__delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.objectives.splice(idx, 1);
      markDirty();
      render();
    });

    const header = document.createElement('div');
    header.className = 'gallery-item__header';
    const headerLeft = document.createElement('div');
    headerLeft.className = 'gallery-item__header-left';
    headerLeft.appendChild(dragHandle);
    header.appendChild(headerLeft);
    header.appendChild(deleteBtn);

    const fields = document.createElement('div');
    fields.className = 'gallery-item__fields';

    // Title (i18n)
    if (!obj.title) obj.title = { es: '', en: '' };
    ['es', 'en'].forEach(lang => {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = obj.title[lang] || '';
      inp.placeholder = `Title (${lang.toUpperCase()})`;
      inp.addEventListener('input', () => { obj.title[lang] = inp.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field';
      const lbl = document.createElement('label');
      lbl.textContent = `Title (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(inp);
      fields.appendChild(f);
    });

    // Description (i18n)
    if (!obj.description) obj.description = { es: '', en: '' };
    ['es', 'en'].forEach(lang => {
      const ta = document.createElement('textarea');
      ta.value = obj.description[lang] || '';
      ta.placeholder = `Description (${lang.toUpperCase()})`;
      ta.rows = 2;
      ta.addEventListener('input', () => { obj.description[lang] = ta.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field field--full';
      const lbl = document.createElement('label');
      lbl.textContent = `Description (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(ta);
      fields.appendChild(f);
    });

    el.appendChild(header);
    el.appendChild(fields);

    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'objective', idx }));
      el.classList.add('dragging');
    });
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'objective' && data.idx !== idx) {
        const arr = item.objectives;
        const [moved] = arr.splice(data.idx, 1);
        arr.splice(idx, 0, moved);
        markDirty();
        render();
      }
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging', 'drag-over'));

    return el;
  }

  render();
  return wrap;
}

// ── Decisions Editor ──────────────────────────────────────────────────────────

function buildDecisionsEditor(item, allImgs) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  const titleRow = document.createElement('div');
  titleRow.className = 'field-group-title';
  titleRow.textContent = 'Design Decisions (Decisiones de Diseño)';
  wrap.appendChild(titleRow);

  const list = document.createElement('div');
  list.className = 'gallery-list';
  wrap.appendChild(list);

  const compositions = [
    { value: 'A', label: 'A: Text left + Image right' },
    { value: 'B', label: 'B: Image left + Text right' },
    { value: 'C', label: 'C: Two images comparison' },
    { value: 'D', label: 'D: Full-width image' }
  ];

  function render() {
    list.innerHTML = '';
    (item.decisions || []).forEach((dec, idx) => {
      list.appendChild(renderDecision(dec, idx));
    });
    // Add button
    const addBtn = document.createElement('div');
    addBtn.className = 'gallery-item-add';
    addBtn.innerHTML = '<span>+ Add Decision</span>';
    addBtn.addEventListener('click', () => {
      item.decisions.push({
        title: { es: '', en: '' },
        description: { es: '', en: '' },
        composition: 'A',
        image: '',
        caption: { es: '', en: '' },
        imageA: '',
        imageB: '',
        captionA: { es: '', en: '' },
        captionB: { es: '', en: '' }
      });
      markDirty();
      render();
    });
    list.appendChild(addBtn);
  }

  function renderDecision(dec, idx) {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.draggable = true;
    el.dataset.idx = idx;

    const dragHandle = document.createElement('div');
    dragHandle.className = 'gallery-drag-handle';
    dragHandle.innerHTML = SVG_DRAG;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gallery-item__delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.decisions.splice(idx, 1);
      markDirty();
      render();
    });

    const header = document.createElement('div');
    header.className = 'gallery-item__header';
    const headerLeft = document.createElement('div');
    headerLeft.className = 'gallery-item__header-left';
    headerLeft.appendChild(dragHandle);

    // Composition selector
    const compSelect = document.createElement('select');
    compSelect.className = 'gallery-item__type field-control';
    compositions.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.value; opt.textContent = c.label;
      if (dec.composition === c.value) opt.selected = true;
      compSelect.appendChild(opt);
    });
    compSelect.addEventListener('change', (e) => {
      dec.composition = e.target.value;
      markDirty();
      render();
    });
    headerLeft.appendChild(compSelect);
    header.appendChild(headerLeft);
    header.appendChild(deleteBtn);

    const fields = document.createElement('div');
    fields.className = 'gallery-item__fields';

    // Title & Description (i18n)
    if (!dec.title) dec.title = { es: '', en: '' };
    if (!dec.description) dec.description = { es: '', en: '' };
    ['es', 'en'].forEach(lang => {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = dec.title[lang] || '';
      inp.placeholder = `Title (${lang.toUpperCase()})`;
      inp.addEventListener('input', () => { dec.title[lang] = inp.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field';
      const lbl = document.createElement('label');
      lbl.textContent = `Title (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(inp);
      fields.appendChild(f);
    });
    ['es', 'en'].forEach(lang => {
      const ta = document.createElement('textarea');
      ta.value = dec.description[lang] || '';
      ta.placeholder = `Description (${lang.toUpperCase()})`;
      ta.rows = 3;
      ta.addEventListener('input', () => { dec.description[lang] = ta.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field field--full';
      const lbl = document.createElement('label');
      lbl.textContent = `Description (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(ta);
      fields.appendChild(f);
    });

    // Image fields based on composition
    const comp = dec.composition || 'A';

    if (comp === 'A' || comp === 'B' || comp === 'D') {
      // Single image
      if (!dec.caption) dec.caption = { es: '', en: '' };
      const imgPickerWrap = createImgPickerField(dec, 'image', 'Image', allImgs);
      fields.appendChild(imgPickerWrap);
      ['es', 'en'].forEach(lang => {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = dec.caption[lang] || '';
        inp.placeholder = `Caption (${lang.toUpperCase()})`;
        inp.addEventListener('input', () => { dec.caption[lang] = inp.value; markDirty(); });
        const f = document.createElement('div');
        f.className = 'field';
        const lbl = document.createElement('label');
        lbl.textContent = `Caption (${lang.toUpperCase()})`;
        f.appendChild(lbl);
        f.appendChild(inp);
        fields.appendChild(f);
      });
    } else if (comp === 'C') {
      // Two images
      if (!dec.captionA) dec.captionA = { es: '', en: '' };
      if (!dec.captionB) dec.captionB = { es: '', en: '' };
      fields.appendChild(createImgPickerField(dec, 'imageA', 'Image A (Left)', allImgs));
      ['es', 'en'].forEach(lang => {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = dec.captionA[lang] || '';
        inp.placeholder = `Caption A (${lang.toUpperCase()})`;
        inp.addEventListener('input', () => { dec.captionA[lang] = inp.value; markDirty(); });
        const f = document.createElement('div');
        f.className = 'field';
        const lbl = document.createElement('label');
        lbl.textContent = `Caption A (${lang.toUpperCase()})`;
        f.appendChild(lbl);
        f.appendChild(inp);
        fields.appendChild(f);
      });
      fields.appendChild(createImgPickerField(dec, 'imageB', 'Image B (Right)', allImgs));
      ['es', 'en'].forEach(lang => {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = dec.captionB[lang] || '';
        inp.placeholder = `Caption B (${lang.toUpperCase()})`;
        inp.addEventListener('input', () => { dec.captionB[lang] = inp.value; markDirty(); });
        const f = document.createElement('div');
        f.className = 'field';
        const lbl = document.createElement('label');
        lbl.textContent = `Caption B (${lang.toUpperCase()})`;
        f.appendChild(lbl);
        f.appendChild(inp);
        fields.appendChild(f);
      });
    }

    el.appendChild(header);
    el.appendChild(fields);

    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'decision', idx }));
      el.classList.add('dragging');
    });
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'decision' && data.idx !== idx) {
        const arr = item.decisions;
        const [moved] = arr.splice(data.idx, 1);
        arr.splice(idx, 0, moved);
        markDirty();
        render();
      }
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging', 'drag-over'));

    return el;
  }

  function createImgPickerField(parent, key, label, catalog) {
    const wrap = document.createElement('div');
    wrap.className = 'field field--full';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const sel = document.createElement('select');
    sel.className = 'field-control';
    const emptyOpt = document.createElement('option');
    emptyOpt.value = ''; emptyOpt.textContent = '— ninguna —';
    sel.appendChild(emptyOpt);
    catalog.forEach(path => {
      const opt = document.createElement('option');
      opt.value = path; opt.textContent = path.split('/').pop();
      if (parent[key] === path) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      parent[key] = sel.value;
      markDirty();
    });
    wrap.appendChild(sel);
    return wrap;
  }

  render();
  return wrap;
}

// ── Walkthrough Editor ────────────────────────────────────────────────────────

function buildWalkthroughEditor(item, allImgs) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  const titleRow = document.createElement('div');
  titleRow.className = 'field-group-title';
  titleRow.textContent = 'Walkthrough (Recorrido - Pantallas)';
  wrap.appendChild(titleRow);

  const list = document.createElement('div');
  list.className = 'gallery-list';
  wrap.appendChild(list);

  function render() {
    list.innerHTML = '';
    (item.walkthrough || []).forEach((screen, idx) => {
      list.appendChild(renderScreen(screen, idx));
    });
    // Add button
    const addBtn = document.createElement('div');
    addBtn.className = 'gallery-item-add';
    addBtn.innerHTML = '<span>+ Add Screen</span>';
    addBtn.addEventListener('click', () => {
      item.walkthrough.push({
        number: String((item.walkthrough.length + 1)).padStart(2, '0'),
        title: { es: '', en: '' },
        description: { es: '', en: '' },
        image: '',
        caption: { es: '', en: '' }
      });
      markDirty();
      render();
    });
    list.appendChild(addBtn);
  }

  function renderScreen(screen, idx) {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.draggable = true;
    el.dataset.idx = idx;

    const dragHandle = document.createElement('div');
    dragHandle.className = 'gallery-drag-handle';
    dragHandle.innerHTML = SVG_DRAG;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gallery-item__delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.walkthrough.splice(idx, 1);
      // Renumber
      item.walkthrough.forEach((s, i) => { s.number = String(i + 1).padStart(2, '0'); });
      markDirty();
      render();
    });

    const header = document.createElement('div');
    header.className = 'gallery-item__header';
    const headerLeft = document.createElement('div');
    headerLeft.className = 'gallery-item__header-left';
    headerLeft.appendChild(dragHandle);
    // Screen number
    const numInp = document.createElement('input');
    numInp.type = 'text';
    numInp.value = screen.number || '01';
    numInp.style.width = '60px';
    numInp.addEventListener('input', () => { screen.number = numInp.value; markDirty(); });
    headerLeft.appendChild(numInp);
    header.appendChild(headerLeft);
    header.appendChild(deleteBtn);

    const fields = document.createElement('div');
    fields.className = 'gallery-item__fields';

    // Title & Description (i18n)
    if (!screen.title) screen.title = { es: '', en: '' };
    if (!screen.description) screen.description = { es: '', en: '' };
    ['es', 'en'].forEach(lang => {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = screen.title[lang] || '';
      inp.placeholder = `Title (${lang.toUpperCase()})`;
      inp.addEventListener('input', () => { screen.title[lang] = inp.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field';
      const lbl = document.createElement('label');
      lbl.textContent = `Title (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(inp);
      fields.appendChild(f);
    });
    ['es', 'en'].forEach(lang => {
      const ta = document.createElement('textarea');
      ta.value = screen.description[lang] || '';
      ta.placeholder = `Description (${lang.toUpperCase()})`;
      ta.rows = 2;
      ta.addEventListener('input', () => { screen.description[lang] = ta.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field field--full';
      const lbl = document.createElement('label');
      lbl.textContent = `Description (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(ta);
      fields.appendChild(f);
    });

    // Image
    if (!screen.caption) screen.caption = { es: '', en: '' };
    fields.appendChild(createImgPickerField(screen, 'image', 'Screen Image', allImgs));
    ['es', 'en'].forEach(lang => {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = screen.caption[lang] || '';
      inp.placeholder = `Caption (${lang.toUpperCase()})`;
      inp.addEventListener('input', () => { screen.caption[lang] = inp.value; markDirty(); });
      const f = document.createElement('div');
      f.className = 'field';
      const lbl = document.createElement('label');
      lbl.textContent = `Caption (${lang.toUpperCase()})`;
      f.appendChild(lbl);
      f.appendChild(inp);
      fields.appendChild(f);
    });

    el.appendChild(header);
    el.appendChild(fields);

    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'walkthrough', idx }));
      el.classList.add('dragging');
    });
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'walkthrough' && data.idx !== idx) {
        const arr = item.walkthrough;
        const [moved] = arr.splice(data.idx, 1);
        arr.splice(idx, 0, moved);
        // Renumber
        arr.forEach((s, i) => { s.number = String(i + 1).padStart(2, '0'); });
        markDirty();
        render();
      }
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging', 'drag-over'));

    return el;
  }

  function createImgPickerField(parent, key, label, catalog) {
    const wrap = document.createElement('div');
    wrap.className = 'field field--full';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const sel = document.createElement('select');
    sel.className = 'field-control';
    const emptyOpt = document.createElement('option');
    emptyOpt.value = ''; emptyOpt.textContent = '— ninguna —';
    sel.appendChild(emptyOpt);
    catalog.forEach(path => {
      const opt = document.createElement('option');
      opt.value = path; opt.textContent = path.split('/').pop();
      if (parent[key] === path) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      parent[key] = sel.value;
      markDirty();
    });
    wrap.appendChild(sel);
    return wrap;
  }

  render();
  return wrap;
}

// ── Gallery Editor (Featured Projects) ─────────────────────────────────────────

function buildGalleryEditor(item) {
  const gallery = item.gallery || [];

  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  const titleRow = document.createElement('div');
  titleRow.className = 'field-group-title';
  titleRow.textContent = 'Galería / Detalle del proyecto';

  wrap.appendChild(titleRow);

  const list = document.createElement('div');
  list.className = 'gallery-list';
  wrap.appendChild(list);

  function renderGallery() {
    list.innerHTML = '';
    gallery.forEach((gItem, idx) => {
      list.appendChild(renderGalleryItem(item, gItem, idx));
    });
    // Add item card (like main tabs)
    const addCard = document.createElement('div');
    addCard.className = 'gallery-item-add';
    addCard.innerHTML = '<span>+</span>';
    addCard.addEventListener('click', () => addGalleryItem(item));
    list.appendChild(addCard);
  }

  function addGalleryItem(parentItem) {
    const newItem = { type: 'image', src: '', cols: 1, darkBg: false, accentBg: false, textSize: 'medium' };
    parentItem.gallery = parentItem.gallery || [];
    parentItem.gallery.push(newItem);
    markDirty();
    renderGallery();
  }

  function deleteGalleryItem(parentItem, idx) {
    parentItem.gallery.splice(idx, 1);
    markDirty();
    renderGallery();
  }

  function moveGalleryItem(parentItem, fromIdx, toIdx) {
    const arr = parentItem.gallery;
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    markDirty();
    renderGallery();
  }

  const typeOptions = [
    { value: 'image', label: 'Imagen' },
    { value: 'text', label: 'Texto' }
  ];

  function getImgOptions() {
    const opts = [];
    for (const child of imgCatalog.backgrounds) {
      opts.push(`<option value="${child}">${child.split('/').pop()}</option>`);
    }
    for (const child of imgCatalog.visuals) {
      opts.push(`<option value="${child}">${child.split('/').pop()}</option>`);
    }
    for (const child of imgCatalog.logos) {
      opts.push(`<option value="${child}">${child.split('/').pop()}</option>`);
    }
    return opts.join('');
  }

  function renderGalleryItem(parentItem, gItem, idx) {
    if (!gItem.type) gItem.type = 'image';
    const isText = gItem.type === 'text';
    const itemEl = document.createElement('div');
    itemEl.className = `gallery-item${isText ? ' gallery-item--text' : ''}`;
    itemEl.draggable = true;
    itemEl.dataset.idx = idx;

    // Drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'gallery-drag-handle';
    dragHandle.innerHTML = SVG_DRAG;

    // Type selector
    const typeSelect = document.createElement('select');
    typeSelect.className = 'gallery-item__type field-control';
    typeOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      typeSelect.appendChild(option);
    });
    typeSelect.value = gItem.type;
    typeSelect.addEventListener('change', (e) => {
      const newType = e.target.value;
      gItem.type = newType;
      if (newType === 'text') {
        // Initialize text structure
        gItem.text = { es: '', en: '' };
        gItem.textSize = gItem.textSize || 'medium';
        // Remove image-specific properties
        delete gItem.src;
        delete gItem.darkBg;
        delete gItem.accentBg;
        delete gItem.darkSrc;
      } else {
        // Initialize image structure
        gItem.src = gItem.src || '';
        gItem.darkBg = gItem.darkBg || false;
        gItem.accentBg = gItem.accentBg || false;
        // Remove text-specific properties
        delete gItem.text;
        delete gItem.textSize;
      }
      markDirty();
      renderGallery();
    });

    // Delete button (X style like panel-close)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gallery-item__delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteGalleryItem(parentItem, idx);
    });

    // Header
    const header = document.createElement('div');
    header.className = 'gallery-item__header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'gallery-item__header-left';
    headerLeft.appendChild(dragHandle);
    headerLeft.appendChild(typeSelect);

    header.appendChild(headerLeft);
    header.appendChild(deleteBtn);

    // Fields container
    const fields = document.createElement('div');
    fields.className = `gallery-item__fields${isText ? ' gallery-item__fields--text' : ''}`;

    if (isText) {
      // TEXT item - full width
      // Ensure text object exists
      if (!gItem.text) gItem.text = { es: '', en: '' };

      // Cols + Text size on same line (2 columns)
      const colsSelect = document.createElement('select');
      colsSelect.className = 'gallery-item__select--cols field-control';
      colsSelect.addEventListener('change', (e) => { gItem.cols = Number(e.target.value) || 1; markDirty(); });
      [1,2,3,4].forEach(n => {
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = `${n} columna${n>1?'s':''}`;
        colsSelect.appendChild(opt);
      });
      colsSelect.value = gItem.cols || 1;

      // Text size selector - rem values
      const sizeSelect = document.createElement('select');
      sizeSelect.className = 'field-control';
      sizeSelect.addEventListener('change', (e) => { gItem.textSize = e.target.value; markDirty(); });
      ['0.875rem','1rem','1.25rem','1.5rem','2rem'].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        sizeSelect.appendChild(opt);
      });
      sizeSelect.value = gItem.textSize || '1rem';

      // Wrapper for 2-column layout
      const rowWrap = document.createElement('div');
      rowWrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';
      rowWrap.appendChild(createField('Columnas', colsSelect));
      rowWrap.appendChild(createField('Tamaño texto', sizeSelect));
      fields.appendChild(rowWrap);

      // Text es (full width)
      fields.appendChild(createField('Texto (es)', document.createElement('textarea'), gItem.text.es || '', 4, (val) => { gItem.text.es = val; }));

      // Text en (full width)
      fields.appendChild(createField('Texto (en)', document.createElement('textarea'), gItem.text.en || '', 4, (val) => { gItem.text.en = val; }));

    } else {
      // IMAGE item - 3 columns
      // Preview (full width, larger) - declare BEFORE event listener
      const preview = document.createElement('div');
      preview.className = 'gallery-item__preview';
      preview.innerHTML = gItem.src ? `<img src="public_html/${gItem.src}" alt="">` : 'Sin imagen';

      // Src selector (full width)
      const srcSelect = document.createElement('select');
      srcSelect.className = 'gallery-item__select--full field-control';
      srcSelect.innerHTML = `<option value="">— Seleccionar —</option>` + getImgOptions();
      srcSelect.value = gItem.src || '';
      srcSelect.addEventListener('change', (e) => {
        gItem.src = e.target.value || '';
        preview.innerHTML = gItem.src ? `<img src="public_html/${gItem.src}" alt="">` : 'Sin imagen';
        markDirty();
      });
      fields.appendChild(createField('Imagen (src)', srcSelect));

      fields.appendChild(preview);

      // Cols selector (full width)
      const colsSelect = document.createElement('select');
      colsSelect.className = 'gallery-item__select--cols gallery-item__select--full field-control';
      colsSelect.addEventListener('change', (e) => { gItem.cols = Number(e.target.value) || 1; markDirty(); });
      [1,2,3,4].forEach(n => {
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = `${n} columna${n>1?'s':''}`;
        colsSelect.appendChild(opt);
      });
      colsSelect.value = gItem.cols || 1;
      fields.appendChild(createField('Columnas', colsSelect));

      // Flags (darkBg / accentBg) - checkboxes reusing styles
      const flags = document.createElement('div');
      flags.className = 'gallery-item__flags';

      const darkFlag = createCheckboxFlag('Fondo oscuro', gItem.darkBg || false, (checked) => { gItem.darkBg = checked; markDirty(); });
      const accentFlag = createCheckboxFlag('Fondo acento', gItem.accentBg || false, (checked) => { gItem.accentBg = checked; markDirty(); });

      flags.appendChild(darkFlag);
      flags.appendChild(accentFlag);
      fields.appendChild(flags);
    }

    itemEl.appendChild(header);
    itemEl.appendChild(fields);

    // Drag handlers
    itemEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'gallery', idx }));
      itemEl.classList.add('dragging');
    });
    itemEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      itemEl.classList.add('drag-over');
    });
    itemEl.addEventListener('dragleave', (e) => {
      itemEl.classList.remove('drag-over');
    });
    itemEl.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'gallery' && data.idx !== idx) {
        moveGalleryItem(parentItem, data.idx, idx);
      }
    });
    itemEl.addEventListener('dragend', (e) => {
      itemEl.classList.remove('dragging', 'drag-over');
    });

    return itemEl;
  }

  function createField(label, input, value, rows, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    if (input.classList.contains('gallery-item__select--full')) {
      wrap.classList.add('field--full');
    }
    const lbl = document.createElement('label');
    lbl.textContent = label;
    wrap.appendChild(lbl);
    if (input.tagName === 'TEXTAREA') {
      input.value = value || '';
      input.rows = rows || 4;
      input.addEventListener('input', () => { onChange?.(input.value); markDirty(); });
    }
    wrap.appendChild(input);
    return wrap;
  }

  function createCheckboxFlag(label, checked, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'gallery-item__flag';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', (e) => onChange(e.target.checked));
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(label));
    return wrap;
  }

  renderGallery();
  return wrap;
}

// ── Add new item ─────────────────────────────────────────────────────────────

function addNewItem(tab) {
  const s = state[tab];
  if (!s.data) return;
  const items = s.data[s.key];
  const newOrder = items.length + 1;

  const templates = {
    'brand-collection': {
      order: newOrder, size: 'tile-xl', span: 4, src: '', alt: '', logoSize: 200,
      invertLogo: false, darkSrc: '', noFilterDark: false, multi: '', multiLogoSize: 0,
      bgImage: '', bgPosition: 'center', bgVideo: '', workType: '', year: '',
      project: '', projectLink: '', pixelColor: '', hoverColor: '', enabled: true,
      label: { name: '', src: '', invertLogo: false, logoSize: 80,
        es: { industry: '', workType: '' }, en: { industry: '', workType: '' } }
    },
    'featured-projects': {
      order: newOrder, src: '', alt: '', size: 'tile-xl', span: 6, logoSize: 250,
      invertLogo: false, bgImage: '', hoverColor: 'var(--main-color)',
      project: '', projectName: '', title: { es: '', en: '' }, enabled: true,
      label: { es: { name: '', industry: '' }, en: { name: '', industry: '' } },
      hideProjectMeta: false, gallery: []
    },
    'product-design': {
      order: newOrder, src: '', span: 6, logoSize: 100, hoverColor: 'var(--mint)',
      projectName: '', slug: '', title: '', category: 'Desktop Application', year: '',
      subtitle: { es: '', en: '' }, summary: { es: '', en: '' },
      roles: ['Product Design'], team: { es: '', en: '' }, duration: { es: '', en: '' },
      heroImage: '',
      challenge: { es: '', en: '' },
      objectives: [],
      decisions: [],
      walkthrough: [],
      outcome: { es: '', en: '' },
      nextProject: { slug: '', title: { es: '', en: '' } },
      URLFigma: '', secondaryLogo: '', secondaryLogoSize: 60,
      enabled: true
    }
  };

  const newItem = templates[tab];
  items.push(newItem);
  markDirty();
  renderGrid(tab);
  updateCounts();
  // abrir panel del nuevo item
  selectedIdx = items.length - 1;
  const cards = document.querySelectorAll('#panel-' + tab + ' .card');
  const lastCard = cards[cards.length - 1];
  if (lastCard) { lastCard.classList.add('selected'); lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  openPanel(newItem, selectedIdx, tab);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + (type || '') + ' show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}
