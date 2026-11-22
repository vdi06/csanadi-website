/** Kis DOM-építő: feliratok és útvonalak kizárólag JSON-adatokból érkeznek. */
export function element(tag, { className = "", text, attributes = {} } = {}, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child !== undefined && child !== null) node.append(child);
  }
  return node;
}

export function crest(config, className = "school-crest") {
  return element("img", { className, attributes: {
    src: config.site.crest,
    alt: config.site.crestAlt,
    width: 512,
    height: 512,
    decoding: "async"
  } });
}

