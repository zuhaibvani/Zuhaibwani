# Site Architecture Rules — Permanent

These are standing technical requirements for zuhaibwani.vercel.app. Read this before editing `app.js`, `index.html`, or `styles.css`. Anything listed here has already regressed once — do not remove or "simplify away" this logic without checking here first.

---

## 1. Every project MUST be shareable via a direct link

**Reported bug (twice):** clicking a project opens a modal, but there was no way to get a URL to that specific project — the URL never changed, so nothing could be copied, bookmarked, or sent to anyone. This is fixed as of the commit that added this file. Do not reintroduce it.

**How it works (`assets/js/app.js`):**

- `openProject(id)` calls `history.pushState({project:id}, '', '#project='+id)` — this changes the URL to `https://zuhaibwani.vercel.app/#project=<id>` without a page reload.
- `closeProject()` clears the hash back to the base URL the same way.
- `window.addEventListener('popstate', ...)` keeps browser Back/Forward in sync with the modal (Back closes the project, Forward reopens it).
- `window.addEventListener('hashchange', ...)` handles a pasted or manually-edited `#project=<id>` URL while the page is already open.
- An IIFE (`openProjectFromInitialURL`) runs once on page load and opens the right project automatically if the page was loaded directly with a `#project=<id>` hash already in the URL — this is what makes a shared link actually work for the person who receives it.
- `document.title` is updated to the project name while its modal is open, and restored to `BASE_TITLE` on close.

**The Share button (`index.html`, inside `.pm-bar`, `id="pmshare"`):**

- On mobile / any browser that supports it: uses `navigator.share()` to open the native share sheet (Messages, WhatsApp, Mail, etc.) with the direct project URL.
- On desktop / unsupported browsers: copies the URL to the clipboard via `navigator.clipboard.writeText()` and shows a brief "Copied ✓" confirmation on the button itself.
- This must remain reachable both on desktop (mouse click) and mobile (tap) — do not hide it behind a hover-only state.

**Non-negotiable when touching this code:**

- Every project card/row that calls `openProject(p.id)` must keep working with this same `id` — do not rename project ids in `data.js` without checking `app.js` still matches, or all existing shared links break.
- Do not remove the `pushState`/`popstate`/`hashchange`/initial-hash-open logic as part of an unrelated refactor. If `openProject`/`closeProject` are rewritten, this deep-linking behavior must be carried over.
- Do not remove the `#pmshare` button from `index.html`, and do not delete its click handler from `app.js`, without replacing it with an equivalent way to get a shareable link to the open project.

---

## 2. Positioning and copy rules

See `POSITIONING_APPROVED.md` at the repo root for the approved hero/About/Why-Me/meta/schema copy and the two standing rules on the Python/HTML skills framing and rejected phrases ("whatever the brief," "survive scrutiny," "infrastructure scale"). That file governs wording; this file governs technical behavior. Keep them separate, keep both current.
