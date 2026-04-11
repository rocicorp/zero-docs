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
   - `git log --oneline --no-merges <prevTag>..<targetTag>`
2. Classify commits using conventional commit prefixes:
   - `feat` -> Features
   - `fix` -> Fixes
   - `perf` -> Performance (if meaningful)
   - `chore` -> ignored by default
3. Reclassify suspicious commits:
   - Include chore commits that look user-facing, behavior-changing, protocol-affecting, or crash/fix related.
   - Check dependency update commits (especially performance-critical packages like `compare-utf8`, `litestream`, etc.) - look at the upstream changelogs to see if they contain notable perf or fix items.
4. Breaking change pass (separate from type labels):
   - Look for API renames/removals, env var/config changes, behavior flips, migration requirements, protocol changes.
   - Also scan commit text for "breaking" or semantically breaking behavior even if unlabeled.
5. Protocol compatibility check:
   - Find protocol constants in mono.
   - Ensure `MIN_PROTOCOL_VERSION` in the version being documented is `<=` `PROTOCOL_VERSION` in the previous release version.
   - Flag any mismatch in the draft.
6. Build draft release notes in the latest format used in this repo:
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
- If several PRs comprise one logical fix, include one bullet with artful multi-link phrasing.
- If no breaking changes, write `None.`
- **Fix descriptions must be user-facing**, not implementation details:
  - Describe the problem, not "Fix [problem]" - the section heading already says "Fixes"
  - Good: "Hang during initial sync when no upstream changes occurred after backfill"
  - Bad: "Ensure backfill-completed tx version is >= the backfill watermark"
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

## Output Checklist

- Commit range used
- Features included
- Performance items included/excluded rationale
- Potential breaking changes list (or explicit none found)
- Protocol compatibility result
- Any TODO docs links left for human follow-up
