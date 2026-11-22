/** A két menü kizárólag főcsoportból és közvetlen almenüpontokból áll. */
export function validateMenu(config) {
  const items = config.menu?.items;
  if (!Array.isArray(items) || !items.length || items.length > 9) {
    throw new Error("A menü főcsoportjainak száma érvénytelen.");
  }
  const identifiers = new Set();
  function visit(node, depth) {
    if (depth > 2 || !node || !/^[a-z0-9-]+$/.test(node.id || "") ||
      identifiers.has(node.id) || typeof node.label !== "string" || !node.label.trim()) {
      throw new Error("Érvénytelen vagy ismétlődő menüazonosító, címke vagy mélység.");
    }
    identifiers.add(node.id);
    if (node.href !== undefined && !/^#\/[a-z0-9/-]*$/.test(node.href)) {
      throw new Error("A menü csak jóváhagyott belső útvonalat használhat.");
    }
    if (node.children !== undefined) {
      if (depth === 2 || !Array.isArray(node.children) || node.children.length > 30) {
        throw new Error("Hibás menügyermek-lista.");
      }
      for (const child of node.children) visit(child, depth + 1);
    }
  }
  for (const root of items) visit(root, 1);
  const preview = config.pagePreview;
  if (!preview || typeof preview.intro !== "string" || !preview.intro.trim() ||
    !preview.sections || typeof preview.sections !== "object") {
    throw new Error("Hiányzó JSON-alapú oldalvázlat.");
  }
  for (const item of items) {
    const lines = preview.sections[item.id];
    if (!Array.isArray(lines) || lines.length < 2 || lines.length > 4 ||
      lines.some((line) => typeof line !== "string" || !line.trim() || line.length > 160)) {
      throw new Error("Hibás vagy hiányzó oldalvázlat a főmenühöz.");
    }
  }
  const locals = preview.localPages;
  if (!Array.isArray(locals) || locals.length > 30) {
    throw new Error("Érvénytelen oldalon belüli tartalomlista.");
  }
  for (const page of locals) {
    if (!page || !/^[a-z0-9-]+$/.test(page.id || "") || identifiers.has(page.id) ||
      typeof page.title !== "string" || !page.title.trim() || page.title.length > 90 ||
      typeof page.parentId !== "string" || !identifiers.has(page.parentId) ||
      !items.some((root) => root.children?.some((child) => child.id === page.parentId))) {
      throw new Error("Érvénytelen, menün kívüli tartalomoldal.");
    }
    identifiers.add(page.id);
  }
  return items;
}

export function menuPageHref(id) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Érvénytelen oldalazonosító.");
  return `#/oldal/${id}`;
}

/** Egyelőre csak a menü tényleges végpontjai önálló oldalak. */
export function getMenuPage(config, id) {
  const localPage = config.pagePreview.localPages?.find((item) => item.id === id);
  if (localPage) {
    const root = config.menu.items.find((item) =>
      item.children?.some((child) => child.id === localPage.parentId));
    if (!root) return null;
    return { id, title:localPage.title, intro:config.pagePreview.intro,
      items:config.pagePreview.sections[root.id] };
  }
  for (const root of config.menu.items) {
    function find(node) {
      if (node.id === id && !node.children?.length) {
        return { id:node.id, title:node.label, intro:config.pagePreview.intro,
          items:config.pagePreview.sections[root.id] };
      }
      for (const child of node.children || []) {
        const match = find(child);
        if (match) return match;
      }
      return null;
    }
    const found = find(root);
    if (found) return found;
  }
  return null;
}
