# Drochsign

Semantic two-color CSS for the droch stack — background + foreground per theme, minimal classes, works with plain HTML, Elm, and Foldkit.

**Live site:** after GitHub Pages is enabled → `https://<username>.github.io/drochsign/`

## Local preview

```bash
cd design
python3 -m http.server 8080
```

Open http://localhost:8080

## Publish on GitHub Pages

This repo deploys the [`design/`](design/) folder via GitHub Actions (see [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)).

### One-time setup

1. Push this repo to GitHub (see below if you have not yet).
2. On GitHub: **Settings → Pages**
3. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. Push to `main` — the workflow uploads `design/` as the site root.

Your site will be at:

```text
https://<github-username>.github.io/drochsign/
```

### First push

```bash
cd /path/to/drochsign
git init
git add .
git commit -m "Initial Drochsign site and design system"
git branch -M main
git remote add origin https://github.com/<username>/drochsign.git
git push -u origin main
```

Replace `<username>` with your GitHub username. If the remote already exists, skip `git init` / `remote add` and only commit + push.

### After deploy

| Page | URL |
|------|-----|
| Landing | `/` |
| Docs | `/docs/` |
| Theme editor | `/docs/theme-editor.html` |
| Playground | `/example.html` |

All paths are relative, so they work under the `/drochsign/` project prefix.

## Repo layout

```text
design/           ← site root (deployed to Pages)
  index.html        landing
  example.html      playground
  drochsign.css     design system
  docs/             component docs + theme editor
  js/themes.js      theme switcher
DESIGN.md           design notes (in design/DESIGN.md)
.github/workflows/  Pages deploy
```

## Use in a project

Link the stylesheet and pick a theme:

```html
<link rel="stylesheet" href="drochsign.css" />
<html lang="en" data-theme="paper">
```

Custom themes: use the [theme editor](design/docs/theme-editor.html) locally, export CSS, and add it after `drochsign.css`.
