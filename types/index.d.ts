// Session state that must outlive a plugin reload (module variables start over on one).
export type NbaCardsDismissed = boolean

declare module 'claude-code' {
  interface PluginState {
    'nba-cards': { isDismissed: NbaCardsDismissed }
  }
}
