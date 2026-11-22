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
  if (items.some((root) => !Array.isArray(root.children) || root.children.length < 8)) {
    throw new Error("Minden főmenühöz legalább nyolc közvetlen almenüpont tartozzon.");
  }
  const preview = config.pagePreview;
  if (!preview || typeof preview.intro !== "string" || !preview.intro.trim() ||
    !preview.sections || typeof preview.sections !== "object") {
    throw new Error("Hiányzó JSON-alapú oldalvázlat.");
  }
  for (const item of items) {
    const cards = preview.sections[item.id];
    if (!Array.isArray(cards) || cards.length < 2 || cards.length > 4 || cards.some((card) =>
      !card || !validLabel(card.title, 90) || !validLabel(card.summary, 200) ||
      !Array.isArray(card.groups) || card.groups.length < 2 || card.groups.length > 4 ||
      card.groups.some((group) => !group || !validLabel(group.title, 90) ||
        !Array.isArray(group.points) || group.points.length < 2 || group.points.length > 5 ||
        group.points.some((point) => !point || !validLabel(point.title, 90) ||
          !Array.isArray(point.details) || point.details.length < 1 || point.details.length > 4 ||
          point.details.some((detail) => !validLabel(detail, 160)))))) {
      throw new Error("Hibás vagy hiányzó kártyás oldalvázlat a főmenühöz.");
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

const validLabel = (text, maxLength) => typeof text === "string" &&
  !!text.trim() && text.length <= maxLength;

/** A kártyák minden címe és beágyazott alpontja részt vesz a teljes oldalas keresésben. */
export function pagePreviewSearchText(cards) {
  return cards.flatMap((card) => [card.title, card.summary,
    ...card.groups.flatMap((group) => [group.title,
      ...group.points.flatMap((point) => [point.title, ...point.details])])]).join(" ");
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
