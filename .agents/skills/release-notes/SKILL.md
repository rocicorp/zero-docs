---
name: release-notes
description: Draft Zero release notes from rocicorp/mono commits, including complete commit audits, compatibility and breaking-change checks, substantiated performance claims, related docs updates, and smoke-test handoff.
---

# Zero Release Notes

Use this skill to turn a Zero release range into a complete internal audit and concise, accurate public release notes.

## Core Contract

1. Audit exhaustively. Every commit in the release range gets a recorded decision.
2. Select deliberately. Publish changes that developers or operators can observe; record why other candidates were omitted.
3. Verify before claiming. Public statements must trace to source, tests, product docs, issues, or repeatable benchmarks.
4. Write simply. Explain the developer-facing behavior at the minimum useful technical level.
5. Preserve state. Save refs, commands, decisions, evidence, and unresolved questions under `.releases/<major>.<minor>/`.

The private audit should be over-inclusive. The public note should be selective and concise.

## Inputs

Collect or infer:

- Release version, such as `1.8.0`.
- Previous immutable tag or ref.
- Target immutable tag, branch, or commit.
- Local `rocicorp/mono` repository path.
- Local `zero-docs` repository path.

Resolve both refs to exact SHAs before auditing. Ask one short question if a required input is ambiguous.

## Source Provenance

1. Prefer a local monorepo and verify that its remote points to `rocicorp/mono`.
2. Record the previous ref, target ref, resolved SHAs, and merge base.
3. Save the complete non-merge range as the audit source:

```sh
git log --reverse --oneline --no-merges <previous>..<target>
```

4. Detect changes already shipped through maintenance backports.
5. Inspect cherry-pick trailers on the previous-release side of the merge base.
6. Use patch equivalence to find backports whose generated or lockfile changes differ:

```sh
git log --right-only --no-merges --cherry-mark --format='%m%x09%h%x09%s' <previous>...<target>
```

Treat patch-equivalent commits and commits named by `cherry-pick -x` trailers as already shipped unless the target contains additional user-visible behavior.

## Release Audit

Create or update `.releases/<major>.<minor>/commits.md`. Do not redo completed research in later sessions; evolve this file.

Record:

- Release refs, SHAs, merge base, and commands used.
- Protocol compatibility result.
- A row for every commit in the raw range.
- Potential breaking changes and their resolution.
- Performance candidates, benchmark status, and whether coverage is original-suite or targeted/backported.
- Required product documentation.
- Open questions and explicit omission decisions.

Use this table shape:

| Commit | Category | Breaking? | Public impact | Decision and evidence |
| ------ | -------- | --------- | ------------- | --------------------- |

Categories are `feature`, `fix`, `performance`, and `skip`. Commit prefixes are discovery hints, not classification rules. A `chore` can be user-facing; a `fix` can primarily be a performance improvement.

Use `-`, `MAYBE`, or `BREAKING` in the breaking column. Inspect every commit, including skipped and internal-looking commits.

Prefer `skip` for reverted work, already-shipped backports, CI-only changes, benchmark-only changes, sample-only changes, and dependency hygiene with no identified user impact. Record the reason.

For dependency updates affecting runtime, installation, protocol behavior, query correctness, or performance-critical paths, inspect the upstream release notes before assigning `skip`.

Present the completed audit to the human for review before drafting public notes.

## Safety Gates

### Protocol Compatibility

Check protocol constants on both refs before drafting. The target's minimum supported sync protocol must be less than or equal to the previous release's protocol version.

Record passing and failing results. An incompatible result is release-blocking; mark the responsible audit row `BREAKING` when identifiable.

### Breaking Changes

Review the range independently for:

- Public API, package export, or import changes.
- Configuration or environment-variable changes.
- Default behavior changes.
- Migration or persisted-data requirements.
- Protocol compatibility.
- Dependency and peer-dependency changes affecting install or runtime behavior.
- Deployment, upgrade, or rollback requirements.

Also inspect commit messages, PR descriptions, and labels for explicit breaking-change declarations.

Resolve every `MAYBE` before final publication. Breaking changes should include practical migration instructions.

## Public Candidate Selection

After audit review:

1. Select changes visible to application developers, operators, installation, deployment, correctness, reliability, or supported APIs.
2. Group commits that form one coherent capability or solve one user-visible problem.
3. Map each feature to durable product documentation.
4. Map each fix to its PR or issue.
5. Record an explicit omission reason for every non-skipped candidate not included publicly.
6. Confirm every non-skipped commit is represented or intentionally omitted before finalizing.

## Performance Evidence

Performance items require release-quality baseline and target evidence. Load the `benchmark-compare` skill to run comparisons; this skill owns claim selection and public presentation, not benchmark-runner mechanics.

Before benchmarking, define:

- The developer workload.
- The exact lifecycle phase: hydration, incremental updates, replication, startup, or another operation.
- The claim boundary and whether it requires end-to-end measurement.
- The metric direction and meaningful unit.

Use `benchmark-compare` for execution. For release-quality evidence, normally require 10 completed process-isolated runs per ref, aggregate process-level medians, classify each result as original-suite or targeted/backported coverage, and save commands, raw output, aggregates, environment, and caveats under `.releases/<major>.<minor>/`.

The measurement must support the public claim. Internal-stage throughput cannot substantiate a claim about complete replication, hydration, or incremental updates.

Use meaningful absolute chart units. Prefer latency for latency, updates per second for incremental maintenance, and payload `MiB/s` for variable-size replication workloads when payload bytes are known. Benchmark artifacts must say whether bytes represent fixture payload, WAL, logical replication, or wire traffic.

Omit a performance item when the complete operation does not improve meaningfully, the workload cannot be explained, or the evidence does not support a useful developer claim. For mixed results, narrow the claim to the supported workloads and disclose meaningful contrary results affecting the same audience.

## Draft Structure

Read the latest reviewed release note for current house style. Use one current exemplar rather than combining rules from several historical releases.

Write the note to `contents/docs/release-notes/<major>.<minor>.mdx`.

Default structure:

```md
---
title: Zero X.Y
description: Short Description
---

## Installation

## Overview

## Features

## Performance

## Fixes

## Breaking Changes
```

`Overview` and `Performance` are optional. Always include `Breaking Changes`; write `None.` when there are none.

## Public Writing

Write for a developer deciding whether the release matters to their application.

- Lead with the workload, problem, or capability, not a commit title or subsystem.
- Use the smallest public API concept that identifies the feature. Do not repeat API syntax throughout the explanation.
- Keep code examples minimal while ensuring they can produce the behavior being discussed.
- Use established product and docs terminology.
- Verify implementation details privately, then explain the behavior at the Zero/product level.
- Teach only enough technical detail to explain who benefits and why.
- Do not expose internal class, operator, storage, or benchmark names unless developers use them directly.
- Scope claims to the measured lifecycle phase and conditions.
- Avoid speculative or promotional conclusions not demonstrated by evidence.

For performance prose, use rounded comparisons such as `about 1.5x faster`, `2x faster`, or `over 50x faster`. Put exact baseline and target values in the chart instead of repeating them in prose. `In benchmarks` is a useful way to scope a result; avoid methodology digressions in public copy.

When conditions or causality need clarification, use this pattern:

```md
### Developer Operation

[Introduce the workload and relevant conditions.]

[Explain the old and new behavior only when needed to understand the result.]

In benchmarks, [condition], [operation] was [rounded comparison] faster.

<BenchmarkComparisonChart ... />
```

Do not force implementation details such as cursor predicates, planner bounds, or internal pipeline stages into public prose when a simpler behavioral explanation is materially accurate.

Order performance sections by expected developer impact, not commit order or the largest multiplier.

## Charts

Charts carry the concrete evidence while prose carries the takeaway.

Require:

- A user-facing operation as the title.
- Plain row labels that identify what varies.
- Absolute baseline and target values.
- A meaningful unit and correct metric direction.
- Minimal machine subtext, such as `Measured on M5 Pro. Higher is better.`
- A compact tooltip with both values and the faster or slower ratio.

Keep machine names out of body prose, chart titles, and row labels. Keep detailed hardware, process counts, aggregation, and caveats in the release working directory.

## Features, Fixes, and Attribution

Feature bullets should explain a developer capability and link to durable product docs. A `TODO` link is acceptable in a draft but not in a publishable note.

Fix bullets should describe the user-visible problem or corrected behavior and link to the PR. Group related fixes when one sentence is clearer. Use exact error text only when verified from source material. Omit fixes with no observable user or operator effect.

Thank external contributors at the end of the relevant bullet:

```md
(thanks [@username](https://github.com/username)!)
```

Verify commit authors, co-authors, and organizational affiliation rather than relying on commit prefixes or individual-specific exceptions.

## Product Docs

Features should link to real docs anchors, which may require updating `contents/docs/**` alongside the release note.

Main product docs describe the current product and should normally avoid release version numbers. Historical version context belongs in release notes unless a clearly historical callout is necessary.

Insert `- [Zero X.Y: <description>](/docs/release-notes/X.Y)` as the first item in `contents/docs/release-notes/index.mdx`; `<description>` must match the release-note frontmatter.

## Final Verification

Before presenting the final draft, confirm:

- Every audited commit has a decision.
- Every public item maps to evidence.
- Every performance claim maps to saved benchmark results.
- Performance prose is no broader than its chart.
- Protocol compatibility is recorded.
- Breaking risks are resolved.
- No draft TODO links remain.
- Required product docs and release index are updated.
- Generated docs artifacts are current.
- Formatting, types, tests, and build pass where applicable.

Review headings, prose, code examples, chart titles, row labels, subtext, and tooltips independently. The result should be concise without hiding scope or uncertainty.

## Smoke-Test Handoff

After editorial review and canary availability, load the `release-smoke-test` skill. Pass it the reviewed notes, previous stable version, target canary, mono ref, companion-package scope, and unresolved risks from the release audit.

Treat the release notes as the upgrade contract. Any required migration or operational step that cannot be inferred from the notes is a documentation gap and should be fed back into the release note or product docs.

## Output

Report:

- Release refs and SHAs.
- Audit and compatibility status.
- Features, fixes, and breaking changes included.
- Intentional omissions and unresolved questions.
- Performance items included or excluded, with evidence locations.
- Product docs and generated files updated.
- Validation results.
- Smoke-test readiness or blockers.
