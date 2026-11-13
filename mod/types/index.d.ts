export type CompanionSize = 's' | 'm' | 'l'

// The names carry a prefix because 'claude-code' exports a Settings type of its
// own, which would win inside the module declaration below.

/** What the person has chosen. Kept between sessions in the plugin's store. */
export type WaitlingsSettings = {
  isEnabled: boolean
  /** Id of the chosen companion. */
  companion: string
  size: CompanionSize
  /** Swap the companion for an activity icon while a matching step runs. */
  isAdaptive: boolean
  /** Show elapsed time beside the companion. */
  hasTimer: boolean
  /** Replace the filler word ("Working") with one of `phrases`. */
  hasPhrases: boolean
  phrases: string[]
}

declare module 'claude-code' {
  interface PluginState {
    waitlings: {
      settings: WaitlingsSettings
      /** Bumped once a second during a turn and on each tool change, to redraw the row. */
      beat: number
      /** The companion pack open in the settings pane. */
      pack: string
    }
  }
}
