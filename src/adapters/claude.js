/*
 * Waitlings adapter: Claude (claude.ai)
 *
 * An adapter is the only site-specific part of the extension. It is a set of
 * CSS selectors describing where the site draws its loading indicator.
 * When the site changes its markup, this file is the one to update.
 *
 * Selectors verified against claude.ai on 2026-11-10. They use the site's
 * data attributes, which change less often than its class names.
 */
(() => {
  const W = globalThis.Waitlings;

  W.adapters.push({
    id: 'claude',
    name: 'Claude',
    hosts: ['claude.ai'],

    // Present in the page only while something is loading. The engine uses it
    // to stay idle the rest of the time.
    active: '[data-cds="WorkingMark"]',

    // The slot that holds the native animation. Its contents are hidden and
    // the companion is drawn in their place.
    mark: '[data-cds-row-mark]:has([data-cds="WorkingMark"])',

    // The filler status word shown before the reply starts. Swapped for the
    // user's phrases. Real progress text (thinking summaries, tool names) does
    // not match this selector and is left alone.
    label: '[data-cds="TurnStatus"][data-pending-status] [data-cds-row-mark] + span',
  });
})();
