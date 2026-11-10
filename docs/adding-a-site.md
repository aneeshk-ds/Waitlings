# Adding a site

Each supported site has one adapter file in `src/adapters/`. An adapter is a plain object of CSS selectors. The core code is the same for every site.

## 1. Find the indicator

1. Open the site and send a message.
2. While the reply is loading, right-click the loading animation and choose **Inspect**.
3. Look for the element that wraps the animation. Prefer selectors built on `data-*` attributes, `aria-*` attributes or `data-testid`. Avoid generated class names such as `css-1x2y3z`, which change on every release.

The loading state is often short. In DevTools, the **Elements** panel keeps the node visible if you pause script execution (`F8` in the **Sources** panel) while the animation is on screen.

## 2. Write the adapter

Create `src/adapters/<site>.js`:

```js
(() => {
  const W = globalThis.Waitlings;

  W.adapters.push({
    id: 'example',            // short unique id, used in saved settings
    name: 'Example AI',       // shown in the popup
    hosts: ['example.com'],   // hostnames the adapter applies to

    // Matches something only while the site is loading. Keep it cheap:
    // the engine checks it several times a second.
    active: '[data-loading="true"]',

    // The element that holds the native animation. Its children are hidden
    // and the companion is drawn on its ::after pseudo-element.
    mark: '[data-loading="true"] .indicator',

    // Optional. The element holding filler status text to swap for the
    // user's phrases. Leave it out if the site shows no such text.
    label: '[data-loading="true"] .status-text',

    // Optional. The row that contains the mark. The elapsed-time counter is
    // drawn on its ::after, so it should be a flex or inline container.
    row: '[data-loading="true"] .status-row',

    // Optional. The element whose text describes the current activity.
    // It is read, never changed, to pick an activity icon.
    status: '[data-loading="true"] .status-text',

    // Optional. Matches for the whole time a reply is in progress, including
    // moments when the mark is not on screen. Keeps the counter running.
    turn: '[data-streaming="true"]',
  });
})();
```

Notes on `mark`:

- It must be an element that can have a `::after`, so not an `<img>`, `<svg>` or `<input>`. If the animation is an `<svg>`, target its parent.
- Everything directly inside it is hidden, so pick the smallest wrapper that contains only the animation.

A CSS rule to keep in mind: `:has()` cannot be nested inside another `:has()`. If `mark` already uses `:has()`, write `row` as its own selector instead of wrapping `mark`. The Claude adapter shows the pattern.

## 3. Register it

In `manifest.json`, add the site to `content_scripts`:

```json
"matches": ["https://claude.ai/*", "https://example.com/*"],
"js": [
  "src/core/defaults.js",
  "src/core/themes.js",
  "src/core/activities.js",
  "src/core/css.js",
  "src/adapters/claude.js",
  "src/adapters/example.js",
  "src/core/engine.js"
]
```

Adapters must load after `css.js` and before `engine.js`.

In `src/popup/popup.html`, add a script tag for the adapter next to the existing one so the site appears under **Sites**.

## 4. Test

1. Reload the extension on the extensions page, then reload the site.
2. Send a short message, a long one, and one that triggers extended thinking or a tool.
3. Check both light and dark mode.
4. Turn the site off in the popup and confirm the native indicator returns.

## Adding a companion

Companions live in `src/core/themes.js`. There are two kinds:

- `type: 'svg'`: a self-contained SVG string. Put the animation inside the SVG in a `<style>` block. Use colours that read on both light and dark backgrounds.
- `type: 'text'`: a `frames` array, an `interval` in milliseconds and a `width` in `em` equal to the widest frame.

Give it an `id`, a `name` and the `pack` it belongs to. It then appears in the popup without further changes.

## Adding an activity icon

Activity icons live in `src/core/activities.js`. Each call to `add()` takes an id, a display name, a list of word beginnings and an SVG. The words are matched at the start of a word and ignore case, so `'read'` catches "Reading" and "read". Order matters: the first activity that matches wins, so put narrow activities before broad ones.
