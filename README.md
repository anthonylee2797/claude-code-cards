# Claude Code Cards 🏀

A Claude Code plugin that greets you with a collectible NBA card every time you start a new session. The card shows in the band above the prompt, in both the desktop app and the terminal.

## How it works

Each new session pulls one card you don't own yet from Series 1 (155 cards, no duplicates) and shows it above the prompt until you press Hide. The first session signs you in anonymously; the plugin keeps the refresh token in its own store, so your collection carries over between sessions. Offline, or when the server is down, it shows nothing.

**Claude Code on the web:** untested. The plugin needs a hooks-module host with network access to `*.supabase.co`, so it may not show there.

## Install

Inside Claude Code (desktop app or terminal):

```
/plugin marketplace add anthonylee2797/claude-code-cards
```

```
/plugin install nba-cards@claude-code-cards
```

Or from a shell:

```bash
claude plugin marketplace add anthonylee2797/claude-code-cards
```

```bash
claude plugin install nba-cards@claude-code-cards
```

Then start a new session to see it.

## Update

```bash
claude plugin marketplace update claude-code-cards
```

```bash
claude plugin update nba-cards@claude-code-cards
```

## Uninstall

```bash
claude plugin uninstall nba-cards@claude-code-cards
```
