HOUSE OF GEMS TANZANIA — WEBSITE
================================

Open index.html in any browser to view the site. Everything it needs is in this folder.

PAGES
  index.html       Home (photo slider)
  tanzanite.html   All about Tanzanite, grading, loose stones, care
  jewelry.html     Rings, pendants, earrings, bracelets, cufflinks, beads, custom design
  gemstones.html   Gemstones of Tanzania
  map.html         Interactive Gemstone & Mineral Map (fully self-contained single file)
  about.html       Our story, strengths, CSR
  showrooms.html   Flagship + boutiques
  contact.html     Enquiry form (sends via WhatsApp)

EDITING
  Page content lives in   src/pages/*.html
  Shared header/footer in src/partials/
  Map page template in    src/map.html, its locations in tools/sites.json
  After editing, rebuild:  python3 tools/build.py
  Styles: assets/css/style.css   Scripts: assets/js/main.js   Images: assets/img/

PUBLISHING
  Upload the built .html files and the assets/ folder to any web host
  (src/ and tools/ are only needed for editing).
