# Zuhaib Wani — Portfolio (Final)

Self-contained static site. All media local except: UE5 YouTube embed, Sketchfab 3D, Google Fonts.

## Deploy (5 min)
vercel.com → Add New → Project → drag this WHOLE folder → live at zuhaibwani.vercel.app
(Never open/share index.html alone — assets/ must travel with it.)

## ONE-TIME ACTIVATION — message box
The Zuvi "Message Zuhaib" tab sends via FormSubmit to Zuhaibmushtaq95+folio@gmail.com.
After deploying, send yourself ONE test message → FormSubmit emails you an activation
link → click it once. All future messages then arrive automatically, tagged +folio
(create a Gmail filter on "to:+folio" to auto-label them).

## Features
- Dark default · warm light theme (☀️ in nav) — preference remembered
- Minimal SFX, default on (🔊 toggle) — browsers allow sound only after first tap (policy, not a bug)
- Zuvi assistant: answers about Zuhaib, opens projects, serves CV, message form
- Project modals: role/type/tools/deliverables, grouped galleries with captions,
  embedded interactive PDFs (NeuraSphere guidelines+brochure, Presentation system),
  native video ratios (vertical/square respected), lightbox with arrows + keys
- Multi-category projects: same card under every matching filter, cover swaps per filter
- Experience timeline with ATMECS sub-entry + company links; @zuhviz on freelance
- OG share image + favicon: link previews look right on LinkedIn/WhatsApp

## Editing
All content lives in index.html: P array (projects), RECS_LI / RECS_CL (testimonials),
Zuvi answers in Z.answer(). CV = assets/Zuhaib_Wani_CV.pdf (replace anytime, keep name).

## File structure (v10 — separated concerns)
- index.html         → markup only (290 lines)
- assets/css/styles.css → all styles
- assets/js/data.js  → content layer: projects (P), testimonials (RECS_LI, RECS_CL)
- assets/js/app.js   → behavior layer: rendering, modal, gallery, lightbox, PDF viewer, Zuvi, SFX
- assets/img/, assets/video/, assets/docs/ → media
- _headers, netlify.toml, vercel.json → security headers (CSP etc.)
- robots.txt, sitemap.xml → SEO

data.js and app.js load as ordered globals (data first). To edit project copy, edit data.js only.
