/*
 * Waitlings: shared namespace, default settings and storage helpers.
 * Loaded first by both the content script and the popup.
 */
(() => {
  const W = (globalThis.Waitlings = globalThis.Waitlings || {});

  W.adapters = W.adapters || []; // one entry per supported site
  W.themes = W.themes || []; // every selectable companion
  W.packs = W.packs || []; // groups of themes shown as tabs in the popup

  W.STORAGE_KEY = 'waitlings';

  W.DEFAULT_PHRASES = [
    'Brewing thoughts',
    'Herding electrons',
    'Untangling the yarn',
    'Asking the rubber duck',
    'Warming up the neurons',
    'Feeding the hamsters',
    'Sharpening pencils',
    'Polishing pixels',
    'Counting sheep backwards',
    'Consulting the snack drawer',
  ];

  W.defaults = () => ({
    enabled: true, // master switch
    sites: {}, // { adapterId: false } turns a single site off
    theme: 'mochi', // id of the selected companion
    swapText: true, // replace the filler status word with custom phrases
    phrases: [...W.DEFAULT_PHRASES],
  });

  W.load = async () => {
    const stored = await chrome.storage.local.get(W.STORAGE_KEY);
    return { ...W.defaults(), ...(stored[W.STORAGE_KEY] || {}) };
  };

  W.save = (settings) => chrome.storage.local.set({ [W.STORAGE_KEY]: settings });

  // Phrases as a clean list: trimmed, no blanks, capped in count and length.
  W.cleanPhrases = (list) =>
    (Array.isArray(list) ? list : [])
      .map((p) => String(p).trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 100);

  // Quote a string so it is safe as a CSS `content` value.
  W.cssString = (text) =>
    '"' + String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\n\r\f]/g, ' ') + '"';
})();
