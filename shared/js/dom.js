/** Egyetlen, biztonságos DOM-építő: a tartalom sosem kerül innerHTML-be. */
export function element(tag, { className = "", text, attributes = {} } = {}, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) node.setAttribute(name, String(value));
  }
  for (const child of children.flat()) {
    if (child !== null && child !== undefined) node.append(child);
  }
  return node;
}

export function branding(config) {
  return element("div", { className: "brand", attributes: { "aria-label": config.site.fullName } },
    element("span", { className: "brand-name", text: config.site.name }),
    element("span", { className: "brand-subtitle", text: config.site.subtitle }));
}

export function crest(config) {
  return element("img", { className: "crest", attributes: {
    src: config.site.crest, alt: config.site.crestAlt, width: 192, height: 192,
    decoding: "async", fetchpriority: "high"
  } });
}

export function skipLink(config) {
  return element("a", { className: "skip-link", text: config.ui.skipToContent,
    attributes: { href: "#content" } });
}

export function motto(config) {
  return element("p", { className: "motto", text: config.site.motto });
}

export function footer(config, className) {
  return element("footer", { className },
    element("span", { text: config.ui.footerText }),
    element("a", { text: config.ui.backToTop, attributes: { href: "#app" } }));
}
