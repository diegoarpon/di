# GUÍA RÁPIDA - TILE MANAGER

## 🎯 Sistema Automatizado de Tiles

### Tipos de Tiles Disponibles

| Tipo | Tamaño | Columnas | Altura |
|------|--------|----------|--------|
| `tile-4` | Normal | 4 | 200px |
| `tile-xl-4` | XL | 4 | 400px |
| `tile-xl-8` | XL | 8 | 400px |

---

## 📝 Uso Básico

### 1. Agregar Tile Simple (al final)

```javascript
// Tile normal (200px)
TileManager.addTile("tile-4", "img/logos/logo-ejemplo.svg", { 
  filterDark: true, 
  alt: "Ejemplo" 
});

// Tile XL en col-4 (400px)
TileManager.addTile("tile-xl-4", "img/logos/logo-ejemplo.svg", { 
  filterDark: true, 
  alt: "Ejemplo" 
});

// Tile XL en col-8 (400px)
TileManager.addTile("tile-xl-8", "img/logos/logo-ejemplo.svg", { 
  filterDark: true, 
  alt: "Ejemplo" 
});

// Renderizar cambios
TileManager.render();
```

### 2. Agregar Tile con Múltiples Logos

```javascript
TileManager.addTile("tile-xl-4", [
  "img/logos/logo-icon.svg",
  "img/logos/logo-full.svg"
], { 
  filterDark: true, 
  alt: "Marca con icon y full" 
});

TileManager.render();
```

### 3. Insertar en Posición Específica

```javascript
// Insertar en posición 5
TileManager.insertAt(5, "tile-xl-4", "img/logos/logo.svg", {
  filterDark: true,
  alt: "Logo"
});

TileManager.render();
```

### 4. Verificar Balance Antes de Agregar

```javascript
// Ver sugerencia para tile de 4 columnas
const suggestion = TileManager.suggestPosition(4);
console.log(suggestion);
// Output: { position: "end", index: 23, reason: "Cabe en la última fila..." }

// Ver sugerencia para tile de 8 columnas
const suggestion8 = TileManager.suggestPosition(8);
console.log(suggestion8);
```

### 5. Analizar Balance Actual

```javascript
const balance = TileManager.analyzeBalance();
console.log(balance);
// Output: [
//   { row: 0, cols: 12 },
//   { row: 1, cols: 12 },
//   { row: 2, cols: 8 }
// ]
```

---

## 🚀 Workflow Recomendado

### Agregar un nuevo logo:

```javascript
// 1. Verificar dónde cabe mejor
const suggestion = TileManager.suggestPosition(4); // o 8
console.log(suggestion.reason);

// 2. Agregar el tile
TileManager.addTile("tile-xl-4", "img/logos/logo-nuevo.svg", {
  filterDark: true,
  alt: "Nuevo Cliente"
});

// 3. Renderizar
TileManager.render();
```

### Agregar múltiples tiles de una vez:

```javascript
// Agregar varios
TileManager.addTile("tile-xl-4", "img/logos/logo-1.svg", { filterDark: true, alt: "Cliente 1" });
TileManager.addTile("tile-xl-4", "img/logos/logo-2.svg", { filterDark: true, alt: "Cliente 2" });
TileManager.addTile("tile-xl-8", "img/logos/logo-3.svg", { filterDark: true, alt: "Cliente 3" });

// Renderizar una sola vez al final
TileManager.render();
```

---

## 🎨 Opciones Disponibles

```javascript
{
  filterDark: true,      // Aplica clase "filter-dark" al logo
  alt: "Texto alt",      // Texto alternativo para accesibilidad
}
```

---

## 📊 Estructura del Grid

El grid usa 12 columnas:
- **col-4** = 4 columnas (33.33%)
- **col-8** = 8 columnas (66.66%)

Combinaciones balanceadas por fila:
- 4 + 4 + 4 = 12 ✅
- 8 + 4 = 12 ✅
- 4 + 8 = 12 ✅

---

## 🔧 Consola del Navegador

Abrí la consola (F12) y probá:

```javascript
// Ver todos los tiles actuales
console.log(brandCreationItems);

// Ver balance
console.log(TileManager.analyzeBalance());

// Agregar y renderizar
TileManager.addTile("tile-xl-4", "img/logos/logo-test.svg", { filterDark: true, alt: "Test" });
TileManager.render();
```

---

## ✨ Ventajas

✅ No modificás HTML  
✅ Balance automático  
✅ Sugerencias inteligentes  
✅ Múltiples logos por tile  
✅ Estructura compacta mantenida  
✅ Fácil de usar desde consola
