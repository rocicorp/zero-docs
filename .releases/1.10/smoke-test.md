# Zero 1.10 Companion Package Smoke Test

Updated: 2026-09-02

## Release Metadata

| Item                       | Value                                                                |
| -------------------------- | -------------------------------------------------------------------- |
| Zero source target         | `14a1c8eb4846b92948a8006cec8b331612085288`                           |
| Companion test artifact    | `@rocicorp/zero@1.10.0-canary.13`                                    |
| Rejected artifact          | `@rocicorp/zero@1.10.0-canary.15`; contains reverted, unstable #6460 |
| Replacement candidate      | Pending from the current source target                              |
| Replacement workflow       | `33685579981`                                                        |
| Stable artifact            | Pending; npm `latest` remains `1.9.0`                                |
| Adapter publication policy | Stable releases only; do not publish against a canary                |

The current source target adds #6459 to the canary.13 source and reverts #6460.
Its tree exactly matches the #6459-only commit
`131870e5617931499135ba63e4922dee525a7831`. The adapter manifests target the
eventual stable peer floor `@rocicorp/zero >=1.10.0`. Canary.13 remains pinned
only as a development and test dependency until a replacement current-head
canary is available.

## Repository Status

| Repository              | Base                | Branch               | Previous package | Target package | Status                                                                 |
| ----------------------- | ------------------- | -------------------- | ---------------- | -------------- | ---------------------------------------------------------------------- |
| `rocicorp/drizzle-zero` | `main` at `7fd3817` | `0xcadams/zero-1.10` | `0.20.0`         | `0.21.0`       | [Draft #295](https://github.com/rocicorp/drizzle-zero/pull/295); canary.13 validation passes; current-head rerun pending |
| `rocicorp/prisma-zero`  | `main` at `acc39f1` | `0xcadams/zero-1.10` | `0.2.1`          | `0.3.0`        | [Draft #23](https://github.com/rocicorp/prisma-zero/pull/23); canary.13 validation passes; current-head rerun pending  |

The existing `0xcadams/zero-1.9` branches are superseded rather than merged.

## Feature Coverage

Both adapters now generate Zero unique-key metadata from their ORM schema
declarations. Coverage includes single-column, compound, multiple, nullable,
mapped, duplicate, primary-key-overlap, and unsupported-column cases.

`drizzle-zero` reads column-level unique declarations, table unique
constraints, and unconditional column-only unique indexes. It excludes regular,
partial, expression, duplicate, primary-key, omitted-column, unsupported-column,
and physically remapped override keys. Generated `as const` schemas preserve
literal unique tuples for scalar-subquery typing; direct `drizzleZeroConfig()`
schemas expose runtime metadata without claiming literal tuple inference.

`prisma-zero` reads `@unique`, `@@unique`, and their Prisma DMMF index metadata,
deduplicates overlapping DMMF representations, and emits one `.unique(...)`
chain per key.

Generated type tests prove that `{scalar: true}` accepts complete single and
compound unique keys and rejects incomplete compound and non-unique keys.

## Automated Results

### Zero source delta

- #6459 source PR checks: PASS, all 28 checks.
- Focused no-PG change-source regression at `14a1c8eb4`: PASS, 1 file and 3
  tests.
- #6460 revert verification: PASS; the current tree exactly matches the
  #6459-only commit `131870e56`.

### drizzle-zero

- Install and lockfile generation: PASS with pnpm 11.3.0.
- Format, typecheck, type-aware lint, and build: PASS.
- Unit suite: PASS, 20 files and 671 tests with no type errors.
- Configured integration: PASS, 9 tests; 1 pre-existing test skipped.
- No-config integration: PASS, 9 tests; 1 pre-existing test skipped.
- Zero container: PASS with `rocicorp/zero:1.10.0-canary.13`.
- Generated schemas: PASS for configured and no-config modes.
- Package dry run: PASS for `drizzle-zero@0.21.0`, 8 files, 41.1 kB packed.
- Diff whitespace check: PASS.
- Existing peer warnings remain among Vitest, oxlint-tsgolint, tsconfck, and
  TypeScript versions; no new Zero or Drizzle peer warning was reported.

### prisma-zero

- Install and lockfile generation: PASS with pnpm 11.1.3.
- Format, typecheck, build, and type-aware lint: PASS; lint retains one
  pre-existing warning.
- Unit suite: PASS, 10 files and 266 tests with no type errors.
- Prisma generation and integration TypeScript build: PASS.
- Generated migration SQL: unchanged.
- Package dry run: PASS for `prisma-zero@0.3.0`, 7 files, 12.5 kB packed.
- Diff whitespace check: PASS.
- Existing `tsconfck` versus TypeScript 6 peer warning remains; no new Zero peer
  warning was reported.

## Current-Head Candidate

Before staging the stable release:

1. Finish release workflow `33685579981` and confirm the replacement canary is
   a version-only child of `14a1c8eb4846b92948a8006cec8b331612085288`.
2. Verify npm provenance and matching Docker Hub/GHCR multi-architecture image
   digests.
3. Replace canary.13 development pins and the Drizzle Docker tag with the exact
   replacement canary.
4. Rerun the adapter checks above and the focused #6459 backfill regression.

Canary.15 must not be used for release validation because it contains #6460,
which was removed from the maintenance branch as unstable.

## Stable Finalization

Before either adapter is merged or published:

1. Confirm `@rocicorp/zero@1.10.0` and `rocicorp/zero:1.10.0` are published.
2. Replace canary.13 development pins and the Drizzle Docker tag with exact
   stable `1.10.0`.
3. Regenerate lockfiles and checked-in schemas.
4. Rerun format, lint, typecheck, unit, integration, build, and package checks.
5. Merge both branches to `main` and dispatch each repository's release
   workflow.
6. Verify npm provenance and install the published `drizzle-zero@0.21.0` and
   `prisma-zero@0.3.0` packages with exact Zero 1.10.0 in clean consumers.

The replacement current-head canary and its validation are the remaining
prerelease gates. No adapter package has been published; both adapter pull
requests remain drafts.
