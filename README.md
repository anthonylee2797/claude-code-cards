# Claude Code Cards 🏀

A Claude Code plugin that greets you with a collectible NBA card when you start a session, up to 2 a day. The card shows in the band above the prompt, in both the desktop app and the terminal.

## How it works

You get one new card per 12-hour window (12am–12pm and 12pm–12am Eastern): the first session in each window pulls a card you don't own yet from Series 1 (155 cards, no duplicates) and shows it above the prompt. Later sessions in the same window show one line with that card and when the next one comes. The band shows in the desktop app as a full card, in the terminal as one "You pulled …" line, and clears on the next prompt you send after it appears (or when you press Hide; the desktop starts a session on its first message, so it clears on the second); `/card` shows it again. The band links to your collection on the web ("Your collection ↗"), anonymous logins included. Any session can use up the window's card, scripts (`claude -p`, the SDK) included. The first session signs you in anonymously; the plugin keeps the refresh token in its own store, so your collection carries over between sessions. Offline, or when the server is down, it shows nothing.

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
