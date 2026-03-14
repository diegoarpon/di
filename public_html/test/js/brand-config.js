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
                    const logos = [{ src: t.src, loading: "lazy", alt: t.alt, logoSize: t.logoSize }];
                    if (t.multi) logos.push({ src: t.multi, loading: "lazy", alt: t.alt, logoSize: t.logoSize });
                    return {
                        tileClass: isXl ? "tile tile-xl" : "tile",
                        innerClass: t.multi ? "brand-grid-logo-wrap multi-logo" : "brand-grid-logo-wrap",
                        logos,
                        label: t.label,
                        ...(i > 0 && { separatorBefore: true })
                    };
                })
            };
        }
        const isXl = entry.size === "tile-xl";
        const isWide = entry.span === 8 || entry.span === 6;
        return {
            layout: "single",
            span: entry.span,
            tileClass: isXl ? "tile tile-xl" : "tile",
            innerClass: isWide ? "brand-grid-logo-wrap responsive-padding" : "brand-grid-logo-wrap",
            guides: ["top", "left"],
            logos: [{ src: entry.src, loading: "lazy", alt: entry.alt, logoSize: entry.logoSize, className: entry.bgColor ? "filter-invert" : undefined }],
            label: entry.label,
            bgColor: entry.bgColor,
            bgImage: entry.bgImage,
            project: entry.project
        };
    });
}

let brandCreationItems = [];

fetch("brand-config.json")
    .then(r => r.json())
    .then(data => {
        const sorted = [...data.tiles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        brandCreationItems = buildBrandCreationItems(sorted);
        if (document.getElementById("brand-creation-grid")) {
            renderBrandCreationGrid(brandCreationItems);
            requestAnimationFrame(() => addCol4Panels());
        }
        if (document.getElementById("brand-development-grid") && data.brandDevelopment) {
            const devItems = buildBrandCreationItems(
                [...data.brandDevelopment].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            );
            renderBrandCreationGrid(devItems, "brand-development-grid");
        }
        if (document.getElementById("product-design-grid") && data.productDesign) {
            const pdItems = [...data.productDesign].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            renderProductDesignGrid(pdItems);
        }
    });
