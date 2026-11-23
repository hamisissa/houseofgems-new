#!/usr/bin/env python3
"""
Build the House of Gems site.

  python3 tools/build.py

Pages are written in  src/pages/*.html  and share the header/footer in  src/partials/.
Edit those files, then run this script — it writes the finished pages to the site root.
The gemstone map (src/map.html) is built as one fully self-contained file: map.html.
"""
import base64, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, TOOLS = ROOT / "src", ROOT / "tools"

head = (SRC / "partials/head.html").read_text()
header = (SRC / "partials/header.html").read_text()
footer = (SRC / "partials/footer.html").read_text()
mapdata = json.loads((TOOLS / "mapdata.json").read_text())
sites = json.loads((TOOLS / "sites.json").read_text())

def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")

def proj(lat, lon):
    return (lon - mapdata["lon0"]) * mapdata["k"], (mapdata["lat0"] - lat) * mapdata["k"]

def teaser_svg():
    """Small decorative Tanzania outline for the homepage, with glowing dots."""
    colors = {"gem": "#8b6cff", "precious": "#f2cf1a", "industrial": "#3fb8a6", "store": "#ffffff"}
    dots = []
    for i, s in enumerate(sites):
        x, y = proj(s["lat"], s["lon"])
        c = colors[s["cat"]]
        delay = f"{(i % 7) * 0.35:.2f}s"
        ring = f'<circle class="pulse-ring" cx="{x:.1f}" cy="{y:.1f}" r="5" stroke="{c}" style="animation-delay:{delay}"/>' if s["cat"] == "gem" else ""
        dots.append(f'{ring}<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="{c}"/>')
    lakes = "".join(f'<path d="{l["d"]}" fill="rgba(80,130,220,.35)"/>' for l in mapdata["lakes"])
    return (f'<svg viewBox="0 0 {mapdata["w"]} {mapdata["h"]}" role="img" aria-label="Map of Tanzania with gemstone locations">'
            f'<defs><clipPath id="tzclip"><path d="{mapdata["tanzania"]}"/></clipPath></defs>'
            f'<path class="tz" d="{mapdata["tanzania"]}"/><g clip-path="url(#tzclip)">{lakes}</g>{"".join(dots)}</svg>')

pages = sorted((SRC / "pages").glob("*.html"))
for page in pages:
    text = page.read_text()
    m = re.match(r"<!--meta\s+(\{.*?\})\s*-->\s*", text, re.S)
    if not m:
        raise SystemExit(f"{page.name}: missing <!--meta {{...}} --> line")
    meta = json.loads(m.group(1))
    body = text[m.end():]
    hdr = header
    for key in re.findall(r"\{\{ACTIVE:(\w+)\}\}", header):
        hdr = hdr.replace(f"{{{{ACTIVE:{key}}}}}", ' class="is-active" aria-current="page"' if key == meta["nav"] else "")
    out = head.replace("{{TITLE}}", esc(meta["title"])).replace("{{DESC}}", esc(meta["desc"])) + hdr + body + footer
    out = out.replace("{{TZ_TEASER}}", teaser_svg())
    (ROOT / page.name).write_text(out)
    print("built", page.name)

# Self-contained gemstone map
logo = "data:image/png;base64," + base64.b64encode((ROOT / "assets/img/logo-640.png").read_bytes()).decode()
m = (SRC / "map.html").read_text()
m = (m.replace("{{LOGO}}", logo).replace("{{W}}", str(mapdata["w"])).replace("{{H}}", str(mapdata["h"]))
      .replace("{{MAPDATA}}", json.dumps(mapdata, separators=(",", ":")))
      .replace("{{SITES}}", json.dumps(sites, separators=(",", ":"), ensure_ascii=False)))
(ROOT / "map.html").write_text(m)
print("built map.html (self-contained,", round(len(m) / 1024), "KB)")
