# Zuhaib Wani — Portfolio (Final)

Self-contained static site. All media local except: UE5 YouTube embed, Sketchfab 3D, Google Fonts.

## Deploy (5 min)
vercel.com → Add New → Project → drag this WHOLE folder → live at zuhaibwani.vercel.app
(Never open/share index.html alone — assets/ must travel with it.)

## Contact
No on-site chat or message form. Visitors reach Zuhaib via the mailto link and the
LinkedIn link in the Contact section — nothing to activate or maintain.

`api/chat.js` is a disabled stub (returns HTTP 410). It exists only because this repo
has no delete-file workflow; it performs no function and calls no external API.

## Features
- Dark default · warm light theme (☀️ in nav) — preference remembered
- Minimal SFX, **off by default** (🔊 toggle to turn on) — browsers allow sound only
  after first tap (policy, not a bug)
- Project modals: role/type/tools/deliverables, grouped galleries with captions,
  embedded interactive PDFs (NeuraSphere guidelines+brochure, Presentation system),
  native video ratios (vertical/square respected), lightbox with arrows + keys
- Multi-category projects: same card under every matching filter, cover swaps per filter
- Experience timeline with ATMECS sub-entry + company links; @zuhviz on freelance
- OG share image + favicon: link previews look right on LinkedIn/WhatsApp
- Images/video use a subtle `-webkit-user-drag:none` only — no right-click blocking,
  no keyboard blocking, no fake "protected" messaging

## Editing
All content lives in index.html: P array (projects) and RECS_LI / RECS_CL (testimonials)
are in `assets/js/data.js`. CV = assets/Zuhaib_Wani_CV.pdf (replace anytime, keep name).

Availability banner + CV routing are controlled by `assets/js/config.js`
(`window.SITE_CONFIG.availability`), editable via the hidden admin panel
(type "zwa" anywhere on the page, or visit `/#zwadmin`).

## File structure
- index.html            → markup only
- assets/css/styles.css → all styles
- assets/js/data.js     → content layer: projects (P), testimonials (RECS_LI, RECS_CL)
- assets/js/config.js   → availability + CV-download toggles
- assets/js/app.js      → behavior layer: rendering, modal, gallery, lightbox, PDF viewer, SFX
- assets/img/, assets/video/, assets/docs/ → media
- vercel.json           → security headers (CSP etc.)
- robots.txt, sitemap.xml → SEO

data.js, config.js, and app.js load as ordered globals (data/config first). To edit
project copy, edit data.js only.
