/*
 * Waitlings: content-script engine.
 *
 * Picks the adapter for the current site, injects the stylesheet from css.js,
 * and keeps it current while the site is loading: rotating phrases and text
 * frames, switching to an activity icon when the status text names one, and
 * counting elapsed time.
 *
 * It adds two <style> elements to the page and changes nothing else. The only
 * page content it reads is the short status line next to the loading mark.
 */
(() => {
  const W = globalThis.Waitlings;
  const host = location.hostname;
  const adapter = W.adapters.find((a) => a.hosts.some((h) => host === h || host.endsWith('.' + h)));
  if (!adapter) return;

  const TICK_MS = 150;
  const PHRASE_MS = 3000;
  const TURN_GAP_MS = 1500; // a reply counts as finished after this long with no sign of it

  let settings = W.defaults();
  let chosen = W.themeById(settings.theme); // the companion picked in the popup
  let shown = chosen; // what is drawn now: the companion or an activity icon
  let phrases = [];
  let rulesEl = null; // static rules, rebuilt when settings or the shown icon change
  let varsEl = null; // custom properties, rewritten as values rotate
  let timer = null;
  let frameIndex = 0;
  let phraseIndex = -1;
  let lastFrameAt = 0;
  let lastPhraseAt = 0;
  let fadeFlip = false;
  let turnStartedAt = 0;
  let turnSeenAt = 0;
  let timeText = '';

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

  function writeRules() {
    rulesEl.textContent = W.buildCss(adapter, shown, {
      size: settings.size,
      timer: settings.timer,
      swapText: phrases.length > 0,
    });
  }

  function writeVars() {
    const vars = [];
    if (shown.type === 'svg') vars.push(`--wl-icon:${W.iconUrl(shown)}`);
    if (shown.type === 'text') vars.push(`--wl-frame:${W.cssString(shown.frames[frameIndex % shown.frames.length])}`);
    if (phraseIndex >= 0 && phrases.length) {
      vars.push(`--wl-phrase:${W.cssString(phrases[phraseIndex % phrases.length])}`);
      vars.push(`--wl-fade:${fadeFlip ? 'wl-fade-a' : 'wl-fade-b'}`);
    }
    if (timeText) vars.push(`--wl-time:${W.cssString(timeText)}`);
    varsEl.textContent = `:root{${vars.join(';')}}`;
  }

  // The companion, unless the status text names an activity.
  function pickShown() {
    if (!settings.adaptive || !adapter.status) return chosen;
    const el = document.querySelector(adapter.status);
    return (el && W.matchActivity(el.textContent)) || chosen;
  }

  function tick(force) {
    mount(rulesEl);
    mount(varsEl);

    const now = Date.now();
    const loading = !!document.querySelector(adapter.active);
    let changed = force === true;

    // Elapsed time covers the whole reply, not only the moments the mark is visible.
    if (settings.timer) {
      const inTurn = loading || (!!adapter.turn && !!document.querySelector(adapter.turn));
      if (inTurn) {
        if (!turnStartedAt) turnStartedAt = now;
        turnSeenAt = now;
      } else if (turnStartedAt && now - turnSeenAt > TURN_GAP_MS) {
        turnStartedAt = 0;
      }
      const elapsed = turnStartedAt ? now - turnStartedAt : 0;
      const next = elapsed >= 1000 ? W.formatElapsed(elapsed) : '';
      if (next !== timeText) {
        timeText = next;
        changed = true;
      }
    }

    if (loading && !document.hidden) {
      const next = pickShown();
      if (next !== shown) {
        shown = next;
        frameIndex = 0;
        writeRules();
        changed = true;
      }
      if (shown.type === 'text' && now - lastFrameAt >= shown.interval) {
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

    chosen = W.themeById(settings.theme);
    shown = chosen;
    phrases = settings.swapText ? shuffle(W.cleanPhrases(settings.phrases)) : [];
    frameIndex = 0;
    phraseIndex = -1;
    lastFrameAt = 0;
    lastPhraseAt = 0;
    if (!settings.timer) {
      turnStartedAt = 0;
      timeText = '';
    }

    rulesEl = rulesEl || makeStyle('waitlings-rules');
    varsEl = varsEl || makeStyle('waitlings-vars');
    writeRules();

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
