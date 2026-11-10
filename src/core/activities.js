/*
 * Waitlings: activity icons.
 *
 * While a site is working it often prints a short status line such as
 * "Searching the web" or "Reading the page". When that text names an activity
 * listed here, the matching icon is shown in place of the chosen companion.
 * Text that matches nothing keeps the companion.
 *
 * Order matters: the first activity whose pattern matches wins.
 * Patterns match the start of a word, so "read" also catches "reading".
 */
(() => {
  const W = globalThis.Waitlings;

  const svg = (css, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>${css}</style>${body}</svg>`;

  const add = (id, name, words, art) =>
    W.activities.push({
      id: 'act-' + id,
      name,
      type: 'svg',
      match: new RegExp('\\b(?:' + words.join('|') + ')', 'i'),
      svg: art,
    });

  // Browsing: a pointer that travels, then clicks.
  add(
    'browsing',
    'Browsing',
    ['brows', 'navigat', 'click', 'scroll', 'visit', 'surf', 'screenshot', 'using chrome', 'using the browser'],
    svg(
      '.c{animation:m 1.8s ease-in-out infinite;transform-origin:10px 9px}' +
        '.r{animation:r 1.8s ease-out infinite;transform-origin:11px 11px}' +
        '@keyframes m{0%,100%{transform:translate(9px,8px)}35%,55%{transform:translate(0,0)}45%{transform:translate(0,0) scale(.85)}}' +
        '@keyframes r{0%,42%{transform:scale(.2);opacity:0}46%{opacity:.95}78%,100%{transform:scale(1);opacity:0}}',
      '<circle class="r" cx="11" cy="11" r="8" fill="none" stroke="#f5a524" stroke-width="2.2"/>' +
        '<g class="c"><path d="M10 9v15l4-3.6 2.6 5.8 2.6-1.2-2.6-5.7 5.4-.3z" fill="#fff" stroke="#1d1d2b" stroke-width="1.5" stroke-linejoin="round"/></g>'
    )
  );

  // Searching: a magnifier sweeping around.
  add(
    'searching',
    'Searching',
    ['search', 'looking up', 'looking for', 'look up', 'find', 'check', 'hunt', 'query', 'querying', 'googl', 'investigat'],
    svg(
      '.m{animation:s 1.6s ease-in-out infinite}' +
        '@keyframes s{0%,100%{transform:translate(-3px,1px)}25%{transform:translate(2px,-2px)}50%{transform:translate(4px,2px)}75%{transform:translate(0,3px)}}',
      '<g class="m">' +
        '<circle cx="14" cy="14" r="7.5" fill="#bfe6ff" fill-opacity=".45" stroke="#38a3f5" stroke-width="2.6"/>' +
        '<path d="M19.6 19.6L26 26" stroke="#38a3f5" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M10.5 12a4 4 0 013-2.6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        '</g>'
    )
  );

  // Reading: an open book with a turning page.
  add(
    'reading',
    'Reading',
    ['read', 'fetch', 'open', 'scan', 'review', 'skim', 'pars', 'view', 'examin', 'study', 'studying', 'gather'],
    svg(
      '.t{animation:t 1.4s ease-in-out infinite;transform-origin:16px 16px}' +
        '@keyframes t{0%,15%{transform:scaleX(1)}60%,100%{transform:scaleX(-1)}}',
      '<path d="M3 9.5q6.5-2.5 13 0v16q-6.5-2.5-13 0z" fill="#5b8def"/>' +
        '<path d="M29 9.5q-6.5-2.5-13 0v16q6.5-2.5 13 0z" fill="#5b8def"/>' +
        '<path d="M4.5 9q5.7-2 11.5 0v14.5q-5.8-2-11.5 0z" fill="#fff8e7"/>' +
        '<path d="M27.5 9q-5.7-2-11.5 0v14.5q5.8-2 11.5 0z" fill="#fff8e7"/>' +
        '<path d="M7 12.4q3.4-1 6.8 0M7 15.4q3.4-1 6.8 0M7 18.4q3.4-1 6.8 0M18.2 12.4q3.4-1 6.8 0M18.2 15.4q3.4-1 6.8 0M18.2 18.4q3.4-1 6.8 0" stroke="#c9b99a" stroke-width=".9" fill="none" stroke-linecap="round"/>' +
        '<path class="t" d="M27.5 9q-5.7-2-11.5 0v14.5q5.8-2 11.5 0z" fill="#ffefc9" stroke="#e0cfa3" stroke-width=".5"/>'
    )
  );

  // Coding: a terminal with typed blocks and a blinking caret.
  add(
    'coding',
    'Coding',
    ['run', 'execut', 'cod', 'debug', 'compil', 'test', 'install', 'script', 'analy', 'calculat', 'comput'],
    svg(
      '.k{animation:k .9s steps(1,end) infinite}.a{animation:a 2.4s steps(1,end) infinite}.b{animation:b 2.4s steps(1,end) infinite}' +
        '@keyframes k{50%{opacity:0}}@keyframes a{0%{opacity:0}25%{opacity:1}}@keyframes b{0%{opacity:0}50%{opacity:1}}',
      '<rect x="3" y="6" width="26" height="20" rx="3.5" fill="#1d1d2b" stroke="#12c48b" stroke-width="1.6"/>' +
        '<path d="M7.5 12.5l3.5 3-3.5 3" stroke="#12c48b" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<rect class="a" x="13.5" y="14.2" width="3.2" height="2.6" rx=".6" fill="#12c48b"/>' +
        '<rect class="b" x="17.9" y="14.2" width="3.2" height="2.6" rx=".6" fill="#12c48b"/>' +
        '<rect class="k" x="22.6" y="12" width="2" height="7" rx=".5" fill="#fff"/>'
    )
  );

  // Writing: a pencil drawing a line.
  add(
    'writing',
    'Writing',
    ['writ', 'draft', 'creat', 'compos', 'edit', 'rewrit', 'summari', 'generat', 'build', 'making', 'format', 'polish', 'outlin', 'design', 'craft'],
    svg(
      '.l{stroke-dasharray:14;animation:d 1.4s ease-in-out infinite}.p{animation:p 1.4s ease-in-out infinite}' +
        '@keyframes d{0%{stroke-dashoffset:14}70%,100%{stroke-dashoffset:0}}' +
        '@keyframes p{0%{transform:translateX(0)}70%,100%{transform:translateX(14px)}}',
      '<path class="l" d="M4 26h14" stroke="#8b7cf6" stroke-width="2.4" stroke-linecap="round"/>' +
        '<g class="p"><g transform="translate(4 26) rotate(-50)">' +
        '<path d="M0 0l4-2.4v4.8z" fill="#f2d3a0"/><path d="M0 0l1.7-1v2z" fill="#3a3a44"/>' +
        '<rect x="4" y="-2.4" width="9" height="4.8" fill="#ffc93c"/>' +
        '<rect x="13" y="-2.4" width="2" height="4.8" fill="#b9bcc8"/>' +
        '<rect x="15" y="-2.4" width="3" height="4.8" rx="1.2" fill="#ff8fa3"/>' +
        '</g></g>'
    )
  );

  // First activity whose pattern matches the status text, or null.
  W.matchActivity = (text) => {
    const t = String(text || '');
    if (!t.trim()) return null;
    return W.activities.find((a) => a.match.test(t)) || null;
  };
})();
