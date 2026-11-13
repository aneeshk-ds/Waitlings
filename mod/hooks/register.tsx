/*
 * Waitlings for the Claude app.
 *
 * Draws a small animated companion in place of the loading row while Claude
 * works, with the person's own phrases, an icon that follows the activity,
 * and an elapsed-time counter. `/waitlings` opens the settings pane.
 *
 * The artwork in ./art.ts is generated from the browser extension's sources.
 */
import { atom, read, update } from 'claude-code'
import type { Register, StateDollar } from 'claude-code'

import type { CompanionSize, WaitlingsSettings } from '../types'
import { ACTIVITIES, COMPANIONS, DEFAULT_PHRASES, PACKS } from './art'
import type { Art } from './art'

const PANE = 'waitlings'
const STORE_KEY = 'settings'
const PHRASE_MS = 4000
const MAX_PHRASES = 40

const SIZES: Record<CompanionSize, { px: number; name: string }> = {
  s: { px: 22, name: 'Small' },
  m: { px: 28, name: 'Medium' },
  l: { px: 36, name: 'Large' },
}

const DEFAULTS: WaitlingsSettings = {
  isEnabled: true,
  companion: 'mochi',
  size: 'm',
  isAdaptive: true,
  hasTimer: true,
  hasPhrases: true,
  phrases: [...DEFAULT_PHRASES],
}

// The session's copy of the settings. It is filled from the store, through
// sanitize(), each time the session starts or the mod reloads.
const settingsAtom = atom({ plugin: 'waitlings', key: 'settings' } as const, DEFAULTS)
const beatAtom = atom({ plugin: 'waitlings', key: 'beat' } as const, 0)
const packAtom = atom({ plugin: 'waitlings', key: 'pack' } as const, 'creatures')

/* ---------- Pure helpers ---------- */

const cleanPhrases = (list: unknown): string[] =>
  (Array.isArray(list) ? list : [])
    .map(one => String(one).trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, MAX_PHRASES)

// Stored settings may be from an older version, or hand-edited: take each
// field only when it has the right type.
const sanitize = (raw: unknown): WaitlingsSettings => {
  const got = (raw !== null && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const flag = (key: keyof WaitlingsSettings): boolean =>
    typeof got[key] === 'boolean' ? (got[key] as boolean) : (DEFAULTS[key] as boolean)

  return {
    isEnabled: flag('isEnabled'),
    companion: COMPANIONS.some(one => one.id === got.companion)
      ? (got.companion as string)
      : DEFAULTS.companion,
    size: got.size === 's' || got.size === 'm' || got.size === 'l' ? got.size : DEFAULTS.size,
    isAdaptive: flag('isAdaptive'),
    hasTimer: flag('hasTimer'),
    hasPhrases: flag('hasPhrases'),
    phrases: Array.isArray(got.phrases) ? cleanPhrases(got.phrases) : [...DEFAULTS.phrases],
  }
}

// 0:07, 1:05 or 1:02:03.
const formatElapsed = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = String(total % 60).padStart(2, '0')

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`
}

const activity = (id: string): Art | null => ACTIVITIES.find(one => one.id === id) ?? null

// Which activity a tool belongs to, by its name. Order matters: a browser
// tool named "read_page" is browsing, not reading.
const TOOL_RULES: readonly (readonly [RegExp, string])[] = [
  [/chrome|browser|computer|navigate|screenshot/, 'act-browsing'],
  [/search/, 'act-searching'],
  [/^(read|glob|grep)$|fetch|read|list|get_/, 'act-reading'],
  [/^bash|notebook|execut|sql|run_/, 'act-coding'],
  [/^(write|edit|multiedit)$|artifact|creat|write|updat|draft|send/, 'act-writing'],
]

const toolActivity = (tool: string): Art | null => {
  const name = tool.toLowerCase()
  const rule = TOOL_RULES.find(([pattern]) => pattern.test(name))

  return rule ? activity(rule[1]) : null
}

// Which activity a status line names, by its words (the same word lists the
// browser extension uses).
const WORD_RULES = ACTIVITIES.map(one => [new RegExp(one.words, 'i'), one] as const)

const wordActivity = (text: string): Art | null =>
  WORD_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? null

// What the row says when it has no words of its own.
const isFiller = (said: string): boolean => said.trim() === '' || said.trim() === 'Working'

// Draws the loading row again: it reads the beat while it draws.
const redraw = ($: StateDollar): void => {
  update($, beatAtom, beat => beat + 1).catch(() => {})
}

/* ---------- The mod ---------- */

export const register: Register = on => {
  // The turn in progress. Plain variables: they are only read to draw, and a
  // reload mid-turn costs at most one turn's timer.
  let turnStartedAt = 0
  let turnCount = 0
  let hasTimer = DEFAULTS.hasTimer
  const running: string[] = [] // tools in flight, newest last

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'waitlings',
      description: 'Choose your loading companion, its size and what it shows',
    })

    const stored = sanitize(await $.store.get(STORE_KEY))
    hasTimer = stored.hasTimer
    await update($, settingsAtom, () => stored)

    // One timer for the session. It does nothing between turns.
    $.clock.every(1000, () => {
      if (turnStartedAt > 0 && hasTimer) {
        redraw($)
      }
    })

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    turnStartedAt = await $.clock.now()
    turnCount += 1
    running.length = 0

    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    turnStartedAt = 0
    running.length = 0

    return next(e)
  })

  // Note which tool is running, so the row can show a matching icon. The call
  // itself is passed on untouched.
  on('tool.call', async ($, e, next) => {
    running.push(e.tool)
    redraw($)

    try {
      return await next(e)
    } finally {
      const at = running.lastIndexOf(e.tool)
      if (at >= 0) {
        running.splice(at, 1)
      }
      redraw($)
    }
  }).catch(($, e, next) => next(e)) // a fault here must never hold up a tool call

  /* ---------- The loading row ---------- */

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const settings = await read($, settingsAtom)
    if (!settings.isEnabled) {
      return next(e)
    }

    const phrases = settings.hasPhrases ? settings.phrases : []

    // The terminal draws no pictures: give its line one of the phrases.
    if (e.surface === 'terminal') {
      const phrase = phrases[turnCount % Math.max(1, phrases.length)]

      return phrase !== undefined && e.props.message === null
        ? next({ ...e, props: { ...e.props, word: phrase } })
        : next(e)
    }

    await read($, beatAtom) // drawn again on each beat

    const elapsed = turnStartedAt > 0 ? (await $.clock.now()) - turnStartedAt : 0
    const said = e.props.message ?? e.props.word
    const phrase = phrases[(turnCount + Math.floor(elapsed / PHRASE_MS)) % Math.max(1, phrases.length)]
    const label = isFiller(said) ? (phrase ?? 'Working') : said

    const companion = COMPANIONS.find(one => one.id === settings.companion) ?? COMPANIONS[0]
    if (companion === undefined) {
      return next(e)
    }

    const tool = running[running.length - 1]
    const art: Art = settings.isAdaptive
      ? ((tool === undefined ? null : toolActivity(tool)) ??
        (isFiller(said) ? null : wordActivity(said)) ??
        companion)
      : companion

    const height = Math.round(SIZES[settings.size].px * art.scale)
    const width = Math.round(height * art.aspect)
    const time = settings.hasTimer && elapsed >= 1000 ? formatElapsed(elapsed) : ''
    const { Box, Svg, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={art.svg} alt={`${art.name}, a Waitlings companion`} width={width} height={height} />
        <Text dimColor>
          {label}
          {e.props.suffix}
        </Text>
        {time !== '' && (
          <Text dimColor tabular size="caption">
            {time}
          </Text>
        )}
      </Box>
    )
  })

  /* ---------- Settings: the /waitlings command and its pane ---------- */

  on('command.run', { command: 'waitlings' }, async ($, e) => {
    const word = e.args.trim().toLowerCase()

    if (word === 'on' || word === 'off') {
      const saved = await update($, settingsAtom, now => ({ ...now, isEnabled: word === 'on' }))
      await $.store.set(STORE_KEY, saved)

      return { text: `Waitlings is ${word}.` }
    }

    await $.ui.open({ id: PANE, title: 'Waitlings' })

    return { text: 'Waitlings settings opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const settings = await read($, settingsAtom)
    const openPack = await read($, packAtom)
    const { Box, Button, Input, Text } = $.ui.resolve(e)

    // Every change goes to the session's state (which redraws) and to the store.
    const change = (edit: (now: WaitlingsSettings) => WaitlingsSettings) => (): void => {
      update($, settingsAtom, edit)
        .then(saved => {
          hasTimer = saved.hasTimer

          return $.store.set(STORE_KEY, saved)
        })
        .catch(() => {})
    }

    const toggle = (key: 'isEnabled' | 'isAdaptive' | 'hasTimer' | 'hasPhrases', name: string) => (
      <Button
        key={key}
        label={`${name}: ${settings[key] ? 'on' : 'off'}`}
        variant={settings[key] ? 'primary' : 'secondary'}
        onPress={change(now => ({ ...now, [key]: !now[key] }))}
      />
    )

    const chosen = COMPANIONS.find(one => one.id === settings.companion) ?? COMPANIONS[0]

    // The terminal draws no pictures, so it gets the name alone.
    const drawPreview = () => {
      if (e.surface === 'terminal' || chosen === undefined) {
        return null
      }

      const { Svg } = $.ui.resolve(e)
      const height = Math.round(SIZES[settings.size].px * chosen.scale)

      return (
        <Svg
          source={chosen.svg}
          alt={`${chosen.name}, the chosen companion`}
          width={Math.round(height * chosen.aspect)}
          height={height}
        />
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" alignItems="center" gap={1}>
          {drawPreview()}
          <Text>
            {chosen?.name ?? 'Companion'}
            <Text dimColor>{settings.hasPhrases && settings.phrases[0] ? `  ${settings.phrases[0]}` : ''}</Text>
          </Text>
        </Box>

        {toggle('isEnabled', 'Waitlings')}

        <Text dimColor>Companion</Text>
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          {PACKS.map(pack => (
            <Button
              key={`pack-${pack.id}`}
              label={pack.name}
              plain
              dimColor={pack.id !== openPack}
              onPress={() => {
                update($, packAtom, () => pack.id).catch(() => {})
              }}
            />
          ))}
        </Box>
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          {COMPANIONS.filter(one => one.pack === openPack).map(one => (
            <Button
              key={`pick-${one.id}`}
              label={one.name}
              variant={one.id === settings.companion ? 'primary' : 'secondary'}
              onPress={change(now => ({ ...now, companion: one.id }))}
            />
          ))}
        </Box>

        <Text dimColor>Size</Text>
        <Box flexDirection="row" gap={1}>
          {(['s', 'm', 'l'] as const).map(size => (
            <Button
              key={`size-${size}`}
              label={SIZES[size].name}
              variant={size === settings.size ? 'primary' : 'secondary'}
              onPress={change(now => ({ ...now, size }))}
            />
          ))}
        </Box>

        <Text dimColor>Options</Text>
        {toggle('isAdaptive', 'Match the activity')}
        {toggle('hasTimer', 'Elapsed time')}
        {toggle('hasPhrases', 'My phrases')}

        <Text dimColor>Phrases (press one to remove it)</Text>
        <Box flexDirection="column">
          {settings.phrases.map((phrase, index) => (
            <Button
              key={`phrase-${index}-${phrase}`}
              label={phrase}
              plain
              onPress={change(now => ({
                ...now,
                phrases: now.phrases.filter((_, at) => at !== index),
              }))}
            />
          ))}
        </Box>
        <Input
          key="add-phrase"
          placeholder="Add a phrase"
          submitLabel="Add"
          onSubmit={value => {
            change(now => ({ ...now, phrases: cleanPhrases([...now.phrases, value]) }))()
          }}
        />
        <Button
          key="reset-phrases"
          label="Restore default phrases"
          plain
          dimColor
          onPress={change(now => ({ ...now, phrases: [...DEFAULT_PHRASES] }))}
        />
      </Box>
    )
  })
}
