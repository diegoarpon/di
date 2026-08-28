import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMG_DIR = './img';
const QUALITY = 90;
const MAX_WIDTH = 1920;
const REF_EXTENSIONS = ['.html', '.json', '.js', '.css'];

// Buscar recursivamente JPG/PNG
function findImages(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findImages(full));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) results.push(full);
  }
  return results;
}

// Buscar archivos que pueden tener referencias a imágenes
function findRefFiles(dir, depth = 0) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && depth < 2 && entry.name !== 'node_modules') {
      results.push(...findRefFiles(full, depth + 1));
    } else if (REF_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// --- PASO 1: Convertir imágenes ---
const files = findImages(IMG_DIR);
console.log(`\n🔍 ${files.length} imágenes JPG/PNG encontradas\n`);

let totalBefore = 0, totalAfter = 0;
const converted = []; // { oldName, newName } para actualizar refs

for (const file of files) {
  const { name, ext, dir } = path.parse(file);
  const outPath = path.join(dir, `${name}.webp`);
  const sizeBefore = fs.statSync(file).size;
  totalBefore += sizeBefore;

  try {
    await sharp(file)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    const sizeAfter = fs.statSync(outPath).size;
    totalAfter += sizeAfter;
    const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(0);
    console.log(`✓ ${file} → .webp  (${(sizeBefore/1024).toFixed(0)}KB → ${(sizeAfter/1024).toFixed(0)}KB, -${saved}%)`);

    converted.push({ oldName: `${name}${ext}`, newName: `${name}.webp` });
    fs.unlinkSync(file);
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

console.log(`\n📊 Total: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB (-${((1-totalAfter/totalBefore)*100).toFixed(0)}%)\n`);

// --- PASO 2: Actualizar referencias ---
if (!converted.length) { console.log('No hay referencias que actualizar.'); process.exit(0); }

const refFiles = findRefFiles('.');
let updatedCount = 0;

for (const refFile of refFiles) {
  let content = fs.readFileSync(refFile, 'utf-8');
  let changed = false;

  for (const { oldName, newName } of converted) {
    if (content.includes(oldName)) {
      content = content.replaceAll(oldName, newName);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(refFile, content, 'utf-8');
    updatedCount++;
    console.log(`📝 ${refFile}`);
  }
}

console.log(`\n✅ ${converted.length} imágenes convertidas, ${updatedCount} archivos actualizados.\n`);
