# Database history

One line per migration or database-logic change (seed, RPCs, tests), newest last. Add yours in the same PR.

| Date | Change | PR |
| --- | --- | --- |
| 2026-11-09 | `0001_init.sql`: `cards`, `profiles`, `pulls`, read-only RLS, sign-up trigger and weighted `pull_card()`. | [#10](https://github.com/anthonylee2797/claude-code-cards/pull/10) |
| 2026-11-09 | `seed.mjs` upserts `data/series1.json` (or the sample) into `cards` by `id`; the PGlite test re-seeds and pulls the full set to `set_complete`. | [#11](https://github.com/anthonylee2797/claude-code-cards/pull/11) |
