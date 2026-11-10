# Waitlings

A browser extension that swaps the loading indicator in AI chat apps for a small animated companion and your own status phrases.

Version 0.1.0 supports Claude (claude.ai). ChatGPT and Gemini are next on the roadmap.

<img src="docs/popup.png" alt="The Waitlings settings popup" width="320">

## What it does

While an AI app is preparing a reply it shows a small animation and a filler status word. Waitlings replaces both:

- **The animation** becomes one of 12 companions across 4 packs: Creatures, Pixel, Kaomoji and Shapes.
- **The filler word** becomes a phrase from a list you write yourself. 10 defaults are included.

Real progress text, such as a thinking summary or the name of a tool in use, is left as the site shows it.

## Install

Waitlings is not on the Chrome Web Store yet. It loads directly from this folder and works in Chrome, Brave, Edge and other Chromium browsers.

1. Download the code: click **Code > Download ZIP** on GitHub and unzip it, or clone it:
   ```
   git clone https://github.com/aneeshk-ds/waitlings.git
   ```
2. Open the extensions page: `chrome://extensions` in Chrome, `brave://extensions` in Brave.
3. Turn on **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the `waitlings` folder (the one that contains `manifest.json`).
5. Reload any open claude.ai tabs.

To update later, pull or download the new code and click the reload arrow on the Waitlings card on the extensions page.

## Use

Click the Waitlings icon in the browser toolbar (pin it from the puzzle-piece menu if it is hidden).

| Control | What it does |
| --- | --- |
| Main switch | Turns Waitlings on or off everywhere |
| Companion | Pick a pack, then a companion |
| My phrases | One phrase per line. The switch beside it turns phrase swapping off and keeps the site's own word |
| Sites | Turn Waitlings on or off for a single site |

Changes apply to open tabs straight away. No reload is needed.

## Companions

| Pack | Companions |
| --- | --- |
| Creatures | Mochi (blob), Miso (cat), Boo (ghost) |
| Pixel | Heartbeat, Slime, Ember |
| Kaomoji | Shades, Dance, Sleepy |
| Shapes | Orbit, Bars, Ripple |

All artwork is original and drawn in code as SVG or text. The repo contains no third-party images.

## How it works

Waitlings never edits the page's own elements. It adds two `<style>` tags and does everything with CSS:

1. A site **adapter** lists the CSS selectors for the site's loading indicator.
2. The stylesheet hides what is inside that indicator and draws the companion on a `::after` pseudo-element in the same spot.
3. A small timer rotates phrases and text frames by updating CSS custom properties. It does nothing while the page is idle.

Because no page elements are added, moved or removed, the site's own framework is not disturbed and a re-render cannot knock the companion out.

```
manifest.json
src/
  core/
    defaults.js    settings, storage helpers
    themes.js      the 12 companions
    css.js         builds the stylesheet from an adapter and a theme
    engine.js      content script: applies styles, rotates phrases
  adapters/
    claude.js      selectors for claude.ai
  popup/           the settings popup
docs/
  adding-a-site.md
```

## Privacy

- The only permission requested is `storage`, used to save your settings in your own browser.
- No network requests, no analytics, no accounts.
- The extension does not read your conversations. It only matches the loading indicator by CSS selector.
- Screen-reader announcements made by the site are left untouched.

## Known limits

- **Sites change.** No AI app offers an official way to restyle its loading indicator, so each adapter depends on the site's current markup. When a site ships a redesign the companion may stop appearing until the adapter's selectors are updated. Nothing else breaks: the site falls back to its normal indicator.
- **Browser only.** Desktop and mobile apps cannot load browser extensions.
- **Claude coverage.** Verified on the claude.ai chat view. Other views may use different markup and are not covered yet.

## Roadmap

- ChatGPT adapter
- Gemini adapter
- A clock or timer companion for the elapsed-time readout
- Bring your own image or GIF
- Chrome Web Store listing

## Add a site

Supporting a new site means writing one small adapter file. See [docs/adding-a-site.md](docs/adding-a-site.md).

## Licence

MIT. See [LICENSE](LICENSE).

Waitlings is an independent project. It is not affiliated with or endorsed by Anthropic, OpenAI or Google.
