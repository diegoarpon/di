/**
 * BRAND CREATION GRID — carga desde brand-config.json
 */

function buildBrandCreationItems(logos) {
    return logos.map(entry => {
        if (entry.stack) {
            return {
                layout: "stacked",
                span: entry.span,
                guides: ["left"],
                tiles: entry.stack.map((t, i) => {
                    const isXl = t.size === "tile-xl";
                    const logos = [{ src: t.src, className: "filter-dark", loading: "lazy", alt: t.alt }];
                    if (t.multi) logos.push({ src: t.multi, className: "filter-dark", loading: "lazy", alt: t.alt });
                    return {
                        tileClass: isXl ? "tile tile-xl" : "tile",
                        innerClass: t.multi ? "brand-grid-logo-wrap multi-logo" : "brand-grid-logo-wrap",
                        logos,
                        ...(i > 0 && { separatorBefore: true })
                    };
                })
            };
        }
        const isXl = entry.size === "tile-xl";
        const isWide = entry.span === 8;
        return {
            layout: "single",
            span: entry.span,
            tileClass: isXl ? "tile tile-xl" : "tile",
            innerClass: isWide ? "brand-grid-logo-wrap responsive-padding" : "brand-grid-logo-wrap",
            guides: ["top", "left"],
            logos: [{ src: entry.src, className: "filter-dark", loading: "lazy", alt: entry.alt }]
        };
    });
}

let brandCreationItems = [];

fetch("../brand-config.json")
    .then(r => r.json())
    .then(data => {
        brandCreationItems = buildBrandCreationItems(data.tiles);
        if (document.getElementById("brand-creation-grid")) {
            renderBrandCreationGrid(brandCreationItems);
            requestAnimationFrame(() => addCol4Panels());
        }
    });
