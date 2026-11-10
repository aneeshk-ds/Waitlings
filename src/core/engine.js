/*
 * Waitlings: content-script engine.
 *
 * Picks the adapter for the current site, injects the stylesheet from css.js,
 * and keeps the text frames and phrases rotating while the site is loading.
 * It adds two <style> elements to the page and nothing else.
 */
(() => {
  const W = globalThis.Waitlings;
  const host = location.hostname;
  const adapter = W.adapters.find((a) => a.hosts.some((h) => host === h || host.endsWith('.' + h)));
  if (!adapter) return;

  const TICK_MS = 150;
  const PHRASE_MS = 3000;

  let settings = W.defaults();
  let theme = W.themeById(settings.theme);
  let phrases = [];
  let rulesEl = null; // static rules, rebuilt when settings change
  let varsEl = null; // custom properties, rewritten as frames and phrases rotate
  let timer = null;
  let frameIndex = 0;
  let phraseIndex = -1;
  let lastFrameAt = 0;
  let lastPhraseAt = 0;
  let fadeFlip = false;

  const isOn = () => settings.enabled && settings.sites[adapter.id] !== false;

  const shuffle = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const makeStyle = (id) => {
    const el = document.createElement('style');
    el.id = id;
    return el;
  };

  const mount = (el) => {
    if (el && !el.isConnected) (document.head || document.documentElement).appendChild(el);
  };

  function writeVars() {
    const vars = [];
    if (theme.type === 'svg') vars.push(`--wl-icon:${W.iconUrl(theme)}`);
    if (theme.type === 'text') vars.push(`--wl-frame:${W.cssString(theme.frames[frameIndex % theme.frames.length])}`);
    if (phraseIndex >= 0 && phrases.length) {
      vars.push(`--wl-phrase:${W.cssString(phrases[phraseIndex % phrases.length])}`);
      vars.push(`--wl-fade:${fadeFlip ? 'wl-fade-a' : 'wl-fade-b'}`);
    }
    varsEl.textContent = `:root{${vars.join(';')}}`;
  }

  function tick(force) {
    mount(rulesEl);
    mount(varsEl);
    if (!force && (document.hidden || !document.querySelector(adapter.active))) return;

    const now = Date.now();
    let changed = force === true;

    if (theme.type === 'text' && now - lastFrameAt >= theme.interval) {
      frameIndex++;
      lastFrameAt = now;
      changed = true;
    }
    if (phrases.length && now - lastPhraseAt >= PHRASE_MS) {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      fadeFlip = !fadeFlip;
      lastPhraseAt = now;
      changed = true;
    }
    if (changed) writeVars();
  }

  function teardown() {
    clearInterval(timer);
    timer = null;
    rulesEl?.remove();
    varsEl?.remove();
  }

  function apply() {
    if (!isOn()) return teardown();

    theme = W.themeById(settings.theme);
    phrases = settings.swapText ? shuffle(W.cleanPhrases(settings.phrases)) : [];
    frameIndex = 0;
    phraseIndex = -1;
    lastFrameAt = 0;
    lastPhraseAt = 0;

    rulesEl = rulesEl || makeStyle('waitlings-rules');
    varsEl = varsEl || makeStyle('waitlings-vars');
    rulesEl.textContent = W.buildCss(adapter, theme, { swapText: phrases.length > 0 });

    tick(true);
    if (!timer) timer = setInterval(tick, TICK_MS);
  }

  W.load()
    .then((loaded) => {
      settings = loaded;
      apply();
    })
    .catch(apply); // storage unavailable: run with defaults

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[W.STORAGE_KEY]) return;
    settings = { ...W.defaults(), ...(changes[W.STORAGE_KEY].newValue || {}) };
    apply();
  });
})();
