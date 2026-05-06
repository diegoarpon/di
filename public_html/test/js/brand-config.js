/**
 * BRAND CREATION GRID — carga desde JSONs separados por sección
 */

function buildBrandCreationItems(logos) {
    return logos.map(entry => {
        if (entry.type === "text") {
            return {
                layout: "single",
                span: entry.span,
                guides: ["top", "left"],
                type: "text",
                size: entry.size || "tile",
                text: entry.text,
                panelImage: entry.panelImage
            };
        }
        if (entry.stack) {
            return {
                layout: "stacked",
                span: entry.span,
                guides: ["left"],
                tiles: entry.stack.map((t, i) => {
                    const isXl = t.size === "tile-xl";
                    const logos = [{ src: t.src, loading: "lazy", alt: t.alt, logoSize: t.logoSize, invertLogo: t.invertLogo }];
                    if (t.multi) logos.push({ src: t.multi, loading: "lazy", alt: t.alt, logoSize: t.multiLogoSize ?? t.logoSize, invertLogo: t.invertLogo });
                    return {
                        tileClass: isXl ? "tile tile-xl" : "tile",
                        innerClass: t.multi ? "brand-grid-logo-wrap multi-logo" : "brand-grid-logo-wrap",
                        logos,
                        label: t.label,
                        name: t.alt,
                        tag: JSON.stringify(t.tag || []),
                        bgImage: t.bgImage || "",
                        labelSize: t.labelSize || "",
                        workType: t.workType,
                        year: t.year,
                        ...(i > 0 && { separatorBefore: true })
                    };
                })
            };
        }
        const isXl = entry.size === "tile-xl";
        const isWide = entry.span === 8 || entry.span === 6;
        const singleLogos = [{ src: entry.src, loading: "lazy", alt: entry.alt, logoSize: entry.logoSize, invertLogo: entry.invertLogo }];
        if (entry.multi) singleLogos.push({ src: entry.multi, loading: "lazy", alt: entry.alt, logoSize: entry.multiLogoSize ?? entry.logoSize, invertLogo: entry.invertLogo });
        return {
            layout: "single",
            span: entry.span,
            tileClass: isXl ? "tile tile-xl" : "tile",
            innerClass: entry.multi || isWide ? "brand-grid-logo-wrap" + (isWide ? " responsive-padding" : "") + (entry.multi ? " multi-logo" : "") : "brand-grid-logo-wrap",
            guides: ["top", "left"],
            logos: singleLogos,
            label: entry.label,
            name: entry.alt,
            tag: JSON.stringify(entry.tag || []),
            bgColor: entry.bgColor,
            bgImage: entry.bgImage,
            bgVideo: entry.bgVideo || "",
            project: entry.project,
            showLabel: entry.showLabel,
            title: entry.title,
            panelImage: entry.panelImage,
            panelImageSize: entry.panelImageSize,
            workType: entry.workType,
            year: entry.year,
            pixelColor: entry.pixelColor || entry.gallery?.find(g => g.type === "color")?.bg,
            hoverColor: entry.hoverColor
        };
    });
}

let brandCreationItems = [];
let brandDevItems = [];
let brandPdItems = [];

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
        brandDevItems = buildBrandCreationItems(sortedDev.map(e => ({ ...e, showLabel: true })));
        renderBrandCreationGrid(brandDevItems, "brand-development-grid");
        if (typeof window.initGsapHovers === "function") window.initGsapHovers();
    }
    if (document.getElementById("product-design-grid") && pdData.productDesign) {
        brandPdItems = [...pdData.productDesign].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        renderProductDesignGrid(brandPdItems);
    }
    if (typeof window.initGsapHovers === "function") window.initGsapHovers();
    if (typeof window.signalDataReady === "function") window.signalDataReady();
});
