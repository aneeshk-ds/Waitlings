/*
 * Waitlings: theme registry.
 *
 * Two kinds of theme:
 *   type "svg"  - a self-contained animated SVG (the animation lives inside the SVG)
 *   type "text" - a list of text frames the engine cycles through
 *
 * All artwork is original and drawn in code, so the repo ships no image assets
 * apart from the toolbar icon.
 */
(() => {
  const W = globalThis.Waitlings;

  W.packs.push(
    { id: 'creatures', name: 'Creatures' },
    { id: 'pixel', name: 'Pixel' },
    { id: 'kaomoji', name: 'Kaomoji' },
    { id: 'shapes', name: 'Shapes' }
  );

  const svg = (viewBox, css, body, extra = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${extra}><style>${css}</style>${body}</svg>`;

  // Turn rows of characters into 1x1 rects. "." is empty; other characters
  // look up a colour in the palette. Horizontal runs are merged.
  const pixels = (rows, palette) => {
    let out = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        let run = 1;
        while (x + run < row.length && row[x + run] === ch) run++;
        if (ch !== '.') out += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${palette[ch]}"/>`;
        x += run;
      }
    });
    return out;
  };
  const CRISP = ' shape-rendering="crispEdges"';

  const BLINK = '@keyframes bl{0%,45%,51%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}';
  const EYE = '.e{animation:bl 3.4s infinite;transform-box:fill-box;transform-origin:center}';

  /* ---------- Creatures ---------- */

  W.themes.push({
    id: 'mochi',
    pack: 'creatures',
    name: 'Mochi',
    type: 'svg',
    svg: svg(
      '0 0 32 32',
      `.b{animation:sq 1s ease-in-out infinite;transform-origin:16px 28px}${EYE}` +
        '.s{animation:sh 1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
        '@keyframes sq{0%,100%{transform:translateY(0) scale(1.12,.84)}35%{transform:translateY(-4px) scale(.92,1.1)}55%{transform:translateY(-5px) scale(1,1)}82%{transform:translateY(0) scale(1,1)}}' +
        `@keyframes sh{0%,82%,100%{transform:scaleX(1);opacity:.32}45%{transform:scaleX(.6);opacity:.16}}${BLINK}`,
      '<ellipse class="s" cx="16" cy="29.6" rx="8" ry="1.2" fill="#3ddc97"/>' +
        '<g class="b">' +
        '<path d="M5 20c0-8 4.5-13 11-13s11 5 11 13c0 5-4 8-11 8S5 25 5 20z" fill="#3ddc97"/>' +
        '<ellipse class="e" cx="12" cy="18" rx="1.6" ry="2.2" fill="#0b2b20"/>' +
        '<ellipse class="e" cx="20" cy="18" rx="1.6" ry="2.2" fill="#0b2b20"/>' +
        '<ellipse cx="9" cy="22" rx="1.8" ry="1" fill="#ff9aa2" opacity=".85"/>' +
        '<ellipse cx="23" cy="22" rx="1.8" ry="1" fill="#ff9aa2" opacity=".85"/>' +
        '<path d="M14.5 21.5q1.5 1.5 3 0" stroke="#0b2b20" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '</g>'
    ),
  });

  W.themes.push({
    id: 'miso',
    pack: 'creatures',
    name: 'Miso',
    type: 'svg',
    svg: svg(
      '0 0 32 32',
      `.h{animation:t 1.3s ease-in-out infinite;transform-origin:16px 27px}${EYE}` +
        `@keyframes t{0%,100%{transform:rotate(-10deg) translateY(0)}25%,75%{transform:rotate(0deg) translateY(-1.5px)}50%{transform:rotate(10deg) translateY(0)}}${BLINK}`,
      '<g class="h">' +
        '<path d="M6 6l2.5 10L15 10.5z" fill="#f5a524"/><path d="M26 6l-2.5 10L17 10.5z" fill="#f5a524"/>' +
        '<path d="M8 8.5l1.3 5 3.2-2.6z" fill="#ffb8c0"/><path d="M24 8.5l-1.3 5-3.2-2.6z" fill="#ffb8c0"/>' +
        '<ellipse cx="16" cy="19" rx="11" ry="8.5" fill="#f5a524"/>' +
        '<ellipse class="e" cx="11.5" cy="18" rx="1.5" ry="2.1" fill="#3b2606"/>' +
        '<ellipse class="e" cx="20.5" cy="18" rx="1.5" ry="2.1" fill="#3b2606"/>' +
        '<path d="M15 20.6h2l-1 1.2z" fill="#ff7d8e"/>' +
        '<path d="M16 21.8q-1.4 1.8-2.8.6M16 21.8q1.4 1.8 2.8.6" stroke="#3b2606" stroke-width=".8" fill="none" stroke-linecap="round"/>' +
        '<path d="M4 19.5h3.5M4.3 22l3.2-.8M28 19.5h-3.5M27.7 22l-3.2-.8" stroke="#3b2606" stroke-width=".6" stroke-linecap="round" opacity=".6"/>' +
        '</g>'
    ),
  });

  W.themes.push({
    id: 'boo',
    pack: 'creatures',
    name: 'Boo',
    type: 'svg',
    svg: svg(
      '0 0 32 32',
      '.g{animation:f 1.8s ease-in-out infinite}' +
        '.s{animation:s 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
        '.p{animation:l 3s ease-in-out infinite}' +
        '@keyframes f{0%,100%{transform:translate(-1.5px,0)}50%{transform:translate(1.5px,-4px)}}' +
        '@keyframes s{0%,100%{transform:scaleX(1);opacity:.4}50%{transform:scaleX(.7);opacity:.22}}' +
        '@keyframes l{0%,40%,100%{transform:translateX(0)}50%,90%{transform:translateX(1.5px)}}',
      '<ellipse class="s" cx="16" cy="29.5" rx="7" ry="1.3" fill="#8b7cf6"/>' +
        '<g class="g">' +
        '<path d="M7 26V14a9 9 0 0118 0v12l-3-2.6-3 2.6-3-2.6-3 2.6-3-2.6z" fill="#b9aeff"/>' +
        '<g class="p"><ellipse cx="12.5" cy="14.5" rx="1.6" ry="2.2" fill="#2a2350"/><ellipse cx="18.5" cy="14.5" rx="1.6" ry="2.2" fill="#2a2350"/></g>' +
        '<ellipse cx="15.5" cy="19" rx="1.3" ry="1.6" fill="#2a2350"/>' +
        '</g>'
    ),
  });

  /* ---------- Pixel ---------- */

  W.themes.push({
    id: 'heart',
    pack: 'pixel',
    name: 'Heartbeat',
    type: 'svg',
    svg: svg(
      '-3.5 -4 16 16',
      'g{animation:b 1.1s steps(1,end) infinite;transform-origin:4.5px 4px}' +
        '@keyframes b{0%,30%,60%,100%{transform:scale(1)}15%,45%{transform:scale(1.4)}}',
      '<g>' +
        pixels(
          ['.XX...XX.', 'XoXX.XXXX', 'XXXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'],
          { X: '#ff5d73', o: '#ffd0d6' }
        ) +
        '</g>',
      CRISP
    ),
  });

  const SLIME = { X: '#38c6f4', h: '#c9f0ff', e: '#0a2540' };
  W.themes.push({
    id: 'slime',
    pack: 'pixel',
    name: 'Slime',
    type: 'svg',
    svg: svg(
      '-2 -4.5 16 16',
      '.a{animation:a .9s steps(1,end) infinite}.b{animation:b .9s steps(1,end) infinite}' +
        '@keyframes a{0%{transform:translateY(0);opacity:1}40%{transform:translateY(-4px);opacity:1}70%{transform:translateY(0);opacity:0}}' +
        '@keyframes b{0%{opacity:0}70%{opacity:1}}',
      '<g class="a">' +
        pixels(
          ['...XXXXXX...', '..XXhXXXXX..', '.XXXXXXXXXX.', '.XXeXXXXeXX.', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX'],
          SLIME
        ) +
        '</g><g class="b" transform="translate(0 2)">' +
        pixels(['..XXXXXXXX..', '.XXhXXXXXXX.', 'XXXeXXXXeXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX'], SLIME) +
        '</g>',
      CRISP
    ),
  });

  W.themes.push({
    id: 'ember',
    pack: 'pixel',
    name: 'Ember',
    type: 'svg',
    svg: svg(
      '-4 -3 16 16',
      'g{animation:f .7s steps(1,end) infinite;transform-origin:4px 10px}' +
        '@keyframes f{0%{transform:scale(1,1)}25%{transform:scale(-1,1.1)}50%{transform:scale(1,.94)}75%{transform:scale(-1,1.06)}}',
      '<g>' +
        pixels(
          ['...X....', '..XX....', '..XXX...', '.XXXXX..', '.XXXXXX.', 'XXXyXXXX', 'XXyyyXXX', 'XXyyyyXX', '.XyyyyX.', '..XXXX..'],
          { X: '#ff7a2f', y: '#ffd23f' }
        ) +
        '</g>',
      CRISP
    ),
  });

  /* ---------- Kaomoji (text frames) ---------- */

  W.themes.push({
    id: 'shades',
    pack: 'kaomoji',
    name: 'Shades',
    type: 'text',
    interval: 650,
    width: 6.3, // em, widest frame, keeps the row from jittering
    frames: ['( •_•)', '( •_•)>⌐■-■', '(⌐■_■)', '(⌐■_■)'],
  });

  W.themes.push({
    id: 'dance',
    pack: 'kaomoji',
    name: 'Dance',
    type: 'text',
    interval: 450,
    width: 4.8,
    frames: ['┏(・o・)┛', '┗(・o・)┓'],
  });

  W.themes.push({
    id: 'sleepy',
    pack: 'kaomoji',
    name: 'Sleepy',
    type: 'text',
    interval: 550,
    width: 5.8,
    frames: ['(－_－)', '(－_－) z', '(－_－) zZ', '(－_－) zZz'],
  });

  /* ---------- Shapes ---------- */

  W.themes.push({
    id: 'orbit',
    pack: 'shapes',
    name: 'Orbit',
    type: 'svg',
    svg: svg(
      '0 0 32 32',
      '.o{animation:r 1.1s linear infinite;transform-origin:16px 16px}@keyframes r{to{transform:rotate(360deg)}}',
      '<circle cx="16" cy="16" r="10" fill="none" stroke="#8b7cf6" stroke-width="2" opacity=".3"/>' +
        '<g class="o"><circle cx="16" cy="6" r="3.2" fill="#8b7cf6"/></g>'
    ),
  });

  W.themes.push({
    id: 'bars',
    pack: 'shapes',
    name: 'Bars',
    type: 'svg',
    svg: svg(
      '0 0 32 32',
      'rect{animation:b .9s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
        '.b2{animation-delay:.15s}.b3{animation-delay:.3s}' +
        '@keyframes b{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}',
      '<rect x="6" y="6" width="5" height="20" rx="2.5" fill="#12c48b"/>' +
        '<rect class="b2" x="13.5" y="6" width="5" height="20" rx="2.5" fill="#12c48b"/>' +
        '<rect class="b3" x="21" y="6" width="5" height="20" rx="2.5" fill="#12c48b"/>'
    ),
  });

  W.themes.push({
    id: 'ripple',
    pack: 'shapes',
    name: 'Ripple',
    type: 'svg',
    svg: svg(
      '0 0 32 32',
      '.w{animation:p 1.6s ease-out infinite both;transform-origin:16px 16px}.d{animation-delay:.8s}' +
        '@keyframes p{0%{transform:scale(.2);opacity:1}100%{transform:scale(1);opacity:0}}',
      '<circle cx="16" cy="16" r="3" fill="#ff7a59"/>' +
        '<circle class="w" cx="16" cy="16" r="12" fill="none" stroke="#ff7a59" stroke-width="2.5"/>' +
        '<circle class="w d" cx="16" cy="16" r="12" fill="none" stroke="#ff7a59" stroke-width="2.5"/>'
    ),
  });

  // CSS url() for an svg theme.
  W.iconUrl = (theme) => `url("data:image/svg+xml,${encodeURIComponent(theme.svg)}")`;

  W.themeById = (id) => W.themes.find((t) => t.id === id) || W.themes[0];
})();
