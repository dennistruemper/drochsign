(function () {
  const CUSTOM_KEY = 'drochsign-custom-themes';
  const ACTIVE_KEY = 'drochsign-theme';
  const THEME_VARS = ['--color-bg', '--color-fg', '--font-body', '--font-mono'];
  const CUSTOM_PREFIX = 'custom:';

  const BUILTIN = [
    { id: 'paper', label: 'Paper', bg: '#ffffff', fg: '#111111' },
    { id: 'ink', label: 'Ink', bg: '#111111', fg: '#f5f5f5' },
    { id: 'sepia', label: 'Sepia', bg: '#f4ecd8', fg: '#3d2b1f', fontBody: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif' },
    { id: 'slate', label: 'Slate', bg: '#e8eaed', fg: '#1a1a2e' },
    { id: 'citrus', label: 'Citrus', bg: '#fef08a', fg: '#14532d' },
    { id: 'ocean', label: 'Ocean', bg: '#a5f3fc', fg: '#0c4a6e' },
    { id: 'rose', label: 'Rose', bg: '#fce7f3', fg: '#881337' },
    { id: 'forest', label: 'Forest', bg: '#064e3b', fg: '#6ee7b7' },
    { id: 'sunset', label: 'Sunset', bg: '#ffedd5', fg: '#7c2d12' },
    { id: 'electric', label: 'Electric', bg: '#4c1d95', fg: '#fde047' },
    { id: 'coral', label: 'Coral', bg: '#fda4af', fg: '#1e1b4b' },
    { id: 'lime', label: 'Lime', bg: '#ecfccb', fg: '#365314' },
    { id: 'gamegirl', label: 'Game Girl', bg: '#9a9e3f', fg: '#1b2a09', fontBody: 'ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace', fontMono: 'var(--font-body)' },
  ];

  function slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'theme';
  }

  function getCustomThemes() {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setCustomThemes(themes) {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(themes));
    document.dispatchEvent(new CustomEvent('drochsign:themes-changed'));
  }

  function isCustomRef(ref) {
    return ref.startsWith(CUSTOM_PREFIX);
  }

  function customIdFromRef(ref) {
    return ref.slice(CUSTOM_PREFIX.length);
  }

  function customRef(id) {
    return `${CUSTOM_PREFIX}${id}`;
  }

  function findBuiltin(id) {
    return BUILTIN.find((t) => t.id === id);
  }

  function findCustom(id) {
    return getCustomThemes().find((t) => t.id === id);
  }

  function findTheme(ref) {
    if (isCustomRef(ref)) {
      const custom = findCustom(customIdFromRef(ref));
      return custom ? { ...custom, ref, builtin: false } : null;
    }
    const builtin = findBuiltin(ref);
    return builtin ? { ...builtin, ref, builtin: true } : null;
  }

  function clearInlineVars(root) {
    THEME_VARS.forEach((name) => root.style.removeProperty(name));
  }

  function applyTokens(root, theme) {
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-fg', theme.fg);
    if (theme.fontBody) {
      root.style.setProperty('--font-body', theme.fontBody);
    } else {
      root.style.removeProperty('--font-body');
    }
    if (theme.fontMono) {
      root.style.setProperty('--font-mono', theme.fontMono);
    } else {
      root.style.removeProperty('--font-mono');
    }
  }

  function previewTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme.id || 'preview';
    applyTokens(root, theme);
  }

  function applyTheme(ref) {
    const root = document.documentElement;
    clearInlineVars(root);

    if (isCustomRef(ref)) {
      const theme = findCustom(customIdFromRef(ref));
      if (!theme) return false;
      root.dataset.theme = theme.id;
      applyTokens(root, theme);
    } else if (findBuiltin(ref)) {
      root.dataset.theme = ref;
    } else {
      return false;
    }

    localStorage.setItem(ACTIVE_KEY, ref);
    document.dispatchEvent(new CustomEvent('drochsign:theme-applied', { detail: { ref } }));
    return true;
  }

  function getActiveRef() {
    return localStorage.getItem(ACTIVE_KEY) || 'paper';
  }

  function saveCustomTheme(theme) {
    const themes = getCustomThemes();
    const id = theme.id || slugify(theme.name);
    if (findBuiltin(id)) {
      throw new Error(`Theme id "${id}" conflicts with a built-in theme.`);
    }
    const entry = {
      id,
      name: theme.name || id,
      bg: theme.bg,
      fg: theme.fg,
      fontBody: theme.fontBody || '',
      fontMono: theme.fontMono || '',
    };
    const index = themes.findIndex((t) => t.id === id);
    if (index >= 0) {
      themes[index] = entry;
    } else {
      themes.push(entry);
    }
    setCustomThemes(themes);
    return entry;
  }

  function deleteCustomTheme(id) {
    setCustomThemes(getCustomThemes().filter((t) => t.id !== id));
    if (getActiveRef() === customRef(id)) {
      applyTheme('paper');
    }
  }

  function themeToCss(theme, dataThemeId) {
    const id = dataThemeId || theme.id;
    const lines = [
      `[data-theme="${id}"] {`,
      `  --color-bg: ${theme.bg};`,
      `  --color-fg: ${theme.fg};`,
    ];
    if (theme.fontBody) lines.push(`  --font-body: ${theme.fontBody};`);
    if (theme.fontMono) lines.push(`  --font-mono: ${theme.fontMono};`);
    lines.push('}');
    return lines.join('\n');
  }

  function themeToJson(theme) {
    return JSON.stringify(
      {
        id: theme.id,
        name: theme.name,
        bg: theme.bg,
        fg: theme.fg,
        ...(theme.fontBody ? { fontBody: theme.fontBody } : {}),
        ...(theme.fontMono ? { fontMono: theme.fontMono } : {}),
      },
      null,
      2
    );
  }

  function exportAllCustomCss() {
    return getCustomThemes().map((t) => themeToCss(t)).join('\n\n');
  }

  function exportAllCustomJson() {
    return JSON.stringify(getCustomThemes(), null, 2);
  }

  function importCustomThemes(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const normalized = list.map((t) => ({
      id: t.id || slugify(t.name || 'theme'),
      name: t.name || t.id,
      bg: t.bg,
      fg: t.fg,
      fontBody: t.fontBody || '',
      fontMono: t.fontMono || '',
    }));
    const merged = [...getCustomThemes()];
    normalized.forEach((t) => {
      const i = merged.findIndex((m) => m.id === t.id);
      if (i >= 0) merged[i] = t;
      else merged.push(t);
    });
    setCustomThemes(merged);
    return normalized;
  }

  function populateThemeSwitcher(select) {
    if (!select) return;
    const active = getActiveRef();
    select.innerHTML = '';

    const builtinGroup = document.createElement('optgroup');
    builtinGroup.label = 'Built-in';
    BUILTIN.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      if (t.id === active) opt.selected = true;
      builtinGroup.appendChild(opt);
    });
    select.appendChild(builtinGroup);

    const custom = getCustomThemes();
    if (custom.length) {
      const customGroup = document.createElement('optgroup');
      customGroup.label = 'Custom';
      custom.forEach((t) => {
        const opt = document.createElement('option');
        opt.value = customRef(t.id);
        opt.textContent = t.name;
        if (customRef(t.id) === active) opt.selected = true;
        customGroup.appendChild(opt);
      });
      select.appendChild(customGroup);
    }
  }

  function initThemeSwitcher(select) {
    if (!select) return;
    populateThemeSwitcher(select);
    select.addEventListener('change', () => applyTheme(select.value));
    document.addEventListener('drochsign:themes-changed', () => populateThemeSwitcher(select));
  }

  function init() {
    applyTheme(getActiveRef());
    initThemeSwitcher(document.getElementById('theme-switcher'));
  }

  window.drochsignThemes = {
    BUILTIN,
    CUSTOM_PREFIX,
    customRef,
    isCustomRef,
    slugify,
    getCustomThemes,
    saveCustomTheme,
    deleteCustomTheme,
    findTheme,
    findBuiltin,
    findCustom,
    applyTheme,
    previewTheme,
    getActiveRef,
    themeToCss,
    themeToJson,
    exportAllCustomCss,
    exportAllCustomJson,
    importCustomThemes,
    populateThemeSwitcher,
    initThemeSwitcher,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
