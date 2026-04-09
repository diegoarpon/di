/**
 * BRAND CREATION GRID — carga desde JSONs separados por sección
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
                    const logos = [{ src: t.src, loading: "lazy", alt: t.alt, logoSize: t.logoSize, invertLogo: t.invertLogo }];
                    if (t.multi) logos.push({ src: t.multi, loading: "lazy", alt: t.alt, logoSize: t.multiLogoSize ?? t.logoSize });
                    return {
                        tileClass: isXl ? "tile tile-xl" : "tile",
                        innerClass: t.multi ? "brand-grid-logo-wrap multi-logo" : "brand-grid-logo-wrap",
                        logos,
                        label: t.label,
                        tag: JSON.stringify(t.tag || []),
                        bgImage: t.bgImage || "",
                        ...(i > 0 && { separatorBefore: true })
                    };
                })
            };
        }
        const isXl = entry.size === "tile-xl";
        const isWide = entry.span === 8 || entry.span === 6;
        const singleLogos = [{ src: entry.src, loading: "lazy", alt: entry.alt, logoSize: entry.logoSize, invertLogo: entry.invertLogo }];
        if (entry.multi) singleLogos.push({ src: entry.multi, loading: "lazy", alt: entry.alt, logoSize: entry.multiLogoSize ?? entry.logoSize });
        return {
            layout: "single",
            span: entry.span,
            tileClass: isXl ? "tile tile-xl" : "tile",
            innerClass: entry.multi || isWide ? "brand-grid-logo-wrap" + (isWide ? " responsive-padding" : "") + (entry.multi ? " multi-logo" : "") : "brand-grid-logo-wrap",
            guides: ["top", "left"],
            logos: singleLogos,
            label: entry.label,
            tag: JSON.stringify(entry.tag || []),
            bgColor: entry.bgColor,
            bgImage: entry.bgImage,
            project: entry.project,
            showLabel: entry.showLabel,
            title: entry.title
        };
    });
}

let brandCreationItems = [];

Promise.all([
    fetch("brand-creation.json").then(r => r.json()),
    fetch("brand-development.json").then(r => r.json()),
    fetch("product-design.json").then(r => r.json())
]).then(([creationData, devData, pdData]) => {
    const sorted = [...creationData.tiles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    brandCreationItems = buildBrandCreationItems(sorted);
    if (document.getElementById("brand-creation-grid")) {
        renderBrandCreationGrid(brandCreationItems);
        requestAnimationFrame(() => addCol4Panels());
    }
    if (document.getElementById("brand-development-grid") && devData.brandDevelopment) {
        const sortedDev = [...devData.brandDevelopment].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const devItems = buildBrandCreationItems(sortedDev.map(e => ({ ...e, showLabel: true })));
        renderBrandCreationGrid(devItems, "brand-development-grid");
        const devGrid = document.getElementById("brand-development-grid");
        devGrid.querySelectorAll(".tile, .tile-xl").forEach((tile, i) => {
            const colorEntry = sortedDev[i]?.gallery?.find(g => g.type === "color");
            const color = sortedDev[i]?.pixelColor || colorEntry?.bg;
            if (color) tile.dataset.pixelColor = color;
            const hoverColor = sortedDev[i]?.hoverColor;
            if (hoverColor) tile.dataset.hoverColor = hoverColor;
        });
        if (typeof window.initGsapHovers === "function") window.initGsapHovers();
    }
    if (document.getElementById("product-design-grid") && pdData.productDesign) {
        const pdItems = [...pdData.productDesign].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        renderProductDesignGrid(pdItems);
    }
});
