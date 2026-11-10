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

  const save = () => W.save(settings);
  const saveSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
  };

  // Draw a theme into an element: animated SVG as a background, or cycling text.
  function paint(el, theme) {
    clearInterval(el._timer);
    el._timer = null;
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
  }

  /* ---------- Views ---------- */

  function showView(name) {
    for (const b of $('views').children) b.setAttribute('aria-selected', String(b.dataset.view === name));
    $('view-look').hidden = name !== 'look';
    $('view-options').hidden = name !== 'options';
  }
  for (const b of $('views').children) b.addEventListener('click', () => showView(b.dataset.view));

  /* ---------- Companion view ---------- */

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

  function renderSize() {
    $('size').replaceChildren(
      ...Object.entries(W.SIZES).map(([key, size]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.role = 'radio';
        b.textContent = size.name;
        b.setAttribute('aria-checked', String(key === (settings.size || 'm')));
        b.addEventListener('click', () => {
          settings.size = key;
          save();
          renderSize();
          renderPreview();
        });
        return b;
      })
    );
  }

  /* ---------- Preview: companion, rotating phrase, counter ---------- */

  let phraseTimer = null;
  let clockTimer = null;
  function renderPreview() {
    const art = $('pvArt');
    const theme = W.themeById(settings.theme);
    const size = W.SIZES[settings.size] || W.SIZES.m;
    paint(art, theme);
    art.style.width = art.style.height = theme.type === 'svg' ? size.px + 'px' : '';
    art.style.fontSize = theme.type === 'text' ? 14 * size.em + 'px' : '';

    clearInterval(phraseTimer);
    const text = $('pvText');
    const phrases = settings.swapText ? W.cleanPhrases(settings.phrases) : [];
    if (phrases.length) {
      let i = 0;
      const show = () => {
        text.textContent = phrases[i % phrases.length];
        text.classList.remove('swap');
        void text.offsetWidth; // restart the animation
        text.classList.add('swap');
        i++;
      };
      show();
      phraseTimer = setInterval(show, 2600);
    } else {
      text.classList.remove('swap');
      text.textContent = 'The site keeps its own status text';
    }

    clearInterval(clockTimer);
    const time = $('pvTime');
    time.textContent = '';
    if (settings.timer) {
      const started = Date.now();
      const draw = () => (time.textContent = W.formatElapsed(Date.now() - started + 1000));
      draw();
      clockTimer = setInterval(draw, 1000);
    }
  }

  /* ---------- Options view ---------- */

  function renderActivities() {
    $('acts').classList.toggle('off', !settings.adaptive);
    if ($('acts').childElementCount) return;
    $('acts').append(
      ...W.activities.map((activity) => {
        const item = document.createElement('div');
        item.className = 'act';
        const art = document.createElement('span');
        art.style.backgroundImage = W.iconUrl(activity);
        item.append(art, activity.name);
        return item;
      })
    );
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
    $('adaptive').checked = settings.adaptive;
    $('timer').checked = settings.timer;
    $('swapText').checked = settings.swapText;
    $('phrases').disabled = !settings.swapText;
    renderActivities();
  }

  // Bind a checkbox to a boolean setting.
  const bindSwitch = (id, key) =>
    $(id).addEventListener('change', (e) => {
      settings[key] = e.target.checked;
      save();
      renderControls();
      renderPreview();
    });

  // Header logo is the default companion.
  $('logo').style.backgroundImage = W.iconUrl(W.themeById('mochi'));

  bindSwitch('enabled', 'enabled');
  bindSwitch('adaptive', 'adaptive');
  bindSwitch('timer', 'timer');
  bindSwitch('swapText', 'swapText');

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
  renderSize();
  renderPreview();
  renderSites();
})();
