# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PJ's Universe (pjsuniverse.com) — a static website for two brands: **PJ's Autography** (racetrack photography) and **PJ's Scaleworks** (scale model builds and aftermarket parts), plus a "PJ Sorter" app landing page. There is no framework, bundler, or test suite — just hand-written HTML pages, one shared CSS file, one shared JS file, and a Node build script.

## Commands

```sh
npm run build   # node build.js — regenerates photos.json from the photos/ folder
```

That is the only command. Requires Node >= 18, no dependencies to install. There are no tests or linters. To preview the site, serve the repo root with any static server (pages fetch `/photos.json` with an absolute path, so opening files via `file://` won't load galleries).

## Architecture

### Photo pipeline (the core mechanism)

1. Photos are dropped into `photos/<section>/<category>/` (sections: `track`, `builds`, `parts`).
2. `build.js` scans those folders and writes `photos.json`. The build comment says it runs during the Cloudflare Pages build, but the generated `photos.json` is also committed to the repo.
3. Pages (`index.html`, `portfolio.html`) fetch `/photos.json` at runtime and render galleries client-side.

Conventions enforced by `build.js`:
- Valid categories are hard-coded in the `STRUCTURE` constant at the top of `build.js` (with `label` and `description` per category). To add/rename a gallery category, edit `STRUCTURE` — folders not listed there are ignored.
- Filenames control ordering and captions: files sort alphabetically (use a `01-` numeric prefix to order), and the filename becomes the caption (`01-spa-start.jpg` → "Spa Start"). Allowed extensions: jpg, jpeg, png, webp.
- The first photo in a category becomes its cover image.
- A file named `hero.*` directly in `photos/` becomes the site hero image.

Note: `photos.json` is generated output. Don't hand-edit it for content changes — change the folders or `build.js` and rerun the build.

### Pages and shared code

- Each HTML page is self-contained: it links `style.css` (global design system, CSS custom properties like `--gold`, `--muted`, `--pad`) and carries its own page-specific styles in an inline `<style>` block. Follow that pattern for new pages.
- `shared.js` is loaded by all pages and provides the global behaviors: the custom racecar cursor, nav scroll/mobile menu, scroll-reveal (`.reveal` class + IntersectionObserver), the lightbox, image right-click/drag/save protection, and the gallery builders (`buildGallery`, `buildSeriesCards`, `buildPhotoObjects`). Reuse these instead of writing per-page gallery code.
- Pages: `index.html` (home/hero), `portfolio.html` (track + builds galleries), `autography.html` (photography brand), `scaleworks.html` (models brand), `parts.html` (aftermarket parts), `sorter.html` (PJ Sorter, coming-soon page), `contact.html` (booking form — uses a Netlify form attribute with a `mailto:` fallback).

### Deployment artifacts

`CNAME` (pjsuniverse.com) and `.nojekyll` at the repo root are deployment configuration — don't remove them. The site root is the repo root; there is no build output directory.
