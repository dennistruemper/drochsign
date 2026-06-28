(function () {
  const T = window.drochsignThemes;
  if (!T) return;

  const form = {
    name: document.getElementById('theme-name'),
    id: document.getElementById('theme-id'),
    bg: document.getElementById('theme-bg'),
    fg: document.getElementById('theme-fg'),
    fontBody: document.getElementById('theme-font-body'),
    fontMono: document.getElementById('theme-font-mono'),
  };

  const picker = document.getElementById('editor-theme-picker');
  const exportCss = document.getElementById('export-css');
  const exportJson = document.getElementById('export-json');
  const importInput = document.getElementById('import-json');

  function getFormData() {
    return {
      name: form.name.value.trim(),
      id: form.id.value.trim() || T.slugify(form.name.value),
      bg: form.bg.value,
      fg: form.fg.value,
      fontBody: form.fontBody.value.trim(),
      fontMono: form.fontMono.value.trim(),
    };
  }

  function fillForm(theme) {
    form.name.value = theme.name || '';
    form.id.value = theme.id || '';
    form.bg.value = theme.bg || '#ffffff';
    form.fg.value = theme.fg || '#111111';
    form.fontBody.value = theme.fontBody || '';
    form.fontMono.value = theme.fontMono || '';
    updateExport();
    previewForm();
  }

  function previewForm() {
    T.previewTheme(getFormData());
  }

  function updateExport() {
    const data = getFormData();
    const cssId = data.id || 'my-theme';
    exportCss.textContent = T.themeToCss(data, cssId);
    exportJson.textContent = T.themeToJson({ ...data, id: cssId, name: data.name || cssId });
  }

  function populatePicker() {
    const current = picker.value;
    picker.innerHTML = '<option value="">— New theme —</option>';
    T.BUILTIN.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.label} (built-in)`;
      picker.appendChild(opt);
    });
    T.getCustomThemes().forEach((t) => {
      const opt = document.createElement('option');
      opt.value = T.customRef(t.id);
      opt.textContent = t.name;
      picker.appendChild(opt);
    });
    if ([...picker.options].some((o) => o.value === current)) {
      picker.value = current;
    }
  }

  picker.addEventListener('change', () => {
    const val = picker.value;
    if (!val) {
      fillForm({ name: '', id: '', bg: '#ffffff', fg: '#111111', fontBody: '', fontMono: '' });
      return;
    }
    if (T.isCustomRef(val)) {
      const theme = T.findCustom(T.customIdFromRef(val));
      if (theme) fillForm(theme);
    } else {
      const theme = T.findBuiltin(val);
      if (theme) fillForm({ ...theme, name: `${theme.label} copy`, id: T.slugify(`${theme.label} copy`) });
    }
  });

  Object.values(form).forEach((el) => {
    el.addEventListener('input', () => {
      previewForm();
      updateExport();
    });
  });

  form.name.addEventListener('input', () => {
    if (!form.id.dataset.touched) {
      form.id.value = T.slugify(form.name.value);
    }
  });

  form.id.addEventListener('input', () => {
    form.id.dataset.touched = 'true';
  });

  document.getElementById('save-theme').addEventListener('click', () => {
    const data = getFormData();
    if (!data.name || !data.id) return;
    try {
      const saved = T.saveCustomTheme(data);
      T.applyTheme(T.customRef(saved.id));
      form.id.dataset.touched = 'true';
      populatePicker();
      picker.value = T.customRef(saved.id);
      T.initThemeSwitcher(document.getElementById('theme-switcher'));
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('apply-theme').addEventListener('click', () => {
    const data = getFormData();
    const custom = T.getCustomThemes().find((t) => t.id === data.id);
    if (custom) {
      T.applyTheme(T.customRef(custom.id));
    } else {
      previewForm();
    }
  });

  document.getElementById('delete-theme').addEventListener('click', () => {
    const ref = picker.value;
    if (!T.isCustomRef(ref)) return;
    const id = T.customIdFromRef(ref);
    if (!confirm(`Delete theme "${id}"?`)) return;
    T.deleteCustomTheme(id);
    populatePicker();
    picker.value = '';
    fillForm({ name: '', id: '', bg: '#ffffff', fg: '#111111', fontBody: '', fontMono: '' });
    T.initThemeSwitcher(document.getElementById('theme-switcher'));
  });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copy);
      navigator.clipboard.writeText(target.textContent);
    });
  });

  document.querySelectorAll('[data-download]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const data = getFormData();
      const id = data.id || 'my-theme';
      if (btn.dataset.download === 'css') {
        downloadFile(`${id}.css`, T.themeToCss(data, id));
      } else if (btn.dataset.download === 'json') {
        downloadFile(`${id}.json`, T.themeToJson({ ...data, id, name: data.name || id }));
      } else if (btn.dataset.download === 'all-css') {
        downloadFile('drochsign-themes.css', T.exportAllCustomCss());
      } else if (btn.dataset.download === 'all-json') {
        downloadFile('drochsign-themes.json', T.exportAllCustomJson());
      }
    });
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = T.importCustomThemes(reader.result);
        populatePicker();
        if (imported[0]) {
          picker.value = T.customRef(imported[0].id);
          fillForm(imported[0]);
        }
        T.initThemeSwitcher(document.getElementById('theme-switcher'));
      } catch {
        alert('Invalid JSON file.');
      }
      importInput.value = '';
    };
    reader.readAsText(file);
  });

  function downloadFile(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  populatePicker();
  const active = T.getActiveRef();
  if (T.isCustomRef(active)) {
    picker.value = active;
    const theme = T.findCustom(T.customIdFromRef(active));
    if (theme) fillForm(theme);
  } else {
    fillForm(T.findBuiltin(active) || T.BUILTIN[0]);
  }

  document.addEventListener('drochsign:themes-changed', populatePicker);
})();
