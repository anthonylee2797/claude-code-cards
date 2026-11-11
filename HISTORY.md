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
