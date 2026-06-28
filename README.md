# Drochsign

Semantic two-color CSS for the droch stack — background + foreground per theme, minimal classes, works with plain HTML, Elm, and Foldkit.

**Live site:** https://dennistruemper.github.io/drochsign/

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Publish on GitHub Pages

Site files live at the repo root. GitHub Actions publishes them to the `gh-pages` branch (see [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)).

### One-time setup

1. Push this repo to GitHub.
2. **Settings → Pages**
3. **Build and deployment → Source:** Deploy from a branch
4. **Branch:** `gh-pages`, folder **`/ (root)`**, then **Save**
5. Push to `main` — the workflow updates `gh-pages`.

Your site will be at:

```text
https://<github-username>.github.io/drochsign/
```

### After deploy

| Page | URL |
|------|-----|
| Landing | `/` |
| Docs | `/docs/` |
| Theme editor | `/docs/theme-editor.html` |
| Playground | `/example.html` |

## Repo layout

```text
index.html          landing
example.html        playground
drochsign.css       design system
docs/               component docs + theme editor
js/themes.js        theme switcher
DESIGN.md           design notes
.github/workflows/  Pages deploy
```

## Use in a project

Link the stylesheet and pick a theme:

```html
<link rel="stylesheet" href="drochsign.css" />
<html lang="en" data-theme="paper">
```

Custom themes: use the [theme editor](docs/theme-editor.html), export CSS, and add it after `drochsign.css`.
