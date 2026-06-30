---
name: release-notes
description: Draft Zero release notes from rocicorp/mono commits, using the zero-docs release-notes format with over-inclusive feature/fix capture, protocol compatibility checks, and breaking-change detection.
---

# Zero Release Notes Skill

Use this skill to draft new Zero release notes in `zero-docs` from `rocicorp/mono` commits.

## Goal

Produce a release note draft that is intentionally over-inclusive so a human can trim it.

## Inputs

- Release version, e.g. `1.2.0`
- Previous release tag, e.g. `zero/v1.1.0`
- Target tag/commit, e.g. `zero/v1.2.0` or `main`

## Repo Discovery

1. Look for a local monorepo as a peer of the current repo first.
2. Preferred path check order:
   - `../mono`
   - other sibling dirs named like `*mono*`
3. Verify it is the right repo by checking that `origin` is `rocicorp/mono`.
4. If no valid local monorepo is found, ask the human for the path.
5. Only use remote GitHub fallback if local repo is unavailable.

## Workflow

1. Determine commit range between release tags:
   - First list every non-merge commit in the raw range:
     - `git log --reverse --oneline --no-merges <prevTag>..<targetTag>`
   - Keep this as the audit source until the human has reviewed categorization.
2. Remove commits already included in the previous release through cherry-picks:
   - Find the common ancestor between previous release and target:
     - `git merge-base <prevTag> <targetTag>`
   - Inspect commits on the previous-release side after that ancestor:
     - `git log --reverse --format='%h%x09%s%n%b%n---END---' <mergeBase>..<prevTag>`
   - Look for `-x` cherry-pick trailers such as `(cherry picked from commit <sha>)`.
   - Also use patch-equivalence to catch cherry-picks whose lockfiles or package-manager files differ:
     - `git log --right-only --no-merges --cherry-mark --format='%m%x09%h%x09%s' <prevTag>...<targetTag>`
   - Treat `=` commits as already present in the previous release and categorize them as `skip`, unless the target commit contains materially different user-facing changes.
   - When a previous-release maintenance commit names a target commit in its cherry-pick trailer, categorize that target commit as `skip`.
3. Run the protocol compatibility check immediately:
   - Find protocol constants in mono before drafting any notes.
   - Check both previous release and target values, for example:
     - `git show <prevTag>:packages/zero-protocol/src/protocol-version.ts`
     - `git show <targetTag>:packages/zero-protocol/src/protocol-version.ts`
   - Ensure the target version's minimum supported sync protocol is `<=` the previous release's `PROTOCOL_VERSION`.
   - If compatibility fails, this is a release-blocking breaking change. Record it loudly in `.releases/<major>.<minor>/commits.md` with `BREAKING`, and mark the responsible commit `BREAKING` if it can be identified.
   - If compatibility passes, still record the result in `.releases/<major>.<minor>/commits.md` so later release reviews do not need to rediscover it.
4. Categorize every commit and flag potential breaking changes before drafting. Use only these categories:
   - `perf`
   - `feature`
   - `fix`
   - `skip`
   - Also identify potential breaking changes in every commit, including skipped/internal-looking commits.
   - Look early for API renames/removals, env var/config changes, default behavior flips, migration requirements, protocol changes, package export/import changes, dependency/peer dependency changes that can affect install/runtime behavior, and commit text containing "breaking".
   - Record breaking-change status separately from category.
   - Use `-` for commits that are not believed breaking.
   - Use `MAYBE` for commits that could be breaking and need human review; explain why in the note.
   - If a commit is believed to be breaking, make it extremely visible with `BREAKING`. This should be rare; Zero release planning aims to avoid breaking changes.
   - Treat breaking-change detection as an early warning system for ongoing release review, not something to defer until the final draft.
5. Present the categorization to the human for review before writing release notes:
   - Use a Markdown table with `Commit`, `Category`, `Breaking?`, and `Note`.
   - The note should be a few sentences when useful: summarize what changed, why the category was chosen, whether it was skipped due to cherry-pick, revert, internal-only scope, or lack of user-facing impact, and why it is or is not a potential breaking change.
   - Prefer `skip` for CI, release tooling, benchmark-only, sample-only, dependency hygiene with no identified user-facing effect, reverted changes, and commits already in the previous release.
   - Use `fix` for customer-observable behavior even when the commit is labeled `chore`, e.g. packaging changes that prevent duplicate runtime dependencies from breaking checks like `Pool instanceof`.
   - Use `perf` for fixes whose primary user-facing value is measured speed/CPU/allocation improvement.
   - Use `feature` for new user/operator/debugging capability.
   - Reclassify suspicious commits while building the table:
     - Include `chore` commits that look user-facing, behavior-changing, protocol-affecting, package/export-affecting, or crash/fix related.
     - Check dependency update commits when they affect runtime, install, protocol, query correctness, or performance-critical packages. Look at upstream changelogs when needed.
   - Treat the `Breaking?` column as the breaking-change pass:
     - Look for API renames/removals, env var/config changes, behavior flips, migration requirements, protocol changes, package export/import changes, dependency/peer dependency changes, and semantically breaking behavior even if unlabeled.
     - Also scan commit text for "breaking".
   - Flag performance follow-ups early for commits that change query compilation, index use, dependency implementations, hot loops, or runtime semantics. Put the performance concern in the note or open questions even if the commit category is `fix`.
6. Save the reviewed categorization in the docs worktree before drafting:
   - Use a stable release working-state directory under `.releases/<major>.<minor>/`, for example `.releases/1.7/commits.md`.
   - Include release version, previous tag, target, merge base, the exact commands used, the reviewed table, potential breaking changes, and any unresolved questions.
   - On later sessions, read this file first and evolve it instead of redoing the whole commit audit.
7. After human review of the categorization, classify the non-skipped commits using conventional commit prefixes as a starting point:
   - `feat` -> Features
   - `fix` -> Fixes
   - `perf` -> Performance (if meaningful)
   - `chore` -> ignored by default
8. Before drafting, revisit the reviewed table:
   - Confirm all non-skipped commits are represented or intentionally omitted.
   - Re-check any `MAYBE` or `BREAKING` rows and summarize the decision in the draft or in the saved release state.
   - Re-check any performance follow-ups recorded in `.releases/<major>.<minor>/commits.md`.
9. Build draft release notes in the latest format used in this repo:
   - Before drafting, read `contents/docs/release-notes/0.26.mdx` as the canonical long-form style reference to avoid format drift.
   - Frontmatter with `title` and `description`
   - `## Installation`
   - optional `## Overview`
   - `## Features`
   - optional `## Performance`
   - `## Fixes`
   - `## Breaking Changes`

## Formatting Rules

- Prefer including too much over too little.
- Do not list chores unless they appear miscategorized and user-relevant.
- Feature bullets must link to docs; if unknown, use `TODO` links as placeholders.
- Fix bullets must be one line each and link to PRs.
- Performance bullets should include quantified impact when available (e.g. `2x faster`, `20-30% faster`, `~6-8% faster`) based on PR benchmark tables/comments.
- If a perf PR has mixed results, emphasize meaningful wins and avoid dismissive phrasing.
- If several PRs comprise one logical fix, include one bullet with artful multi-link phrasing.
- If no breaking changes, write `None.`
- **Fix descriptions must be user-facing**, not implementation details:
  - Describe the problem, not "Fix [problem]" - the section heading already says "Fixes"
  - Phrase fixes as the old broken behavior or user-visible problem, not as a new capability
  - Prefer wording like "X could...", "X were not...", "X failed to...", or "X incorrectly..."
  - Avoid feature-style wording in fixes such as "X can now...", "Added support for...", or "Expose..."
  - When a fix has a user-visible error message and the exact text is available in commit messages, PR discussion, tests, issues, or code comments, prefer quoting that error text because users are more likely to recognize it
  - If you cannot verify the exact error text from source material, do not invent or paraphrase it as a fake quote
  - Good: "Hang during initial sync when no upstream changes occurred after backfill"
  - Good: "Query and mutator validation errors were not exposing raw schema issues in error `details`"
  - Good: "Error 'cannot extract elements from a scalar' when nullable array values were passed to custom mutators"
  - Bad: "Ensure backfill-completed tx version is >= the backfill watermark"
  - Bad: "Query and mutator validation errors can expose raw schema issues in error `details`"
  - Bad: "Error 'some guessed message' when..." if that string was not verified from source
  - If there's an error message, include it: "Error 'could not frob confabulator' when..."
  - Omit purely internal fixes that users would never notice
- Thank external contributors (non-Rocicorp) at the end of their bullet:
  - Format: `(thanks [@username](https://github.com/username)!)`
  - Check commit author emails - rocicorp employees use `@roci.dev` emails
  - Also check for Co-authored-by lines in commit messages

## File Updates

1. Add new note at `contents/docs/release-notes/<major>.<minor>.mdx`.
2. Add index entry at the top of `contents/docs/release-notes/index.mdx`:
   - Format: `- [Zero X.Y: Short Description](/docs/release-notes/X.Y)`
   - Insert as the first list item (after the frontmatter)
   - The description should match the `description` field in the release note's frontmatter
3. Keep title style aligned with latest release notes.

## Updating Non-Release-Note Docs

When a new feature lands, the release-notes feature bullet should link to a real docs anchor — not a PR. That often means updating `contents/docs/**` to document the feature alongside the release.

When updating those docs, do not mention version numbers. The main docs describe Zero's current state only; version numbers belong in release notes. Exception: a `<Note>` callout describing historical behavior or a legacy workaround may say "originally" or "previously" but should still avoid precise version numbers like `>=v1.5`.

## Output Checklist

- Commit range used
- Features included
- Performance items included/excluded rationale
- Potential breaking changes list (or explicit none found)
- Protocol compatibility result
- Any TODO docs links left for human follow-up
