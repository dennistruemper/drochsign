# Drochsign

**Drochsign** (droch + design) is a minimal visual language where each theme uses exactly **two colors**: a background and a foreground. Like paper and ink — nothing else is needed for structure, hierarchy, or interaction.

- **Library name:** Drochsign
- **CSS file:** `drochsign.css`
- **Theme ids:** `paper`, `ink`, `gamegirl`, etc. — color pairs, not the library name

Inspired by [Pico CSS](https://picocss.com/): write semantic HTML and it looks right. Almost no classes required.

## Core idea

| Role        | Token        | Purpose                          |
|-------------|--------------|----------------------------------|
| Background  | `--color-bg` | Canvas, page, filled surfaces    |
| Foreground  | `--color-fg` | Text, borders, icons, shadows    |
| Body font   | `--font-body` | Optional per theme; system stack by default |
| Code font   | `--font-mono` | Optional per theme; `code` and `pre` |

Every visible element is built from the two colors only. Depth and state come from **geometry and motion**, not from extra hues.

## Themes

A theme is at minimum a color pair on `[data-theme]` (or inline on `<html>` for custom themes):

```css
[data-theme="paper"] {
  --color-bg: #ffffff;
  --color-fg: #111111;
}
```

Themes may optionally override fonts:

```css
[data-theme="sepia"] {
  --color-bg: #f4ecd8;
  --color-fg: #3d2b1f;
  --font-body: "Iowan Old Style", Palatino, Georgia, serif;
}
```

Adding a built-in theme means adding one CSS block and registering it in the theme switcher. **Custom themes** (via [Theme editor](docs/theme-editor.html) or by hand) set the same variables. Export CSS and add it after `drochsign.css`:

```css
[data-theme="my-brand"] {
  --color-bg: #fef08a;
  --color-fg: #14532d;
  --font-body: Georgia, serif;
}
```

```html
<html lang="en" data-theme="my-brand">
```

### Included themes

**Neutral**

| Name   | Background | Foreground | Notes                    |
|--------|------------|------------|--------------------------|
| paper  | `#ffffff`  | `#111111`  | Default — white & black  |
| ink    | `#111111`  | `#f5f5f5`  | Inverted                 |
| sepia  | `#f4ecd8`  | `#3d2b1f`  | Warm reading tone; serif body font |
| slate  | `#e8eaed`  | `#1a1a2e`  | Cool neutral             |

**Colorful**

| Name     | Background | Foreground | Notes                         |
|----------|------------|------------|-------------------------------|
| citrus   | `#fef08a`  | `#14532d`  | Yellow field, deep green ink  |
| ocean    | `#a5f3fc`  | `#0c4a6e`  | Sky wash, navy text           |
| rose     | `#fce7f3`  | `#881337`  | Soft pink, burgundy           |
| forest   | `#064e3b`  | `#6ee7b7`  | Dark emerald, mint (inverted) |
| sunset   | `#ffedd5`  | `#7c2d12`  | Peach paper, burnt orange     |
| electric | `#4c1d95`  | `#fde047`  | Deep violet, bright yellow    |
| coral    | `#fda4af`  | `#1e1b4b`  | Warm coral, indigo            |
| lime     | `#ecfccb`  | `#365314`  | Pale green, olive ink         |
| gamegirl | `#9a9e3f`  | `#1b2a09`  | DMG LCD; monospace body font    |

## Semantic usage

Link `drochsign.css` and write plain HTML. The only optional class is `.shake` (added briefly by JS for error animation).

### Element mapping

| HTML | Styled as |
|------|-----------|
| `body > header` | Page bar (flex, bottom border) |
| `body > main` | Centered content column |
| `section` | Content block with internal spacing |
| `section > h2` | Muted uppercase section label |
| `hr` | Divider |
| `small` | Muted helper text |
| `button`, `[type="submit"]`, `[role="button"]` | Solid button |
| `input`, `textarea`, `select` | Form field |
| `label` | Field label |
| `article` | Card |
| `article > header` | Card title band |
| `article > footer` | Card footer band |
| `[role="group"]` | Horizontal button/field row |
| `[role="alert"]` | Error message (hidden until input is invalid) |
| `output[popover]` | Toast notification (slide-up, auto-dismiss via JS) |
| `main nav` | In-page navigation links |
| `a` | Body links with hover lift |
| `input[type="checkbox"]`, `input[type="radio"]` | Custom two-color controls |
| `fieldset`, `legend` | Grouped form options |
| `table`, `th`, `td` | Bordered data table |
| `blockquote` | Quoted text with left border |
| `details`, `summary` | Accordion / disclosure |

### Page structure

```html
<body>
  <header>
    <strong>Site name</strong>
    <select><!-- nav, theme switcher, etc. --></select>
  </header>
  <main>
    <section>
      <h2>Section label</h2>
      …
    </section>
  </main>
</body>
```

### Card

Every `<article>` renders as a bordered card. Hover thickens the inset border (no layout shift). Optional internal sectioning:

```html
<article>
  <header><h3>Title</h3></header>
  <p>Body copy.</p>
  <footer><button type="button">Action</button></footer>
</article>
```

**Important:** `body > header` is page chrome; `article > header` is card sectioning only. In a blog or feed, every post `<article>` will look like a card — that is intentional (Pico-style tradeoff).

### Error state

No error classes — use ARIA attributes:

```html
<label for="name">Username</label>
<input id="name" type="text" aria-describedby="name-error" aria-invalid="true">
<small id="name-error" role="alert">Only letters are allowed.</small>
```

- `aria-invalid="true"` → dashed border on the input
- Adjacent `[role="alert"]` → message becomes visible (space always reserved)
- JS may add `.shake` once for the wiggle animation

### Toast

Use `<output popover="manual">` for action feedback — inverted fg/bg like a solid button, slides up from the bottom:

```html
<button type="button" id="toast-trigger">Show toast</button>
<output id="toast" popover="manual" role="status" aria-live="polite">Saved.</output>
```

Call `showPopover()` / `hidePopover()` in JS; auto-dismiss with `setTimeout`.

## Interaction without a third color

| Pattern        | Technique                                    |
|----------------|----------------------------------------------|
| Button hover   | Slight scale up (`transform: scale(1.03)`)   |
| Card hover     | Thicker inset border (1px → 2px)             |
| Input focus    | Thicker inset border + subtle lift           |
| Active/pressed | Scale down (`scale(0.97)`)                   |
| Disabled       | Reduced opacity                              |
| Error          | Dashed border, shake animation, alert text   |
| Toast          | Slide up from bottom, solid fg fill          |

All transitions use `--motion-duration` (150ms) and `--motion-ease`.

## Site

| Page | Path |
|------|------|
| Landing | [index.html](index.html) |
| Playground | [example.html](example.html) |
| Documentation | [docs/index.html](docs/index.html) |
| Theme editor | [docs/theme-editor.html](docs/theme-editor.html) |

Component docs: button, text input, textarea, select, card, toast, nav, checkbox & radio, table, blockquote, details — each with live demo and markup snippet.

Shared scripts: [js/themes.js](js/themes.js) (built-in + custom themes, switcher, `localStorage`).

### Theme editor

Create custom themes in the browser, switch between built-in and custom, and export:

- **CSS** — paste into your project after `drochsign.css`
- **JSON** — import later or share; one file or all custom themes

Custom themes are stored in `localStorage` under `drochsign-custom-themes`. Active theme id under `drochsign-theme` (built-in id or `custom:your-id`).

## File structure

```
index.html         ← landing page
example.html       ← all-in-one playground
drochsign.css      ← tokens, themes, semantic element styles
docs.css           ← documentation layout only
js/
  themes.js          ← theme switcher + custom theme storage
  theme-editor.js    ← editor page logic
docs/
  theme-editor.html
  button.html
  input.html
  …                ← one page per component
DESIGN.md          ← this document
```

## Usage

```html
<link rel="stylesheet" href="drochsign.css" />
<html lang="en" data-theme="paper">
```

Switch themes in JavaScript:

```js
document.documentElement.dataset.theme = 'ink';
```

Persist the choice in `localStorage` so it survives reloads (see [js/themes.js](js/themes.js)).

## Principles

1. **Two colors only** — use weight, size, and space instead of a third hue.
2. **Motion over hue** — state changes should feel physical (lift, grow, tighten).
3. **Semantic first** — style elements, not classes; one button style, no variants.
4. **Themes are data** — one `data-theme` attribute swap, no per-component overrides.
5. **Accessible contrast** — each theme pair should meet WCAG AA for normal text.
