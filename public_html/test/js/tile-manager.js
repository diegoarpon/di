/**
 * TILE MANAGER - Sistema automatizado para agregar tiles
 * 
 * TIPOS DE TILES:
 * - "tile-4": tile normal en col-4 (200px)
 * - "tile-xl-4": tile-xl en col-4 (400px)
 * - "tile-xl-8": tile-xl en col-8 (400px)
 */

const TileManager = {
  /**
   * Agregar un nuevo tile al array brandCreationItems
   * @param {string} type - "tile-4", "tile-xl-4", o "tile-xl-8"
   * @param {string|array} logo - Path del logo o array de logos
   * @param {object} options - Opciones adicionales
   */
  addTile(type, logo, options = {}) {
    const config = this.createTileConfig(type, logo, options);
    brandCreationItems.push(config);
    return config;
  },

  /**
   * Crear configuración de tile según tipo
   */
  createTileConfig(type, logo, options) {
    const logos = Array.isArray(logo) ? logo : [logo];
    const logoObjects = logos.map(src => ({
      src: src,
      className: options.filterDark ? "filter-dark" : "",
      loading: "lazy",
      alt: options.alt || ""
    }));

    const configs = {
      "tile-4": {
        layout: "single",
        span: 4,
        tileClass: "tile",
        guides: ["top", "left"],
        placeholder: false
      },
      "tile-xl-4": {
        layout: "single",
        span: 4,
        tileClass: "tile tile-xl",
        innerClass: "brand-grid-logo-wrap",
        guides: ["top", "left"],
        logos: logoObjects
      },
      "tile-xl-8": {
        layout: "single",
        span: 8,
        tileClass: "tile tile-xl",
        innerClass: "brand-grid-logo-wrap responsive-padding",
        guides: ["top", "left"],
        logos: logoObjects
      }
    };

    return configs[type];
  },

  /**
   * Insertar tile en posición específica
   */
  insertAt(index, type, logo, options = {}) {
    const config = this.createTileConfig(type, logo, options);
    brandCreationItems.splice(index, 0, config);
    return config;
  },

  /**
   * Analizar balance del grid (cuenta columnas por fila)
   */
  analyzeBalance() {
    let currentRow = 0;
    let rowCols = 0;
    const rows = [];

    brandCreationItems.forEach((item, idx) => {
      const span = item.span;
      
      if (rowCols + span > 12) {
        rows.push({ row: currentRow, cols: rowCols });
        currentRow++;
        rowCols = span;
      } else {
        rowCols += span;
      }
    });

    rows.push({ row: currentRow, cols: rowCols });
    return rows;
  },

  /**
   * Sugerir mejor posición para un nuevo tile
   */
  suggestPosition(span) {
    const balance = this.analyzeBalance();
    const lastRow = balance[balance.length - 1];
    
    if (lastRow.cols + span <= 12) {
      return {
        position: "end",
        index: brandCreationItems.length,
        reason: `Cabe en la última fila (${lastRow.cols} + ${span} = ${lastRow.cols + span} cols)`
      };
    }

    return {
      position: "new-row",
      index: brandCreationItems.length,
      reason: `Nueva fila necesaria (última fila tiene ${lastRow.cols} cols)`
    };
  },

  /**
   * Renderizar grid actualizado
   */
  render() {
    renderBrandCreationGrid(brandCreationItems);
    requestAnimationFrame(() => addCol4Panels());
  }
};

/**
 * EJEMPLOS DE USO:
 * 
 * // Agregar tile normal (200px) en col-4
 * TileManager.addTile("tile-4", "img/logos/logo-ejemplo.svg", { 
 *   filterDark: true, 
 *   alt: "Ejemplo" 
 * });
 * 
 * // Agregar tile-xl (400px) en col-4
 * TileManager.addTile("tile-xl-4", "img/logos/logo-ejemplo.svg", { 
 *   filterDark: true, 
 *   alt: "Ejemplo" 
 * });
 * 
 * // Agregar tile-xl (400px) en col-8
 * TileManager.addTile("tile-xl-8", "img/logos/logo-ejemplo.svg", { 
 *   filterDark: true, 
 *   alt: "Ejemplo" 
 * });
 * 
 * // Agregar tile con múltiples logos
 * TileManager.addTile("tile-xl-4", [
 *   "img/logos/logo-icon.svg",
 *   "img/logos/logo-full.svg"
 * ], { filterDark: true, alt: "Ejemplo Multi" });
 * 
 * // Ver sugerencia de posición antes de agregar
 * const suggestion = TileManager.suggestPosition(4); // para col-4
 * console.log(suggestion);
 * 
 * // Insertar en posición específica
 * TileManager.insertAt(5, "tile-xl-4", "img/logos/logo.svg");
 * 
 * // Renderizar cambios
 * TileManager.render();
 */

// Exponer globalmente
window.TileManager = TileManager;
