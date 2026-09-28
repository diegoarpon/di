/**
 * BRAND CREATION GRID — carga desde JSONs separados por sección
 */

function buildBrandCreationItems(logos) {
    function buildLogoArray(entry) {
        const logo = { src: entry.src, darkSrc: entry.darkSrc, loading: 'lazy', alt: entry.alt, logoSize: entry.logoSize, invertLogo: entry.invertLogo, noFilterDark: entry.noFilterDark };
        const arr = [logo];
        if (entry.multi) arr.push({ ...logo, src: entry.multi, logoSize: entry.multiLogoSize ?? entry.logoSize });
        return arr;
    }

    return logos.map(entry => {
        if (entry.type === "text") {
            return {
                layout: "single",
                span: entry.span,
                guides: ["top", "left"],
                type: "text",
                size: entry.size || "tile",
                text: entry.text,
                textSize: entry.textSize,
                panelImage: entry.panelImage
            };
        }
        if (entry.stack) {
            return {
                layout: "stacked",
                span: entry.span,
                guides: ["left"],
                tiles: entry.stack.map((t, i) => ({
                    tileClass: t.size === "tile-xl" ? "tile tile-xl" : "tile",
                    innerClass: t.multi ? "brand-grid-logo-wrap multi-logo" : "brand-grid-logo-wrap",
                    logos: buildLogoArray(t),
                    name: t.alt,
                    tag: JSON.stringify(t.tag || []),
                    bgImage: t.bgImage || "",
                    ...(t.bgVideo && { bgVideo: t.bgVideo }),
                    ...(t.label && { label: t.label }),
                    ...(t.labelSize && { labelSize: t.labelSize }),
                    ...(t.workType && { workType: t.workType }),
                    ...(t.year && { year: t.year }),
                    ...(i > 0 && { separatorBefore: true })
                }))
            };
        }
        const isWide = entry.span === 8 || entry.span === 6;
        return {
            layout: "single",
            span: entry.span,
            tileClass: entry.size === "tile-xl" ? "tile tile-xl" : "tile",
            innerClass: "brand-grid-logo-wrap" + (isWide ? " responsive-padding" : "") + (entry.multi ? " multi-logo" : ""),
            guides: ["top", "left"],
            logos: buildLogoArray(entry),
            name: entry.alt,
            tag: JSON.stringify(entry.tag || []),
            pixelColor: entry.pixelColor || entry.gallery?.find(g => g.type === "color")?.bg,
            ...Object.fromEntries(
                ['label','bgColor','bgImage','bgVideo','project','projectLink','showLabel','title',
                 'panelImage','panelImageSize','workType','year','hoverColor']
                .filter(k => entry[k] != null)
                .map(k => [k, entry[k]])
            )
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
}).catch(err => {
    console.error("Error loading project data:", err);
    ['brand-creation-grid', 'brand-development-grid', 'product-design-grid'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p style="padding:2rem;opacity:0.5">Error al cargar los proyectos. Recargá la página.</p>';
    });
    if (typeof window.signalDataReady === "function") window.signalDataReady();
});
