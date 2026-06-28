---
name: benchmark-compare
description: Compare benchmark results between two refs, branches, tags, or commits; produce aggregate before/after summaries and investigate major regressions.
---

# Benchmark Compare

Use this skill when comparing benchmark performance across two code versions, especially for release notes or regression investigation.

## Goal

Produce a repeatable before/after benchmark comparison with raw evidence, clear aggregate results, and documented caveats.

## Inputs

Gather:

- Repository path.
- Baseline ref.
- Target ref.
- Benchmark command or commands.
- Metric direction: higher-is-better or lower-is-better.
- Desired output: release-note summary, investigation, or raw report.

Ask one short question if any required input is unclear.

## Workflow

1. Resolve baseline and target refs to exact SHAs.
2. Use separate temporary worktrees so active working trees are not touched.
3. Set up each worktree using that ref's normal project tooling.
4. Record environment details: machine, OS, runtime versions, package manager versions, and relevant env vars.
5. Run equivalent benchmark commands on both refs.
6. Save raw output and logs for both runs.
7. Confirm the benchmark commands succeeded before comparing results.
8. Normalize results into benchmark name, metric value, unit, and direction.
9. Compare matching benchmark names only.
10. Summarize aggregate results and investigate major outliers.

## Comparison Rules

Compare only benchmark cases that exist on both refs.

Exclude changed benchmark definitions unless the same definition was intentionally run on both refs.

If benchmark-only changes are backported for comparison, do that only in the temporary baseline worktree and document it.

Do not backport production code when measuring a performance commit. Only backport benchmark files or benchmark harness changes needed to run the same benchmark definition on both refs.

Before relying on a benchmark matrix for release notes, check whether important performance commits are actually covered:

- Inspect the commit message, PR description, and changed files to identify the optimized path.
- Look for durable benchmark coverage, usually `*.bench.ts` files run by the normal benchmark command.
- Treat gated `PERF=1` tests, `*.perf.test.ts` files, one-off scripts, and custom console tables as evidence, not matrix coverage.
- Check whether the benchmark exists on both refs with `git ls-tree <ref>:<path>` or an equivalent read-only check.
- If a target-only benchmark covers the path, temp-backport it into the baseline worktree and run it on both refs.
- If no durable benchmark exists, create the smallest benchmark that targets the optimized path using APIs available on both refs.
- Validate the benchmark once on each ref before starting multi-run batches.
- Record all benchmark-only temp backports: files changed, refs, SHAs, commands, and whether the benchmark definition was identical across refs.

Examples:

- A gated `zqlite/src/*.perf.test.ts` for flipped-join batching did not appear in the matrix because normal benchmark runs only picked up `*.bench.ts`. The fix was to add a standard `zql-benchmarks/src/*.bench.ts`, temp-backport it into both release worktrees, and report the result separately from the original matrix.
- `array-view-transaction.bench.ts` covered transaction copy-on-write on the target ref but did not exist on the baseline ref. The fix was to temp-backport that benchmark file to the baseline worktree and run the same benchmark on both refs.

Use ratios consistently:

- Higher-is-better: `target / baseline`.
- Lower-is-better: `baseline / target`.

A ratio above `1.0` means target improved. A ratio below `1.0` means target regressed.

## Summary

Report:

- Comparable benchmark count.
- Median ratio.
- Geometric mean ratio.
- Improved count above a chosen threshold, usually 5%.
- Regressed count above the same threshold.
- Top improvements.
- Top regressions.
- Exclusions or caveats.

If one outlier dominates the aggregate, report both the full result and the result excluding that named outlier. Do not hide the outlier.

## Troubleshooting

If output is empty or partial, inspect raw logs before comparing.

If benchmark output is piped through a converter, ensure benchmark failures are not hidden.

If runtime-specific build artifacts fail, rebuild or reinstall using the project's documented tooling.

If benchmark arguments are not forwarded correctly, run from the package or directory where the benchmark command is defined, or invoke the underlying runner directly.

If results look noisy, rerun the affected benchmark subset and report uncertainty.

## Regression Investigation

For severe regressions:

1. Verify the result from raw output or a rerun.
2. Confirm the benchmark definition did not change.
3. Inspect relevant code diffs.
4. Check tests for changed behavior or expectations.
5. Use commit history or blame to identify likely causes.
6. Link relevant commits or PRs when available.
7. State whether the cause appears proven or uncertain.

## Release Notes

Prefer aggregate performance summaries over listing every performance PR.

Include:

- Baseline ref and SHA.
- Target ref and SHA.
- Benchmark suite or command.
- Environment.
- Comparable benchmark count.
- Median and geometric mean results.
- Important wins and regressions.
- Caveats and exclusions.

Keep claims scoped to the measured benchmark suite and environment.
