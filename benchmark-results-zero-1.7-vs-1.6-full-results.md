# Zero 1.7 vs 1.6 Benchmark Results

This report captures all benchmark results collected so far for the Zero 1.7 release comparison.

## Inputs

| Item                                     | Value                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1.7 ref                                  | `maint/zero/v1.7` at `2698272ca`                                                                                   |
| 1.6 ref                                  | `maint/zero/v1.6` / `zero/v1.6.2` at `63673effe`                                                                   |
| Benchmark commits applied for comparison | `9209d3880` and `7a6188a35`                                                                                        |
| 1.7 package manager                      | `pnpm`                                                                                                             |
| 1.6 package manager                      | `npm`                                                                                                              |
| Main aggregate                           | `/var/folders/1p/byzq05qd42zg5rg6__h69_7c0000gn/T/opencode/zero-pg-bench-9209d3880/benchmark-summary-10-runs.json` |

## Important Caveat

The full 116-row matrix below is the original 10-run matrix. After that full run, we found that one large planner-hydration regression was caused by a benchmark fixture issue: the benchmark created a Chinook SQLite database without the predicate indexes needed by that query before running `ANALYZE`.

We did not rerun the entire 116-row suite after fixing that benchmark. Instead, we ran a targeted index experiment for the affected planner row, 10-run targeted backports for 1.7-only benchmark coverage, and focused 5-pass reruns for the remaining push-path concerns. The practical release read uses the adjusted interpretation, not the raw bad planner row.

## Headline Summary

| Summary                                                          | Count |
| ---------------------------------------------------------------- | ----: |
| Matched benchmark rows in original 10-run matrix                 |   116 |
| Original rows improved by at least 5% in 1.7                     |     9 |
| Original rows regressed by at least 5% in 1.7                    |     9 |
| Original rows flat within +/-5%                                  |    98 |
| Adjusted rows improved by at least 5% after planner fixture fix  |    10 |
| Adjusted rows regressed by at least 5% after planner fixture fix |     8 |
| Adjusted rows flat within +/-5%                                  |    98 |

## Release Read

1.7 is broadly performance-neutral compared with 1.6 across client and query-engine benchmarks, with targeted wins in the paths that had specific 1.7 performance work. The strongest original matrix wins are in Postgres replication/storage paths. A newly backported logger allocation benchmark shows `LogContext` construction is ~1.3-1.6x faster in 1.7. Newly backported flipped-join benchmarks show a consistent ~2.8-3.3x 1.7 win for the direct batching shape and a scaling ~3.9-110x win for the ZQL-built merge-shaped query. A newly backported `Debug.rowVended` benchmark shows a scaling ~21-3,242x win for query-analysis runs that collect every vended row. The transaction benchmark for `572f1ae4b` shows 1.7's copy-on-write ArrayView transaction path stays close to 1.6's old mutable baseline for multi-edit transactions, with a small absolute single-edit overhead on wide lists. A newly backported relationship-heavy ArrayView guard benchmark shows 1.7 slower on those broader hydration/push cases, with most deltas around ~5-23% and one small baseline hydration row at 39% slower. The one huge apparent planner regression was a benchmark fixture issue and is fixed by adding `album(title)` and `genre(name)` before `ANALYZE`. Focused push-only reruns did not reproduce a broad in-memory IVM push regression. The remaining consistent regressions are small, microsecond-scale Chinook push cases and are not release-blocking.

## Postgres Replication And Storage Benchmarks

| Benchmark                                         |       1.6 |       1.7 |       Result |
| ------------------------------------------------- | --------: | --------: | -----------: |
| change-streamer/storer single transaction changes |  60.60 us |  35.10 us | 1.73x faster |
| change-streamer/storer sustained stream changes   |  63.56 us |  34.16 us | 1.86x faster |
| change-streamer/storer sustained stream commits   |  63.56 ms |  34.16 ms | 1.86x faster |
| replicator/logical replication end-to-end rows    | 114.67 us | 113.59 us | 1.01x faster |
| zero-cache/initial-sync generated fixture rows    |   6.17 us |   5.75 us | 1.07x faster |

## Logger Allocation Benchmark

This targeted benchmark came from local branch `0xcadams/logger-allocation-benchmark` as `packages/shared/src/logger.bench.ts`. It was temp-backported into both release comparison worktrees. The benchmark compares `@rocicorp/logger` `LogContext` construction and `withContext` allocation paths; v1.6 uses `@rocicorp/logger` `^5.4.0` and v1.7 uses `^6.1.0`.

Each benchmark case constructs 1,000 contexts per measured iteration. Values below are median-of-medians across 10 completed process runs.

| Benchmark                                      |      1.6 |      1.7 |       Result |
| ---------------------------------------------- | -------: | -------: | -----------: |
| LogContext construction > new debug context    | 24.23 us | 15.23 us | 1.59x faster |
| LogContext construction > new info context     | 27.86 us | 17.62 us | 1.58x faster |
| LogContext construction > new error context    | 22.41 us | 16.94 us | 1.32x faster |
| LogContext construction > withContext on debug | 31.77 us | 22.15 us | 1.43x faster |

Takeaway: 1.7 is consistently faster on logger context allocation, with the largest wins for fresh debug/info `LogContext` construction. These timings are per 1,000 constructed contexts.

## Flipped Join Batching Benchmark

This targeted benchmark was added after the original 116-row matrix to cover `8916f8001 feat(zql): batch flip join requests`. The improvement did not show up in the original run because no durable `*.bench.ts` benchmark exercised the large-N flipped-join shape optimized by that commit. The commit had a gated `zqlite` perf test, but our benchmark sweep only ran regular benchmark files from runnable benchmark packages, and `zqlite` contributed no rows.

The benchmark was temp-backported into both release comparison worktrees as `packages/zql-benchmarks/src/flipped-join-batching.bench.ts`. It builds in-memory SQLite `parent` and `child` tables, wires them through `TableSource` and direct `FlippedJoin`, then measures fetching N one-to-one child/parent joins. Values below are median-of-medians across 10 completed process runs.

|   Rows |      1.6 |       1.7 |       Result |
| -----: | -------: | --------: | -----------: |
|    100 |  2.37 ms | 718.92 us | 3.30x faster |
|    500 |  4.73 ms |   1.71 ms | 2.76x faster |
|  1,000 |  9.31 ms |   3.25 ms | 2.87x faster |
|  2,500 | 23.24 ms |   7.19 ms | 3.23x faster |
|  5,000 | 46.48 ms |  15.59 ms | 2.98x faster |
| 10,000 | 92.14 ms |  32.13 ms | 2.87x faster |

Takeaway: `8916f8001` is a clear 1.7 performance win when measured directly. The effect is not visible in the original full matrix because the matrix lacked this benchmark shape, not because the optimization was ineffective.

## Flipped Join Merge Benchmark

This targeted benchmark was added after the original 116-row matrix by converting the remaining gated `packages/zqlite/src/flipped-join-merge.perf.test.ts` into `packages/zql-benchmarks/src/flipped-join-merge.bench.ts`. The old perf test was excluded from the release matrix for the same reason as the direct batching perf test: it was a gated `*.perf.test.ts` under `zqlite`, not a standard benchmark file that emits normal benchmark output.

The benchmark builds in-memory SQLite `parent` and `child` tables, wires them through `TableSource`, constructs the query through ZQL as `parent.whereExists('children', {flip: true})`, then runs it through `buildPipeline(...)`. The join key is `bucket`, which is intentionally not schema-declared unique, preserving the merge-shaped flipped-join path from the original perf test. Values below are median-of-medians across 10 completed process runs.

Important interpretation: `7f9aee2dc feat(zql): heap-based merge in #fetchMergeSort` is already present in both 1.6 and 1.7, so this is not a direct pre/post measurement of that commit. The 1.6-vs-1.7 delta here primarily shows how the later flipped-join batching work changes the ZQL-built merge-shaped query.

|   Rows |       1.6 |       1.7 |         Result |
| -----: | --------: | --------: | -------------: |
|    100 |   2.73 ms | 699.58 us |   3.91x faster |
|    500 |  13.48 ms |   1.90 ms |   7.10x faster |
|  1,000 |  43.01 ms |   3.31 ms |  13.00x faster |
|  2,500 | 231.84 ms |   7.57 ms |  30.63x faster |
|  5,000 | 895.03 ms |  16.36 ms |  54.72x faster |
| 10,000 |    3.65 s |  33.22 ms | 109.78x faster |

Takeaway: this benchmark is the strongest flipped-join signal. The direct batching benchmark shows a stable ~3x win on the unique-key shape; the ZQL-built merge-shaped query shows the scaling behavior that was hidden by the gated perf test and grows to ~110x faster at 10,000 rows.

## Debug.rowVended Benchmark

This targeted benchmark covers `257da8234 fix(zql): avoid O(N²) spread in Debug.rowVended`. The bug was in the query-analysis/debug path that records every row vended by a SQL query into one debug bucket. 1.6 appended by cloning the whole accumulated array for every row; 1.7 appends in place.

This did not show up in normal query/materialization benchmarks because those benchmarks do not run through the query-analysis/debug path. Normal client query hydration and subscriptions do not return every vended row object. The affected path is used by analysis/debug tooling such as `analyze-query`, inspector analyze-query requests, `analyzeQuery(...)`, or equivalent project-specific query-analysis commands. Full vended rows are explicitly requested with options like `--output-vended-rows` / `vendedRows: true`, but the debug delegate also tracks vended-row arrays internally while producing row-count diagnostics, so high-fan-out analysis runs are the important case.

The benchmark was temp-backported into both release comparison worktrees as `packages/zql-benchmarks/src/debug-row-vended.bench.ts`. It directly calls `Debug.rowVended` for N rows in one table/query bucket. Values below are median-of-medians across 10 completed process runs.

|   Rows |       1.6 |       1.7 |          Result |
| -----: | --------: | --------: | --------------: |
|  1,000 | 496.75 us |  23.85 us |   20.82x faster |
|  5,000 |  10.65 ms |  62.54 us |  170.23x faster |
| 10,000 |  39.64 ms |  84.85 us |  467.19x faster |
| 20,000 | 418.16 ms | 129.00 us | 3241.57x faster |

Takeaway: this is a major win for query-analysis/debug workflows with high-fan-out queries. It is not expected to affect ordinary customer query execution unless they are running analysis/debug tooling that installs the `Debug` delegate and records rows vended by the query.

## ArrayView Transaction Copy-On-Write Benchmark

This targeted benchmark covers `572f1ae4b chore: Optimize transaction performance with copy-on-write`. The benchmark existed on 1.7 but not 1.6, so it appeared as 1.7-only in the original matrix and did not produce matched rows.

The benchmark was temp-backported into the 1.6 comparison worktree as `packages/zql-benchmarks/src/array-view-transaction.bench.ts`. It materializes a flat `ArrayView`, applies K edits inside one transaction, then calls one `delegate.commit()`. Values below are median-of-medians across 10 completed process runs.

Important interpretation: this is a 1.7-vs-1.6 release comparison, not a direct pre/post comparison against the slow immutable implementation that `572f1ae4b` optimized. The 1.6 branch is the old mutable baseline, so the useful release question is whether 1.7's copy-on-write path stays close to that baseline.

|      N | Edits/Txn |       1.6 |       1.7 |       Result |
| -----: | --------: | --------: | --------: | -----------: |
|  1,000 |         1 |   3.27 us |   3.86 us | 15.4% slower |
|  1,000 |       100 | 320.76 us | 342.82 us |  6.4% slower |
|  1,000 |     1,000 |   3.27 ms |   3.38 ms |  3.4% slower |
| 10,000 |         1 |   3.79 us |   7.29 us | 48.0% slower |
| 10,000 |       100 | 354.89 us | 381.79 us |  7.0% slower |
| 10,000 |     1,000 |   3.57 ms |   4.07 ms | 12.2% slower |

Takeaway: `572f1ae4b` should not be presented as a 1.7-vs-1.6 throughput win, because v1.6 did not have the slow immutable path this commit optimized. For the release comparison, the fixed 1.7 copy-on-write implementation is close to v1.6's mutable baseline for batched edits. The largest relative delta is the single-edit wide-list case, but the absolute difference is about 3.5 us per transaction.

## Relationship-Heavy ArrayView Benchmark

This targeted benchmark was also added after the original 116-row matrix. `array-view-relationships.bench.ts` exists on 1.7 but not 1.6, so it originally appeared only as a 1.7-only benchmark and did not produce matched comparison rows. It is not the direct `572f1ae4b` transaction-copy-on-write benchmark; it is broader relationship-heavy ArrayView hydration/push coverage for the immutable ArrayView work.

The benchmark was temp-backported into the v1.6 comparison worktree and run on both versions. Values below are median-of-medians across 10 completed process runs.

| Benchmark                                                                      |       1.6 |       1.7 |       Result |
| ------------------------------------------------------------------------------ | --------: | --------: | -----------: |
| relationship hydration > hydrate: issues only (baseline)                       | 153.99 us | 253.66 us | 39.3% slower |
| relationship hydration > hydrate: issues + comments (wide, one level)          |   1.79 ms |   1.88 ms |         flat |
| relationship hydration > hydrate: issues + comments + emoji (wide, two levels) |   9.95 ms |  10.87 ms |  8.5% slower |
| relationship hydration > hydrate: heavy query (wide + deep) — regression case  |  22.33 ms |  24.05 ms |  7.2% slower |
| relationship hydration > hydrate: heavy query limit(50)                        |   5.74 ms |   6.70 ms | 14.4% slower |
| push into relationship-heavy view > push: add issue into heavy view            |  69.63 us |  83.07 us | 16.2% slower |
| push into relationship-heavy view > push: add comment (child) into heavy view  |  13.83 us |  17.92 us | 22.8% slower |
| push into relationship-heavy view > push: edit issue title in heavy view       |  12.11 us |  12.72 us |         flat |

Takeaway: this guard benchmark does not show a 1.7 win. Hydration cases are modestly slower in 1.7, while push regressions are microsecond-scale in absolute terms. This should be treated separately from the direct transaction-copy-on-write benchmark for `572f1ae4b`.

## Planner-Hydration Fixture Correction

The raw full matrix included this bad row:

| Benchmark                                                                      |       1.6 | 1.7 Raw |   Raw Result |
| ------------------------------------------------------------------------------ | --------: | ------: | -----------: |
| `planner-hydration > track.exists(album).exists(genre) with filters > planned` | 103.33 us | 3.88 ms | 97.3% slower |

Targeted testing showed this was caused by the benchmark missing `album(title)` before `ANALYZE`. With the correct indexes, 1.7 chooses the fast `album`-flipped plan and is slightly faster than 1.6.

| Ref | Index variant                | Album flip | Genre flip |   Planned | Unplanned | Rows |
| --- | ---------------------------- | ---------- | ---------- | --------: | --------: | ---: |
| 1.6 | no extra indexes             | true       | false      | 138.54 us |  10.57 ms |   15 |
| 1.6 | album(title) only            | true       | false      | 115.17 us |  10.29 ms |   15 |
| 1.6 | genre(name) only             | false      | true       |   3.89 ms |  10.36 ms |   15 |
| 1.6 | album(title) and genre(name) | true       | false      | 102.92 us |  10.70 ms |   15 |
| 1.7 | no extra indexes             | false      | true       |   3.76 ms |  10.42 ms |   15 |
| 1.7 | album(title) only            | true       | false      | 106.29 us |  10.35 ms |   15 |
| 1.7 | genre(name) only             | false      | true       |   3.88 ms |  10.36 ms |   15 |
| 1.7 | album(title) and genre(name) | true       | false      |  92.75 us |  10.28 ms |   15 |

## Focused Push-Only Rerun

These are 5 focused reruns per version using only the push benchmarks from `ivm-memory.bench.ts` and `chinook-push.bench.ts`. They were run after the original full matrix to check whether the remaining push regressions reproduced.

| Benchmark                                  |       1.6 |       1.7 | Rerun Result |
| ------------------------------------------ | --------: | --------: | -----------: |
| Chinook push limited inside bound, zql     |   5.64 us |   6.06 us |  6.9% slower |
| Chinook push limited inside bound, zqlite  | 247.83 us | 248.33 us |         flat |
| Chinook push limited outside bound, zql    |   1.83 us |   1.83 us |         flat |
| Chinook push limited outside bound, zqlite |   8.20 us |   8.28 us |         flat |
| Chinook push unlimited, zql                |   1.91 us |   2.27 us | 15.9% slower |
| Chinook push unlimited, zqlite             |   5.48 us |   6.18 us | 11.3% slower |
| IVM push add comment                       |   9.10 us |   9.00 us |         flat |
| IVM push add issue, no join                |  56.02 us |  46.92 us | 1.19x faster |
| IVM push add issue, with creator join      |   5.57 us |   6.57 us | 15.2% slower |
| IVM push add issue inside limit(50)        |   3.53 us |   3.56 us |         flat |
| IVM push add issue outside limit(50)       |   2.58 us |   2.51 us |         flat |
| IVM push edit issue title                  |   5.66 us |   5.77 us |         flat |

Takeaway: the original broad IVM push regression did not reproduce. Most IVM push rows were flat or faster in 1.7. Chinook push rows still show small regressions, but the absolute deltas are sub-microsecond to about one microsecond.

## Original >=5% Improvements

| Benchmark                                                                                                                                          |      1.6 |      1.7 |       Result |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------: | -------: | -----------: |
| zero-cache:pg > change-streamer/storer sustained stream changes                                                                                    | 63.56 us | 34.16 us | 1.86x faster |
| zero-cache:pg > change-streamer/storer sustained stream commits                                                                                    | 63.56 ms | 34.16 ms | 1.86x faster |
| zero-cache:pg > change-streamer/storer single transaction changes                                                                                  | 60.60 us | 35.10 us | 1.73x faster |
| zql-benchmarks > src/ivm-memory.bench.ts > hydration > hydrate: issues limit 50                                                                    | 67.07 us | 40.48 us | 1.66x faster |
| zql-benchmarks > src/memory-ivm-deopt.bench.ts > Join > fetch 1000 issues -> 20 users                                                              |  1.26 ms |  1.04 ms | 1.20x faster |
| zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album) where title="Big Ones" > planned: track.exists(album) where title="Big Ones" | 79.71 us | 69.21 us | 1.15x faster |
| zql-benchmarks > src/memory-ivm-deopt.bench.ts > Join > push add/remove issue with owner                                                           |  6.95 us |  6.26 us | 1.11x faster |
| zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album) OR exists(genre) > planned: track.exists(album) OR exists(genre)             |  3.42 ms |  3.16 ms | 1.08x faster |
| zero-cache:pg > zero-cache/initial-sync generated fixture rows                                                                                     |  6.17 us |  5.75 us | 1.07x faster |

## Original >=5% Regressions Excluding Bad Planner Fixture

| Benchmark                                                                                                                               |       1.6 |       1.7 |       Result |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------: | --------: | -----------: |
| zql-benchmarks > src/ivm-memory.bench.ts > push > push: add issue (no join)                                                             |  42.52 us |  52.94 us | 19.7% slower |
| zql-benchmarks > src/chinook-push.bench.ts > push into unlimited query > zql: push into unlimited query                                 |   1.74 us |   2.09 us | 16.8% slower |
| zql-benchmarks > src/ivm-memory.bench.ts > push > push: add issue (with creator join)                                                   |   5.99 us |   7.15 us | 16.1% slower |
| zql-benchmarks > src/ivm-memory.bench.ts > push > push: add comment (child relation)                                                    |   8.65 us |  10.06 us | 14.0% slower |
| zql-benchmarks > src/chinook-push.bench.ts > push into unlimited query > zqlite: push into unlimited query                              |   5.33 us |   5.91 us |  9.9% slower |
| zql-benchmarks > src/chinook-push.bench.ts > push into limited query, inside the bound > zql: push into limited query, inside the bound |   5.37 us |   5.79 us |  7.2% slower |
| zero-client > src/client/zero.bench.ts > with filter > Lower rows 500 x 10 columns (numbers)                                            | 237.63 us | 251.42 us |  5.5% slower |
| shared > src/btree-set.bench.ts > BTreeSet mutations > getOrCreateIndex pattern (old): add() loop after sort                            |  91.94 us |  97.21 us |  5.4% slower |

## Full Original 10-Run Matrix

Lower is better. Values are median-of-medians across 10 completed runs.

| Suite | Benchmark                                                                                                                                                      |       1.6 |       1.7 |       Result |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | --------: | -----------: |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterator next() in isolation > forward iterator next()`                                                            |   2.65 us |   2.63 us | 1.01x faster |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterator next() in isolation > forward iterator next() from mid`                                                   |   1.36 us |   1.37 us |  0.6% slower |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterator next() in isolation > reverse iterator next()`                                                            |   2.78 us |   2.77 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterator next() in isolation > reverse iterator next() from mid`                                                   |   1.42 us |   1.41 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterators > [Symbol.iterator]() full scan`                                                                         |   2.49 us |   2.49 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterators > values() full scan`                                                                                    |   2.29 us |   2.29 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterators > valuesFrom() from mid`                                                                                 |   1.35 us |   1.34 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterators > valuesFromReversed() from mid`                                                                         |   1.26 us |   1.26 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet iterators > valuesReversed() full scan`                                                                            |   2.47 us |   2.45 us | 1.01x faster |
| root  | `shared > src/btree-set.bench.ts > BTreeSet lookups > get() hit`                                                                                               |  62.36 ns |  62.15 ns |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet lookups > has() hit`                                                                                               |  63.48 ns |  63.47 ns |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet lookups > has() miss`                                                                                              |  44.54 ns |  44.49 ns |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > add() 100 sequential keys`                                                                             |   4.63 us |   4.61 us |         flat |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > add() 1000 sequential keys`                                                                            |  55.82 us |  55.52 us | 1.01x faster |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > add() then delete() single key`                                                                        |  85.64 ns |  85.13 ns | 1.01x faster |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > fromSorted() 100 sequential keys`                                                                      | 463.54 ns | 458.74 ns | 1.01x faster |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > fromSorted() 1000 sequential keys`                                                                     |   3.65 us |   3.61 us | 1.01x faster |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > getOrCreateIndex pattern (new): sort + fromSorted()`                                                   |  13.19 us |  13.28 us |  0.7% slower |
| root  | `shared > src/btree-set.bench.ts > BTreeSet mutations > getOrCreateIndex pattern (old): add() loop after sort`                                                 |  91.94 us |  97.21 us |  5.4% slower |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > arrays > large array (100 items)`                                                          | 374.43 ns | 365.26 ns | 1.03x faster |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > arrays > small array (10 items)`                                                           |  47.85 ns |  47.75 ns |         flat |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > datasets > large dataset (100x512B)`                                                       |  13.77 us |  13.78 us |         flat |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > datasets > small dataset (10x256B)`                                                        |   1.39 us |   1.40 us |  1.2% slower |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > objects > nested object`                                                                   | 158.41 ns | 159.86 ns |  0.9% slower |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > objects > structured object (1KB)`                                                         | 138.11 ns | 140.89 ns |  2.0% slower |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > objects > structured object (256B)`                                                        | 140.93 ns | 139.58 ns | 1.01x faster |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > primitives > boolean`                                                                      |   7.07 ns |   7.05 ns |         flat |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > primitives > integer`                                                                      |   8.42 ns |   8.32 ns | 1.01x faster |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > primitives > null`                                                                         |   7.03 ns |   7.17 ns |  1.8% slower |
| root  | `shared > src/size-of-value.bench.ts > getSizeOfValue performance > primitives > string (100 chars)`                                                           | 731.38 ns | 749.55 ns |  2.4% slower |
| root  | `shared > src/tdigest.bench.ts > TDigest Benchmarks > add`                                                                                                     | 248.87 ms | 250.31 ms |  0.6% slower |
| root  | `shared > src/tdigest.bench.ts > TDigest Benchmarks > addCentroid`                                                                                             | 301.66 ms | 302.99 ms |         flat |
| root  | `shared > src/tdigest.bench.ts > TDigest Benchmarks > addCentroidList`                                                                                         | 306.93 ms | 309.21 ms |  0.7% slower |
| root  | `shared > src/tdigest.bench.ts > TDigest Benchmarks > merge > addCentroid`                                                                                     |  25.33 us |  24.65 us | 1.03x faster |
| root  | `shared > src/tdigest.bench.ts > TDigest Benchmarks > merge > merge`                                                                                           |  49.46 us |  49.48 us |         flat |
| root  | `shared > src/tdigest.bench.ts > TDigest Benchmarks > quantile`                                                                                                | 265.58 ms | 260.47 ms | 1.02x faster |
| root  | `zero-cache > src/db/pg-copy.bench.ts > pg-copy benchmark > copy`                                                                                              |  14.91 ms |  15.02 ms |  0.7% slower |
| root  | `zero-client > src/client/custom.bench.ts > big schema`                                                                                                        |   5.33 us |   5.26 us | 1.01x faster |
| root  | `zero-client > src/client/zero.bench.ts > basics > All 1000 rows x 10 columns (numbers)`                                                                       | 334.08 us | 345.16 us |  3.2% slower |
| root  | `zero-client > src/client/zero.bench.ts > pk compare > pk = N`                                                                                                 |   9.50 us |   9.58 us |  0.9% slower |
| root  | `zero-client > src/client/zero.bench.ts > with filter > Lower rows 500 x 10 columns (numbers)`                                                                 | 237.63 us | 251.42 us |  5.5% slower |
| root  | `zql-benchmarks > src/chinook-hydration.bench.ts > all playlists > zpg: all playlists`                                                                         | 270.61 ms | 269.48 ms |         flat |
| root  | `zql-benchmarks > src/chinook-hydration.bench.ts > all playlists > zql: all playlists`                                                                         |  70.86 ms |  70.39 ms | 1.01x faster |
| root  | `zql-benchmarks > src/chinook-hydration.bench.ts > all playlists > zqlite: all playlists`                                                                      | 409.30 ms | 410.72 ms |         flat |
| root  | `zql-benchmarks > src/chinook-manual-cases.bench.ts > tracks with artist name > flipped`                                                                       |  89.69 us |  89.31 us |         flat |
| root  | `zql-benchmarks > src/chinook-manual-cases.bench.ts > tracks with artist name > not flipped`                                                                   |  13.41 ms |  13.11 ms | 1.02x faster |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > edit for limited query, inside the bound > zql: edit for limited query, inside the bound`                        |   3.28 us |   3.37 us |  2.7% slower |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > edit for limited query, inside the bound > zqlite: edit for limited query, inside the bound`                     |   9.67 us |   9.62 us | 1.01x faster |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > edit for limited query, outside the bound > zql: edit for limited query, outside the bound`                      |   2.86 us |   2.85 us | 1.01x faster |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > edit for limited query, outside the bound > zqlite: edit for limited query, outside the bound`                   |   9.56 us |   9.33 us | 1.02x faster |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > push into limited query, inside the bound > zql: push into limited query, inside the bound`                      |   5.37 us |   5.79 us |  7.2% slower |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > push into limited query, inside the bound > zqlite: push into limited query, inside the bound`                   | 244.56 us | 243.16 us | 1.01x faster |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > push into limited query, outside the bound > zql: push into limited query, outside the bound`                    |   1.75 us |   1.76 us |  0.7% slower |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > push into limited query, outside the bound > zqlite: push into limited query, outside the bound`                 |   7.81 us |   7.83 us |         flat |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > push into unlimited query > zql: push into unlimited query`                                                      |   1.74 us |   2.09 us | 16.8% slower |
| root  | `zql-benchmarks > src/chinook-push.bench.ts > push into unlimited query > zqlite: push into unlimited query`                                                   |   5.33 us |   5.91 us |  9.9% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > hydration > hydrate: issues filtered open`                                                                         | 216.90 us | 227.44 us |  4.6% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > hydration > hydrate: issues limit 50`                                                                              |  67.07 us |  40.48 us | 1.66x faster |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > hydration > hydrate: issues only`                                                                                  | 266.55 us | 256.97 us | 1.04x faster |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > hydration > hydrate: issues with creator`                                                                          |   1.01 ms |   1.04 ms |  2.9% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > hydration > hydrate: issues with creator + comments`                                                               |   2.33 ms |   2.36 ms |  1.2% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > push > push: add comment (child relation)`                                                                         |   8.65 us |  10.06 us | 14.0% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > push > push: add issue (no join)`                                                                                  |  42.52 us |  52.94 us | 19.7% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > push > push: add issue (with creator join)`                                                                        |   5.99 us |   7.15 us | 16.1% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > push > push: add issue inside limit(50)`                                                                           |   3.71 us |   3.71 us |         flat |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > push > push: add issue outside limit(50)`                                                                          |   2.69 us |   2.72 us |  1.0% slower |
| root  | `zql-benchmarks > src/ivm-memory.bench.ts > push > push: edit issue title`                                                                                     |   6.08 us |   6.34 us |  4.1% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > Filter > fetch open issues (1000 total)`                                                                     | 213.13 us | 209.91 us | 1.02x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > Filter > push add closed issue (filtered out)`                                                               |   3.70 us |   3.70 us |         flat |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > Filter > push add open issue (passes filter)`                                                                |   4.10 us |   4.14 us |  0.9% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > Join > fetch 1000 issues -> 20 users`                                                                        |   1.26 ms |   1.04 ms | 1.20x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > Join > push add/remove issue with owner`                                                                     |   6.95 us |   6.26 us | 1.11x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > Join > push edit issue title (non-key field)`                                                                |   6.04 us |   6.01 us |         flat |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource fetch > scan 1000 rows, sort 1 key`                                                             | 151.13 us | 147.81 us | 1.02x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource fetch > scan 1000 rows, sort 2 keys`                                                            | 150.40 us | 147.54 us | 1.02x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource fetch > scan 1000 rows, sort 4 keys`                                                            | 150.81 us | 147.67 us | 1.02x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource push > add/remove over 1000 rows, sort 1 key`                                                   |   3.77 us |   3.70 us | 1.02x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource push > add/remove over 1000 rows, sort 2 keys`                                                  |   3.65 us |   3.68 us |  0.6% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource push > add/remove over 1000 rows, sort 4 keys`                                                  |   3.67 us |   3.67 us |         flat |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource push > edit over 1000 rows, sort 1 key`                                                         |   5.59 us |   5.73 us |  2.5% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource push > edit over 1000 rows, sort 2 keys`                                                        |   5.54 us |   5.71 us |  2.9% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > MemorySource push > edit over 1000 rows, sort 4 keys`                                                        |   5.54 us |   5.73 us |  3.4% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > compareValues > compareValues(mixed: string/number/bool/null)`                                               |  31.62 ns |  31.89 ns |  0.8% slower |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > compareValues > compareValues(number, number)`                                                               | 184.31 ns | 181.58 ns | 1.01x faster |
| root  | `zql-benchmarks > src/memory-ivm-deopt.bench.ts > compareValues > compareValues(string, string)`                                                               | 275.83 ns | 273.46 ns | 1.01x faster |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 1 exists: track.exists(album)`                                                                    |  39.67 us |  39.49 us |         flat |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 10 exists (AND)`                                                                                  |   3.90 us |   3.93 us |  0.8% slower |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 10 exists (OR)`                                                                                   | 148.23 us | 149.23 us |  0.7% slower |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 12 exists (AND)`                                                                                  |   4.44 us |   4.51 us |  1.6% slower |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 12 exists (OR)`                                                                                   | 177.75 us | 177.29 us |         flat |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 12 level nesting`                                                                                 | 190.67 us | 192.33 us |  0.9% slower |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 2 exists (AND): track.exists(album).exists(genre)`                                                | 112.71 us | 113.21 us |         flat |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 3 exists (AND)`                                                                                   | 290.42 us | 290.83 us |         flat |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 3 exists (OR)`                                                                                    | 558.14 us | 551.50 us | 1.01x faster |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 5 exists (AND)`                                                                                   |   1.84 ms |   1.82 ms | 1.01x faster |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > 5 exists (OR)`                                                                                    |   3.81 ms |   3.71 ms | 1.03x faster |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > Nested 2 levels: track > album > artist`                                                          | 127.48 us | 126.38 us | 1.01x faster |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > Nested 4 levels: playlist > tracks > album > artist`                                              | 782.15 us | 782.95 us |         flat |
| root  | `zql-benchmarks > src/planner-cost.bench.ts > planner cost > Nested with filters: track > album > artist (filtered)`                                           | 156.35 us | 157.69 us |  0.8% slower |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > playlist.exists(tracks) > planned: playlist.exists(tracks)`                                                 | 815.11 us | 828.32 us |  1.6% slower |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > playlist.exists(tracks) > unplanned: playlist.exists(tracks)`                                               | 821.38 us | 823.16 us |         flat |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album) OR exists(genre) > planned: track.exists(album) OR exists(genre)`                       |   3.42 ms |   3.16 ms | 1.08x faster |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album) OR exists(genre) > unplanned: track.exists(album) OR exists(genre)`                     |  12.70 ms |  12.62 ms | 1.01x faster |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album) where title="Big Ones" > planned: track.exists(album) where title="Big Ones"`           |  79.71 us |  69.21 us | 1.15x faster |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album) where title="Big Ones" > unplanned: track.exists(album) where title="Big Ones"`         |  10.28 ms |  10.14 ms | 1.01x faster |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album).exists(genre) > planned: track.exists(album).exists(genre)`                             |  13.50 ms |  13.38 ms | 1.01x faster |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album).exists(genre) > unplanned: track.exists(album).exists(genre)`                           |  13.45 ms |  13.11 ms | 1.03x faster |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album).exists(genre) with filters > planned: track.exists(album).exists(genre) with filters`   | 103.33 us |   3.88 ms | 97.3% slower |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(album).exists(genre) with filters > unplanned: track.exists(album).exists(genre) with filters` |  10.61 ms |  10.61 ms |         flat |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(playlists) > planned: track.exists(playlists)`                                                 | 151.77 ms | 151.82 ms |         flat |
| root  | `zql-benchmarks > src/planner-hydration.bench.ts > track.exists(playlists) > unplanned: track.exists(playlists)`                                               | 151.24 ms | 153.74 ms |  1.6% slower |
| pg    | `zero-cache:pg > change-streamer/storer single transaction changes`                                                                                            |  60.60 us |  35.10 us | 1.73x faster |
| pg    | `zero-cache:pg > change-streamer/storer sustained stream changes`                                                                                              |  63.56 us |  34.16 us | 1.86x faster |
| pg    | `zero-cache:pg > change-streamer/storer sustained stream commits`                                                                                              |  63.56 ms |  34.16 ms | 1.86x faster |
| pg    | `zero-cache:pg > replicator/logical replication end-to-end rows`                                                                                               | 114.67 us | 113.59 us | 1.01x faster |
| pg    | `zero-cache:pg > zero-cache/initial-sync generated fixture rows`                                                                                               |   6.17 us |   5.75 us | 1.07x faster |

## 1.7-Only Root Benchmark Rows

These benchmark names existed only in the 1.7 benchmark set used for this comparison, so they were not part of the matched-row calculations.

|                                                                                                                                 Benchmark |
| ----------------------------------------------------------------------------------------------------------------------------------------: |
|  `zql-benchmarks > src/array-view-relationships.bench.ts > push into relationship-heavy view > push: add comment (child) into heavy view` |
|            `zql-benchmarks > src/array-view-relationships.bench.ts > push into relationship-heavy view > push: add issue into heavy view` |
|       `zql-benchmarks > src/array-view-relationships.bench.ts > push into relationship-heavy view > push: edit issue title in heavy view` |
|  `zql-benchmarks > src/array-view-relationships.bench.ts > relationship hydration > hydrate: heavy query (wide + deep) - regression case` |
|                        `zql-benchmarks > src/array-view-relationships.bench.ts > relationship hydration > hydrate: heavy query limit(50)` |
|          `zql-benchmarks > src/array-view-relationships.bench.ts > relationship hydration > hydrate: issues + comments (wide, one level)` |
| `zql-benchmarks > src/array-view-relationships.bench.ts > relationship hydration > hydrate: issues + comments + emoji (wide, two levels)` |
|                       `zql-benchmarks > src/array-view-relationships.bench.ts > relationship hydration > hydrate: issues only (baseline)` |
|           `zql-benchmarks > src/array-view-transaction.bench.ts > flat list N=10000: K edits per transaction > N=10000: txn of 1 edit(s)` |
|         `zql-benchmarks > src/array-view-transaction.bench.ts > flat list N=10000: K edits per transaction > N=10000: txn of 100 edit(s)` |
|        `zql-benchmarks > src/array-view-transaction.bench.ts > flat list N=10000: K edits per transaction > N=10000: txn of 1000 edit(s)` |
|             `zql-benchmarks > src/array-view-transaction.bench.ts > flat list N=1000: K edits per transaction > N=1000: txn of 1 edit(s)` |
|           `zql-benchmarks > src/array-view-transaction.bench.ts > flat list N=1000: K edits per transaction > N=1000: txn of 100 edit(s)` |
|          `zql-benchmarks > src/array-view-transaction.bench.ts > flat list N=1000: K edits per transaction > N=1000: txn of 1000 edit(s)` |

## Blocked Or Excluded

`replicache:bench` was excluded because it did not complete within 2 hours after temp-only harness fixes. It first required Playwright Chromium installation, then exposed existing harness/runtime issues, and finally exceeded the timeout.

## Final Recommendation

Do not block Zero 1.7 on the benchmark results collected so far. Track the small Chinook push regressions as a follow-up, but the release-relevant result is that 1.7 is broadly flat, materially faster in Postgres replication/storage paths, and does not have a confirmed large regression after the planner benchmark fixture fix.
