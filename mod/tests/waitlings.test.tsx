import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const SPINNER = {
  plugin: 'waitlings',
  component: 'Spinner',
  props: { word: 'Working', message: null, suffix: '…', mode: 'thinking' },
} as const

const PANE = {
  plugin: 'waitlings',
  component: 'Pane',
  requestId: 'waitlings',
  props: {
    title: 'Waitlings',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

// Nothing sits beneath the plugin in a test: these hooks stand for the engine.
const engine = (on: On, stored?: Record<string, unknown>) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  mock.store(on, stored === undefined ? {} : { settings: stored })
  on('command.register', () => ({ value: { command: 'waitlings' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', () => ({ turnId: 't1' }))

  return clock
}

const START = { cwd: '/', surface: 'desktop', isInteractive: true } as const

test('the loading row becomes the companion and a phrase', async ($, on) => {
  engine(on, { hasPhrases: true, phrases: ['Herding electrons'] })
  await $.session.start(START)

  for (const surface of ['desktop', 'vscode'] as const) {
    const ui = await $.ui.mount({ ...SPINNER, surface })
    const art = await ui.find({ type: 'Svg' })

    expect(String(art?.props.alt)).toContain('Mochi')
    expect((await ui.find({ type: 'Text', text: /Herding/ }))?.text).toContain('Herding electrons…')
    await ui.unmount()
  }
})

test('a step that says what it does keeps its words and gets an activity icon', async ($, on) => {
  engine(on)
  await $.session.start(START)

  const ui = await $.ui.mount({
    ...SPINNER,
    surface: 'desktop',
    props: { ...SPINNER.props, word: 'Reading notes.md', mode: 'tool-use' },
  })

  expect(String((await ui.find({ type: 'Svg' }))?.props.alt)).toContain('Reading')
  expect((await ui.find({ type: 'Text', text: /notes/ }))?.text).toContain('Reading notes.md')
  await ui.unmount()
})

test('a tool in flight picks the icon, and the call passes through', async ($, on) => {
  engine(on)
  let seen = ''
  on('tool.call', { tool: 'Bash' }, async () => {
    const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
    seen = String((await ui.find({ type: 'Svg' }))?.props.alt)
    await ui.unmount()

    return { result: { ok: true } }
  })
  await $.session.start(START)

  const ran = await $.tool.call({ tool: 'Bash', command: 'ls' })

  expect(seen).toContain('Coding')
  expect(ran.result).toEqual({ ok: true })

  // Once the call is over the companion is back.
  const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect(String((await ui.find({ type: 'Svg' }))?.props.alt)).toContain('Mochi')
  await ui.unmount()
})

test('stored choices are used, and a broken store falls back to the defaults', async ($, on) => {
  engine(on, { companion: 'boo', hasPhrases: false, isAdaptive: false, size: 'huge', phrases: 7 })
  await $.session.start(START)

  const ui = await $.ui.mount({
    ...SPINNER,
    surface: 'desktop',
    props: { ...SPINNER.props, word: 'Reading notes.md' },
  })
  const art = await ui.find({ type: 'Svg' })

  expect(String(art?.props.alt)).toContain('Boo') // adaptive is off, so no book
  expect(art?.props.height).toBe(28) // "huge" is no size: medium
  await ui.unmount()

  const filler = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect((await filler.find({ type: 'Text', text: /Working/ }))?.text).toContain('Working…')
  await filler.unmount()
})

test('elapsed time counts through the turn', async ($, on) => {
  const clock = engine(on)
  await $.session.start(START)
  await $.turn.start({ text: 'hello', turnId: 't1' })
  await clock.advance(65_000)

  const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /^\d+:\d\d$/ }))?.text).toBe('1:05')
  await ui.unmount()
})

test('the terminal line gets a phrase and no picture', async ($, on) => {
  engine(on, { phrases: ['Asking the rubber duck'] })
  // Stands for the engine's own line.
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>{e.props.word}</Text>
  })
  await $.session.start({ ...START, surface: 'terminal' })

  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Asking the rubber duck')
  await ui.unmount()
})

test('the pane changes the companion, and off hands the row back', async ($, on) => {
  engine(on)
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine row</Text>
  })
  await $.session.start(START)

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: 'pick-miso' })

  const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect(String((await ui.find({ type: 'Svg' }))?.props.alt)).toContain('Miso')
  await ui.unmount()

  await pane.press({ key: 'isEnabled' })
  await pane.unmount()

  const off = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect((await off.find({ type: 'Text' }))?.text).toBe('engine row')
  await off.unmount()
})
