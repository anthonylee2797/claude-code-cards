# Claude Code Cards 🏀

A Claude Code plugin that greets you with a collectible NBA card every time you start a new session. The card shows in the band above the prompt, in both the desktop app and the terminal.

<!-- TODO: screenshot of the terminal pull line -->
![Terminal: the one-line pull](docs/screenshot-terminal.png)

<!-- TODO: screenshot of the desktop card -->
![Desktop app: the full card](docs/screenshot-desktop.png)

## How it works

Each new session pulls one card you don't own yet from Series 1 (155 cards, no duplicates) and shows it above the prompt: in the desktop app as a full card until you press Hide, in the terminal as one "You pulled …" line that clears when you send your first prompt. The first session signs you in anonymously; the plugin keeps the refresh token in its own store, so your collection carries over between sessions. Offline, or when the server is down, it shows nothing.

**Claude Code on the web:** untested. The plugin needs a hooks-module host with network access to `*.supabase.co`, so it may not show there.

## Privacy

The first session signs you in to Supabase anonymously: no email, account or GitHub login is needed. Two things are stored:

- **On your machine:** a refresh token, kept in the plugin's own store, so your collection carries over between sessions.
- **On the server:** the cards you own and when you pulled them, under a random collector ID. Pulls are public, so anyone can see a collector's cards on the web app.
## Install

In the desktop app: click **+** next to the prompt box, choose **Plugins**, then **Add marketplace** and enter `anthonylee2797/claude-code-cards`. Then choose **Add plugin** and pick `nba-cards`.

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
