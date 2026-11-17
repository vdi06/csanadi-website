"""Statikus HTML-szemantikai kapu, külső Python-csomag nélkül.

A futás nem helyettesíti a böngésző DOM-jának és a képernyőolvasó
közvetített akadálymentességi fájának élő ellenőrzését.
"""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
PAGES = [ROOT / "index.html", *sorted((ROOT / "tools").glob("*.html"))]


class Inspector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.alt_missing = []
        self.lang = False
        self.viewport = False
        self.invalid_control = []
        self.unnamed_buttons = []
        self.button_stack = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        if tag == "img" and "alt" not in attributes:
            self.alt_missing.append(attributes.get("src", "?"))
        if tag == "html" and attributes.get("lang") == "hu":
            self.lang = True
        if tag == "meta" and attributes.get("name") == "viewport":
            self.viewport = True
        if tag in ("button", "input") and attributes.get("aria-label") == "":
            self.invalid_control.append(attributes.get("id", tag))
        if tag == "button":
            self.button_stack.append([attributes, ""])

    def handle_data(self, data):
        if self.button_stack:
            self.button_stack[-1][1] += data

    def handle_endtag(self, tag):
        if tag != "button" or not self.button_stack:
            return
        attributes, visible_text = self.button_stack.pop()
        if not any((attributes.get("aria-label"), attributes.get("aria-labelledby"),
                    attributes.get("title"), visible_text.strip())):
            self.unnamed_buttons.append(attributes.get("id", attributes.get("class", "button")))


results = []
for page in PAGES:
    parser = Inspector()
    parser.feed(page.read_text(encoding="utf-8"))
    duplicates = [value for value, count in Counter(parser.ids).items() if count > 1]
    failures = []
    if not parser.lang:
        failures.append("hiányzó magyar dokumentumnyelv")
    if not parser.viewport:
        failures.append("hiányzó viewport")
    if duplicates:
        failures.append("ismétlődő DOM-azonosítók: " + ", ".join(duplicates))
    if parser.alt_missing:
        failures.append("alt nélküli képek: " + ", ".join(parser.alt_missing))
    if parser.invalid_control:
        failures.append("üres aria-label: " + ", ".join(parser.invalid_control))
    if parser.unnamed_buttons:
        failures.append("név nélküli gombok: " + ", ".join(parser.unnamed_buttons))
    results.append({"page": str(page.relative_to(ROOT)), "ok": not failures, "failures": failures})

failed = [item for item in results if not item["ok"]]
print(json.dumps({
    "release": "1.39.5",
    "htmlPages": len(results),
    "passed": len(results) - len(failed),
    "failed": failed,
}, ensure_ascii=False, indent=2))
if failed:
    raise SystemExit(1)
