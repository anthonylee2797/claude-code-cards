---
name: workday
description: Start the team's workday. Runs the agent team (Product Manager, Staff Engineer - Web, Staff Engineer - Backend, Principal Designer - Web, Principal Designer - Claude Code) against the GitHub board until the day's limit, then reports. Use when the user types /workday, optionally with an idea ("/workday add dark mode toggle") or a round count ("/workday 3").
---

You are the orchestrator for one workday. You don't build anything yourself: you keep the board moving, hand each issue to the agent whose label is on it, check what comes back, and report to the user at the end. Run it in a session of its own so the user's other work isn't in the way.

- **Board:** https://github.com/users/anthonylee2797/projects/4 (columns Backlog, Ready, In progress, In review, Done).
- **Board script:** `bash .claude/skills/workday/board.sh list` and `bash .claude/skills/workday/board.sh move <issue> "<Column>"`. GitHub can take a few seconds to show a move in `list`; trust the `#n -> Column` line `move` prints.
- **Running an agent:** Agent tool with `subagent_type` set to the agent's name. If that fails with "Agent type … not found", run it as `general-purpose` and start the prompt with "First read `.claude/agents/<name>.md` and follow it as your instructions for this task." Say in the wrap-up that the fallback was used.
- **Agents by label:** `agent: product-manager` → `product-manager`, `agent: staff-engineer-web` → `staff-engineer-web`, `agent: staff-engineer-backend` → `staff-engineer-backend`, `agent: designer-web` → `principal-designer-web`, `agent: designer-claude-code` → `principal-designer-claude-code`.

## Day limits (stop at the first one)

- **5 rounds** (or the number the user gave).
- **3 PRs waiting on the user** (In review and not mergeable by **Merge** (C)): the user has enough to look at.
- **Nothing workable**: no unblocked issue in Ready, even after the Product Manager ran.
- **2 failed rounds** in a day (an agent errored, the build or tests failed twice, or it went out of its lane).

## 1. Standup

1. `git fetch origin` and run `board.sh list`. Open issues that have an agent label but aren't on the board go to **Ready** (the user tagged them).
2. Sync the board with GitHub: an issue whose PR is merged or that is closed → **Done**; In progress with an open PR → **In review**; a PR closed without merging → back to **Ready** with a comment. Open PRs that don't close a board issue (no `Closes #n`) aren't the team's: list them in the standup as "not on the board" and leave them alone.
3. Unblock: for each issue labelled `blocked`, if every issue it says it's "Blocked by" is closed, remove `blocked` (`gh issue edit <n> --remove-label blocked`) and comment that it's unblocked.
4. If the user gave an idea, run `product-manager` first to write it up, at the top of Ready.
5. Tell the user in a few lines: Ready, blocked (and why), PRs waiting on them. Then start working without waiting for an answer.

## 2. Rounds

Repeat until a day limit hits. Each round does the first of these that applies: finishing open work comes before starting new work.

**A. Web PR waiting for design review** (open PR labelled `design-review`): run `principal-designer-web` (worktree) with "Review PR <url> for issue #<n> as your instructions describe." Then read its comment:
- `Design: approved` → remove `design-review`, go to **Merge** below.
- `Design: changes requested` → swap `design-review` for `design-changes`.

**B. Web PR with design changes requested** (labelled `design-changes`): run `staff-engineer-web` (worktree) with "Address the design review on PR <url> (issue #<n>) as your instructions describe." Check the branch got new commits and a reply, then swap `design-changes` back to `design-review`. After **2** change rounds on one PR, stop the loop on it: remove both labels, comment that it's waiting on the user, and leave it In review.

**C. Merge** (web lane only): a PR qualifies when every changed file is in `web/` or is `HISTORY.md`, `gh pr checks <url>` is all green, and it's from `staff-engineer-web` with `Merge: auto` in its body or with `Design: approved`, or from `principal-designer-web` (no review needed). Merge it with `gh pr merge <url> --merge --delete-branch`, confirm the issue closed, `board.sh move <n> Done`, and unblock anything waiting on it. Checks still pending: leave it for a later round. Checks failing: send it back to its author like **B**, with the failing check in the comment. Vercel deploys `main` to the live site, so this is the moment it ships. Anything outside `web/` (README and other docs included) waits on the user, whichever agent made it.

**D. New work from Ready:**

1. **Top up.** Fewer than 2 unblocked issues in Ready → run `product-manager` (Agent tool, `subagent_type: product-manager`) to add 1-3. Counts as a round.
2. **Pick** the first issue in Ready (board order) with no `blocked` label and one agent label. Never pick from Backlog.
3. **Start it.** `board.sh move <n> "In progress"`, then run the agent for its label with the Agent tool, `isolation: "worktree"`, and this prompt (fill in `<n>`):

   > Work GitHub issue #<n> in anthonylee2797/claude-code-cards. First read it with every comment: `gh issue view <n> --json title,body,labels,comments` (plain `--comments` can print nothing). Stay in your lane as your instructions define it. You run with no one to ask mid-task: where your instructions say to get a yes or propose first, post the proposal on the issue and stop as **If you need the user** below.
   > - **If you can finish it:** your worktree may start on another branch, so create `agent/<n>-<short-slug>` from `origin/main` (`git fetch origin && git switch -c agent/<n>-<slug> origin/main`). Do the work, run your checks, add the HISTORY.md line with `PR_LINK` in its PR column, push, and open a PR whose body starts with `Closes #<n>` and ends with the Claude Code attribution line. Then replace `PR_LINK` with `[#<pr>](<pr url>)`, commit "HISTORY: link #<pr>", and push. Don't merge it yourself: the orchestrator decides. Comment on the issue with the PR link and what you checked.
   > - **If another agent must do part of it first** (a design, a schema change): don't do their part. Open a new issue for it with `gh issue create`, labelled with their agent label, saying what you need and that it blocks #<n>. Comment on #<n> "Blocked by #<new>: <what you need>", add the `blocked` label, and stop.
   > - **If a designer is asked for a spec only:** post the design as a comment on the issue and close it (`gh issue close <n> --reason completed`). No PR.
   > - **If you need the user** (a product decision, applying a migration to production, a secret): comment the question on the issue, add `blocked`, and stop.
   > End with: the outcome (PR url, blocked by #n, needs the user, or closed with spec) and what you did not check.

4. **Check what came back.** Don't trust the report on its own word:
   - **PR:** `gh pr view <url> --json files,body,state` exists, says `Closes #<n>`, touches only that agent's files; then `board.sh move <n> "In review"`. Add any new issue the agent opened to Ready. From `staff-engineer-web`, follow the `Merge:` line in its body: `Merge: auto` goes straight to **Merge**, unless the diff touches `globals.css` or markup in a way that changes how a page looks, in which case treat it as design review; `Merge: design review` (or no line) gets the `design-review` label (`gh pr edit <url> --add-label design-review`) so the next round reviews it; `Merge: user (…)` waits on the user. From `principal-designer-web`: it goes straight to **Merge**. Everything else (backend, plugin, anything with a migration) waits on the user.
   - **Blocked:** the `blocked` label and the comment are there and the new issue exists; `board.sh move <n> Ready` and `board.sh move <new> Ready` (the new one goes first in the next rounds).
   - **Spec posted:** issue closed with the comment → `board.sh move <n> Done`; unblock whatever was waiting on it.
   - **Failed or out of lane:** comment on the issue what went wrong, move it back to Ready with `blocked`, count a failed round. Close any PR that went out of lane only after telling the user.
5. One issue at a time. Never two agents in the same round.

## 3. Wrap-up

Report to the user, short:
- **Shipped (merged and live):** each web PR merged today (link, issue, one line, how many design rounds).
- **Waiting on you:** each PR you need to review or approve (link, issue, why it's yours: backend, plugin, migration, the engineer's `Merge: user` reason, or review loop ran out).
- **Blocked:** each issue and what it waits on (another issue or the user's answer, quoting the question).
- **New on the board:** issues the Product Manager added and which column.
- **Why the day stopped** and how many rounds ran.
- **Friction:** up to 3 things that slowed the team (a failed round, a hand-off a clearer issue would have avoided, the same design note twice), each with its issue or PR link. Don't change any agent or this skill because of them: the user decides what to improve.

## Never

- Merge any PR outside **Merge** (C): never backend, plugin, `shared/`, `supabase/` or anything with a migration. Never push to `main`, force-push, or delete a branch an agent didn't make.
- Apply a migration, write SQL or seed against production. That always waits for the user's yes in chat.
- Pick an issue from Backlog, or one labelled `needs ideation`.
- Keep going past a day limit because "one more is small".
