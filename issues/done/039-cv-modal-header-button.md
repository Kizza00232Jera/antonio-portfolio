---
title: CV modal + MY CV header button
type: AFK
priority: normal
---

## Parent

issues/036-contact-section-cv-modal.md

## What to build

Add a CV overlay to the site and wire it into the header.

**Header change:** Rename the desktop-only "CONTACT ME ↗" button to "MY CV ↗". Clicking it opens the CV modal. Because the header is a server component, extract a small client component (`CvButton`) that owns the `isOpen` state and renders both the trigger and the modal. The rest of the header stays unchanged.

**CV modal:** A new `CvModal` client component with the interface `{ isOpen: boolean; onClose: () => void }`. It renders as a React portal on `document.body` so z-index stacking is never an issue. Visually: a white/light full-viewport overlay with an X close button top-right, an iframe showing the CV PDF page 1, and a download button.

**PDF display:** The iframe points to `/public/CV_and_Cover_Letter_Telgea_Antonio.pdf` with URL parameters to suppress the PDF toolbar and jump to page 1 (`#page=1&toolbar=0&navpanes=0&scrollbar=0`). Clip the iframe container height so only the first page is visible — second page must not be reachable by scrolling inside the iframe.

**Download button:** An `<a>` tag with `href` pointing to the same PDF and the `download` attribute set to `Antonio_Jerkovic_CV.pdf`.

**Close behaviour — all three must work:**
- X button click
- Backdrop click (the dimmed area outside the content panel)
- ESC key (via `useEffect` keydown listener)

On open: move focus to the X button. On close: restore focus to the "MY CV ↗" trigger.

**Animation:** Keep it simple. GSAP fade-in for the backdrop, slide-up (`y: 40 → 0`) for the white content panel on open. Reverse on close. Duration around 0.35s, ease out.

## Acceptance criteria

- [ ] Header desktop button label reads "MY CV ↗" (replacing "CONTACT ME ↗")
- [ ] Clicking "MY CV ↗" opens the CV modal overlay
- [ ] Modal renders as a full-viewport white overlay above all page content
- [ ] PDF is displayed inside the modal — only page 1 is visible, second page is not reachable by scrolling
- [ ] Download button downloads the PDF with filename `Antonio_Jerkovic_CV.pdf`
- [ ] Modal closes on X button click
- [ ] Modal closes on backdrop click
- [ ] Modal closes on ESC key press
- [ ] Focus moves to X button on open; returns to trigger on close
- [ ] Open/close animation is smooth (no flash, no layout shift)
- [ ] No change to mobile nav — hamburger menu and overlay are untouched
- [ ] `pnpm build` passes

## Blocked by

None — can start immediately
