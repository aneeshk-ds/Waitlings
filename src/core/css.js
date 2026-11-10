/*
 * Waitlings: builds the stylesheet that hides a site's native indicator and
 * draws the replacement.
 *
 * Everything is done with CSS on pseudo-elements. The page's own DOM is never
 * edited, so the site's framework cannot be confused by foreign nodes and a
 * re-render cannot remove the replacement.
 *
 * Runtime values arrive through three custom properties set by the engine:
 *   --wl-icon    url() of the animated SVG (svg themes)
 *   --wl-frame   current text frame (text themes)
 *   --wl-phrase  current custom phrase
 */
(() => {
  const W = globalThis.Waitlings;

  W.buildCss = (adapter, theme, opts = {}) => {
    const mark = `:is(${adapter.mark})`;
    const rules = [
      // Let the slot grow to fit the replacement, and hide what was in it.
      `${mark}{width:auto!important;min-width:0!important;overflow:visible!important}`,
      `${mark}>*{visibility:hidden!important}`,
    ];

    if (theme.type === 'text') {
      rules.push(
        `${mark}::after{content:var(--wl-frame,"");display:block;flex:none;visibility:visible;` +
          `min-width:${theme.width || 6}em;white-space:pre;font:inherit;line-height:1;color:inherit}`
      );
    } else {
      rules.push(
        `${mark}::after{content:"";display:block;flex:none;visibility:visible;` +
          'width:26px;height:26px;margin-block:-4px;' +
          'background:var(--wl-icon) center/contain no-repeat}'
      );
    }

    if (opts.swapText && adapter.label) {
      const label = `:is(${adapter.label})`;
      rules.push(
        `${label}>*{display:none!important}`,
        `${label}::after{content:var(--wl-phrase,"");display:inline-block;white-space:nowrap;` +
          'animation:var(--wl-fade,none) .4s ease both}',
        // Two identical animations: switching between them restarts the fade
        // each time the phrase changes.
        '@keyframes wl-fade-a{from{opacity:0;transform:translateY(.3em)}to{opacity:1;transform:none}}',
        '@keyframes wl-fade-b{from{opacity:0;transform:translateY(.3em)}to{opacity:1;transform:none}}'
      );
    }

    return rules.join('\n');
  };
})();
