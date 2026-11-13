# Waitlings for the Claude app

Waitlings draws a small animated companion in place of the loading row while Claude works. It is the app version of the Waitlings browser extension and uses the same artwork.

## What it does

- **12 companions** in 4 packs: Creatures, Pixel, Kaomoji and Shapes, in 3 sizes.
- **The icon follows the activity.** While a tool runs, the companion steps aside for a matching icon: a book for reading, a magnifier for searching, a cursor for browsing, a terminal for running code, a pencil for writing.
- **Elapsed time** counts up beside the icon for the length of the turn.
- **Your own phrases** replace the filler word shown when a step has no description. Real step descriptions are left as the app writes them.

## Install

**From the plugin file.** Open the Claude app, go to Customize (or Plugins), choose Add, then Upload plugin, and pick `waitlings.plugin`.

**From GitHub, in the desktop app.** Click + next to the prompt box, then Plugins, then Add marketplace, and enter `aneeshk-ds/waitlings`. Then choose Add plugin.

**From GitHub, in a terminal session.** At the prompt:

```
/plugin install waitlings --marketplace aneeshk-ds/waitlings
```

Answer `y` to add the marketplace, then pick a scope.

## Use

Type `/waitlings` to open the settings pane. Pick a pack and a companion, choose a size, switch the options on or off, and edit the phrase list. Changes apply straight away and are kept between sessions.

`/waitlings off` and `/waitlings on` switch the whole thing without opening the pane.

## Where it works

| Surface | What you get |
| --- | --- |
| Claude desktop app | Companion, activity icons, timer, phrases |
| VS Code extension | The same |
| Terminal | Phrases only: a terminal cannot draw the artwork |
| Mobile app | Nothing: the mobile app does not offer its loading row to plugins |

## What it reads

To pick an activity icon, Waitlings looks at the name of the tool that is running and at the short step description on the loading row. It does not read prompts, replies or files, sends nothing anywhere, and stores only your settings.

## Limits

- Activity icons are chosen by tool name and by keywords, so a step is sometimes shown with the plain companion.
- The timer is Waitlings' own clock, started when the turn starts.

## Licence

MIT. Waitlings is an independent project and is not affiliated with or endorsed by Anthropic.
