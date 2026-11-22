/** A két teljesen külön menü ugyanazt a jóváhagyásra váró JSON-hierarchiát olvassa. */
export function validateMenu(config) {
  const items = config.menu?.items;
  if (!Array.isArray(items) || !items.length || items.length > 9) {
    throw new Error("A menü főcsoportjainak száma érvénytelen.");
  }
  const identifiers = new Set();
  function visit(node, depth) {
    if (depth > 3 || !node || !/^[a-z0-9-]+$/.test(node.id || "") ||
      identifiers.has(node.id) || typeof node.label !== "string" || !node.label.trim()) {
      throw new Error("Érvénytelen vagy ismétlődő menüazonosító, címke vagy mélység.");
    }
    identifiers.add(node.id);
    if (node.href !== undefined && !/^#\/[a-z0-9/-]*$/.test(node.href)) {
      throw new Error("A menü csak jóváhagyott belső útvonalat használhat.");
    }
    if (node.children !== undefined) {
      if (!Array.isArray(node.children) || node.children.length > 30) {
        throw new Error("Hibás menügyermek-lista.");
      }
      for (const child of node.children) visit(child, depth + 1);
    }
  }
  for (const root of items) visit(root, 1);
  return items;
}
