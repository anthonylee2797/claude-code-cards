# Contributing

Series 1 is built in parallel by several agents. These rules keep them from breaking each other.

## Who owns what

| Folder | Owner | Notes |
| --- | --- | --- |
| `shared/` | contracts | Types used by everyone: `Tier`, `Card`, `PullResult` |
| `data/` | #4 card data | `series1.sample.json` is a 5-card stand-in until `series1.json` lands |
| `supabase/` | #5 database | `0001_init.sql` is the contract; build on it with new migrations |
| `hooks/` | #6 plugin | |
| `web/` | #7 web app | |

## The rule

**Never change `shared/` or a merged migration in a feature pull request.**

To change a contract, open a small pull request that changes only the contract, merge it,
then update the other branches from `main`. A schema change is always a new migration file.

Every migration or database-logic change adds one line to `supabase/HISTORY.md` (what changed, which PR).

## Locked in

- Card IDs are stable slugs: `s1-stephen-curry`, `s1-legend-lebron-james`.
- Tier weights: common 0.76, middle 0.50, top 0.27, legend 0.20 (the `cards.weight` column is generated from `tier`).
- No duplicate pulls: `pulls` has primary key `(user_id, card_id)`.
- Clients only read tables; the only write is `pull_card()`.

## Checks

Every pull request runs `.github/workflows/check.yml`. Locally:

```bash
npx -p typescript@5.5.4 tsc -p shared && node shared/sample.check.ts
```

```bash
npm i --no-save @electric-sql/pglite@0.2.17 && node supabase/tests/migrations.test.mjs
```
