# Database history

One line per migration or database-logic change (seed, RPCs, tests), newest last. Add yours in the same PR.
Every PR, database or not, also goes in the repo-wide [`HISTORY.md`](../HISTORY.md).

| Date | Change | PR |
| --- | --- | --- |
| 2026-11-09 | `0001_init.sql`: `cards`, `profiles`, `pulls`, read-only RLS, sign-up trigger and weighted `pull_card()`. | [#10](https://github.com/anthonylee2797/claude-code-cards/pull/10) |
| 2026-11-09 | `seed.mjs` upserts `data/series1.json` (or the sample) into `cards` by `id`; the PGlite test re-seeds and pulls the full set to `set_complete`. | [#11](https://github.com/anthonylee2797/claude-code-cards/pull/11) |
| 2026-11-12 | `0002_pull_window.sql`: `pull_window(at)` gives the 12-hour New York window; `pull_card()` returns `{ status: 'wait', next_at }` after one pull per window. Test covers both DST days. | |
