/*
 * Waitlings adapter: Claude (claude.ai)
 *
 * An adapter is the only site-specific part of the extension. It is a set of
 * CSS selectors describing where the site draws its loading indicator.
 * When the site changes its markup, this file is the one to update.
 *
 * Selectors verified against the claude.ai chat view on 2026-11-10. They use
 * the site's data attributes, which change less often than its class names.
 *
 * What the chat view does while a reply is prepared:
 *   state "pending"  the mark plus a filler word (or nothing)
 *   state "busy"     the mark plus a short description, e.g. "Checking the weather"
 *   state "done"     no mark; a summary such as "Read example.com"
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
    // user's phrases. Real progress text does not match this selector and is
    // left alone.
    label: '[data-cds="TurnStatus"][data-pending-status] [data-cds-row-mark] + span',

    // Optional. The row that contains the mark. The elapsed-time counter is
    // drawn at its end. Written with a single :has(), because :has() cannot
    // be nested inside another :has().
    row: ':has(> [data-cds-row-mark] [data-cds="WorkingMark"])',

    // Optional. The element whose text describes the current activity. Read
    // (never changed) to pick an activity icon. The pending state is excluded
    // because its text is a filler word, not a description.
    status:
      '[data-cds="TurnStatus"]:not([data-state="done"]):not([data-pending-status]) [data-cds-row-mark] + span',

    // Optional. Matches for the whole time a reply is in progress, including
    // while text streams and the mark is gone. Keeps the elapsed-time counter
    // running across those gaps.
    turn: '[data-testid="assistant-message"][data-busy]',
  });
})();
