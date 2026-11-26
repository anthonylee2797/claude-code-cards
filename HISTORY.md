# History

One line per pull request, oldest first: what it did and why it matters. Add yours in the same PR.
Database changes also get a line in [`supabase/HISTORY.md`](supabase/HISTORY.md).

| Date | Area | Change | PR |
| --- | --- | --- | --- |
| 2026-11-05 | plugin | Scaffold of the `nba-cards` Claude Code plugin. | [#1](https://github.com/anthonylee2797/claude-code-cards/pull/1) |
| 2026-11-06 | plugin | Welcome message shows in the band above the prompt (0.2.0). | [#2](https://github.com/anthonylee2797/claude-code-cards/pull/2) |
| 2026-11-07 | plugin | Colorful terminal welcome, band stays until Hide, all env files git-ignored (0.3.0). | [#3](https://github.com/anthonylee2797/claude-code-cards/pull/3) |
| 2026-11-09 | contracts | Shared types, 5 sample cards, `0001_init.sql` (tables, RLS, `pull_card()`) and CI, so #4–#7 can run in parallel. | [#10](https://github.com/anthonylee2797/claude-code-cards/pull/10) |
| 2026-11-10 | database | Seed script for `cards`, PGlite test of seed + full pull set, and these history files. | [#11](https://github.com/anthonylee2797/claude-code-cards/pull/11) |
| 2026-11-10 | plugin | Anonymous sign-in and a card pull shown in the band. | [#12](https://github.com/anthonylee2797/claude-code-cards/pull/12) |
| 2026-11-10 | web | Catalog and collection pages. | [#13](https://github.com/anthonylee2797/claude-code-cards/pull/13) |
| 2026-11-10 | data | Full Series 1 card data (`series1.json`) and its build script. | [#14](https://github.com/anthonylee2797/claude-code-cards/pull/14) |
| 2026-11-11 | plugin | The card stays in the band until you press Hide (no longer hides on the first prompt) (0.4.1). | [#16](https://github.com/anthonylee2797/claude-code-cards/pull/16) |
| 2026-11-11 | plugin | Terminal shows the pull as one pack-opening style line (rarity badge, stars, NEW, progress bar) that clears on the first prompt; the desktop keeps the full card (0.5.0). | |
| 2026-11-11 | plugin | `/card` shows this session's card again (full card inline), `/collection` lists your cards in a pane on every surface (VS Code and mobile too), and the `prompt.submit` hook can no longer block a prompt (0.6.0). | |
| 2026-11-11 | plugin | Launch polish: plugin icon, marketplace description, README desktop install, privacy note and screenshot placeholders. | [#18](https://github.com/anthonylee2797/claude-code-cards/pull/18) |
| 2026-11-12 | plugin | Desktop card redesigned as a compact two-row card (tier chip, name, stats, NEW, progress bar, Hide inside the card); `/nba-version` shows the installed version (0.7.0). | [#25](https://github.com/anthonylee2797/claude-code-cards/pull/25) |
| 2026-11-12 | database, plugin | 2 cards a day: one pull per 12-hour Eastern window (`0002_pull_window.sql`, new `wait` result), so repeated `session.start` fires and scripts no longer pull extra cards (#20, #21) (0.8.0). | [#26](https://github.com/anthonylee2797/claude-code-cards/pull/26) |
| 2026-11-14 | plugin | Desktop sessions pull again (the desktop runs through the SDK, so the 0.8.0 `isInteractive` check skipped every pull); every session shows the band (new card, or when the next one comes) until its first prompt (0.9.0). | [#27](https://github.com/anthonylee2797/claude-code-cards/pull/27) |
| 2026-11-15 | database, plugin | Sessions that start after this window's pull show that card in one line (and in `/card`) instead of only the next-card time, even when another session pulled it (`0003_wait_card.sql`) (0.10.0). | [#28](https://github.com/anthonylee2797/claude-code-cards/pull/28) |
| 2026-11-15 | plugin | The "this window's card" line renders as one row on desktop (it broke into a grid) and reads "You pulled … · /card to see it · Next pull in about Xh", so the next pull isn't mistaken for that card; the band links to your web collection ("Your collection ↗", anonymous logins too); on desktop the band now lasts until the second message, since the session only starts on the first (0.11.0). | [#29](https://github.com/anthonylee2797/claude-code-cards/pull/29) |
| 2026-11-15 | plugin | Review fixes: a plugin reload mid-session no longer brings back a dismissed band (the flag lives in `$.state`, contract in `types/index.d.ts`); `/card` in a session left open past the window says a new card is ready (0.11.1). | [#30](https://github.com/anthonylee2797/claude-code-cards/pull/30) |
| 2026-11-15 | plugin | Desktop "You pulled" line wraps whole pieces onto a new row in a narrow pane instead of breaking every word apart (0.11.2). | |
| 2026-11-16 | web | `/` is a home page that sells and installs the plugin; `/series` lists packs (BETA NBA Pack, the old catalog at `/series/beta-nba`); `/u/<id>` shows packs, then only the owned cards (#32). | [#33](https://github.com/anthonylee2797/claude-code-cards/pull/33) |
| 2026-11-16 | plugin | Desktop card: "Your collection" link moves to the top row and the stats row wraps whole pieces, so Hide no longer runs off the card (0.11.3). | [#34](https://github.com/anthonylee2797/claude-code-cards/pull/34) |
| 2026-11-24 | web | Collection pages read pulls uncached, so `/u/<id>` and its pack page always show the same owned count. | [#34](https://github.com/anthonylee2797/claude-code-cards/pull/34) |
| 2026-11-25 | team | Agent team in `.claude/agents` (Product Manager, Staff Engineer - Web/Backend, Principal Designer - Web/Claude Code; `web-ui` becomes `staff-engineer-web`) and the `/workday` skill that runs them against GitHub Project #4: designer reviews web PRs, approved web-only PRs merge themselves, migrations always wait on the user. | [#35](https://github.com/anthonylee2797/claude-code-cards/pull/35) |
| 2026-11-25 | team | Agents have names and sign what they write: Mark (Product Manager), Fojas (Staff Engineer - Web), Chad (Staff Engineer - Backend), Maddy (Principal Designer - Web), Paige (Principal Designer - Claude Code). | |
| 2026-11-25 | team | Staff Engineer - Web marks each PR `Merge: auto` (no visual change: merges on green), `Merge: design review` or `Merge: user (<why>)` (new design, migration, contract change); `/workday` follows it. | [#41](https://github.com/anthonylee2797/claude-code-cards/pull/41) |
| 2026-11-25 | team | Team board is a kanban (Needs Anthony, Backlog, Ready, Working, Review, Done) with an Agent field; `board.sh move` fills Agent from the label, `board.sh needs` moves a card to Needs Anthony, assigns and tags him. | [#42](https://github.com/anthonylee2797/claude-code-cards/pull/42) |
| 2026-11-25 | team | `/needs-me` skill: summarizes the Needs Anthony column and walks through each card with the user, acting only on his answer. | [#43](https://github.com/anthonylee2797/claude-code-cards/pull/43) |
| 2026-11-25 | team | `/workday` merges docs-only PRs (README, `docs/`, HISTORY) from any agent on green, and sends PRs that conflict with `main` back to their author. | [#44](https://github.com/anthonylee2797/claude-code-cards/pull/44) |
