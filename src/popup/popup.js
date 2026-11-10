/*
 * Waitlings: popup. Reads and writes the settings object in chrome.storage.
 * The content script listens for storage changes, so open tabs update live.
 */
(async () => {
  const W = globalThis.Waitlings;
  const $ = (id) => document.getElementById(id);

  let settings = await W.load();
  let openPack = W.themeById(settings.theme).pack;
  let saveTimer = null;
  const frameTimers = new Set();

  const save = () => W.save(settings);
  const saveSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
  };

  // Draw a theme into an element: animated SVG as a background, or cycling text.
  function paint(el, theme) {
    if (el._timer) {
      clearInterval(el._timer);
      frameTimers.delete(el._timer);
      el._timer = null;
    }
    el.textContent = '';
    el.style.backgroundImage = '';
    el.classList.toggle('text', theme.type === 'text');
    if (theme.type === 'svg') {
      el.style.backgroundImage = W.iconUrl(theme);
      return;
    }
    let i = 0;
    el.textContent = theme.frames[0];
    el._timer = setInterval(() => {
      i = (i + 1) % theme.frames.length;
      el.textContent = theme.frames[i];
    }, theme.interval);
    frameTimers.add(el._timer);
  }

  function renderTabs() {
    $('tabs').replaceChildren(
      ...W.packs.map((pack) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.role = 'tab';
        b.textContent = pack.name;
        b.setAttribute('aria-selected', String(pack.id === openPack));
        b.addEventListener('click', () => {
          openPack = pack.id;
          renderTabs();
          renderGrid();
        });
        return b;
      })
    );
  }

  function renderGrid() {
    $('grid').replaceChildren(
      ...W.themes
        .filter((t) => t.pack === openPack)
        .map((theme) => {
          const tile = document.createElement('button');
          tile.type = 'button';
          tile.className = 'tile';
          tile.setAttribute('aria-pressed', String(theme.id === settings.theme));
          const art = document.createElement('span');
          art.className = 'art';
          paint(art, theme);
          const name = document.createElement('span');
          name.textContent = theme.name;
          tile.append(art, name);
          tile.addEventListener('click', () => {
            settings.theme = theme.id;
            save();
            renderGrid();
            renderPreview();
          });
          return tile;
        })
    );
  }

  // Preview: the selected companion beside a rotating phrase.
  let previewTimer = null;
  function renderPreview() {
    paint($('pvArt'), W.themeById(settings.theme));
    clearInterval(previewTimer);
    const text = $('pvText');
    const phrases = settings.swapText ? W.cleanPhrases(settings.phrases) : [];
    if (!phrases.length) {
      text.textContent = 'The site keeps its own status text';
      return;
    }
    let i = 0;
    const show = () => {
      text.textContent = phrases[i % phrases.length];
      text.classList.remove('swap');
      void text.offsetWidth; // restart the animation
      text.classList.add('swap');
      i++;
    };
    show();
    previewTimer = setInterval(show, 2600);
  }

  function renderSites() {
    $('sites').replaceChildren(
      ...W.adapters.map((adapter) => {
        const row = document.createElement('div');
        row.className = 'site';
        const label = document.createElement('div');
        label.textContent = adapter.name;
        const hostLine = document.createElement('small');
        hostLine.textContent = adapter.hosts.join(', ');
        label.append(hostLine);
        const sw = document.createElement('label');
        sw.className = 'switch small';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = settings.sites[adapter.id] !== false;
        input.setAttribute('aria-label', `Use Waitlings on ${adapter.name}`);
        input.addEventListener('change', () => {
          settings.sites = { ...settings.sites, [adapter.id]: input.checked };
          save();
        });
        sw.append(input, document.createElement('span'));
        row.append(label, sw);
        return row;
      })
    );
  }

  function renderControls() {
    $('enabled').checked = settings.enabled;
    $('main').classList.toggle('off', !settings.enabled);
    $('swapText').checked = settings.swapText;
    $('phrases').disabled = !settings.swapText;
  }

  // Header logo is the default companion.
  $('logo').style.backgroundImage = W.iconUrl(W.themeById('mochi'));

  $('enabled').addEventListener('change', (e) => {
    settings.enabled = e.target.checked;
    save();
    renderControls();
  });

  $('swapText').addEventListener('change', (e) => {
    settings.swapText = e.target.checked;
    save();
    renderControls();
    renderPreview();
  });

  $('phrases').value = W.cleanPhrases(settings.phrases).join('\n');
  $('phrases').addEventListener('input', (e) => {
    settings.phrases = W.cleanPhrases(e.target.value.split('\n'));
    saveSoon();
    renderPreview();
  });

  $('reset').addEventListener('click', () => {
    settings.phrases = [...W.DEFAULT_PHRASES];
    $('phrases').value = settings.phrases.join('\n');
    save();
    renderPreview();
  });

  renderControls();
  renderTabs();
  renderGrid();
  renderPreview();
  renderSites();
})();
