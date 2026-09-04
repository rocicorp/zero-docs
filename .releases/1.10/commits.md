# Zero 1.10 Release Audit

Status: The base audit was human-approved on 2026-08-24. The Zero 1.10
maintenance delta is audited through signed commit `14a1c8eb4`. #6459 is the
only net new behavior after `4c3f256ae`; unstable #6460 was reverted, and the
current tree exactly matches the #6459-only commit `131870e56`. Canary.15
contains #6460 and is rejected. A replacement current-head canary and runtime
smoke are pending. Re-audit the final tag before publication.

## Release Source

| Item                            | Value                                              |
| ------------------------------- | -------------------------------------------------- |
| Release                         | Zero 1.10.0                                        |
| Previous ref                    | `zero/v1.9.0`                                      |
| Previous SHA                    | `7fb31b033738535c31d83ef476e57771b792474c`         |
| Target ref                      | `maint/zero/v1.10` snapshot selected on 2026-08-24 |
| Target SHA                      | `23da5f1cbb8a3a5dc3101517b1d32bf2a842809c`         |
| Current maintenance head        | `14a1c8eb4846b92948a8006cec8b331612085288`         |
| Latest published canary         | `zero/v1.10.0-canary.15`, rejected                 |
| Latest published canary SHA     | `2c6f76e2a8860eeefa34fc50324b062e987a65fa`         |
| Canary source parent            | `fb9195c1100c86bb19aaa113080378c7f7f47b73`         |
| Replacement release workflow    | `33685579981`, in progress                         |
| Rejected npm integrity          | `sha512-ZXRFaLDc...EiWCjPCllYSdnQ==`               |
| Rejected OCI index digest       | `sha256:4804df1cea067172...b543a05ecb5123c6`       |
| #6406 backport                  | `2c6020486`, from `dbc9dbeeb`                      |
| #6407 backport                  | `73ed80837`, from `dd08ad3f9`                      |
| #6409 backport                  | `d9d23d3c7`, from `9de6ff3b4`                      |
| #6410 backport                  | `1b2f16bd5`, from `49f4f4579`                      |
| #6412 backport                  | `113d50a66`, from `72a869618`                      |
| #6418 backport                  | `ba2274cfd`, from `310d01b28`                      |
| #6408 maintenance commit        | `ad38f6d82`, from `0df3a76ee`                      |
| #6419 maintenance commit        | `15e4d4f4d`, from `bd4aedf50`                      |
| #6420 maintenance commit        | `928e9161a`, from `a0a67e8fb`                      |
| #6425 maintenance commit        | `9175ccfa1`, from `ac5eb2311`                      |
| #6426 maintenance commit        | `aa6887490`, from `c725aa39d`                      |
| #6427 backport                  | `0d4d58be1`, from `ed6ca267e`                      |
| #6428 backport                  | `6a1b81de9`, from `b1da23cef`                      |
| #6439 backport                  | `e27876dba`, from `ab3264e75`                      |
| #6440 backport                  | `374b2fbf5`, from `9eb703fb7`                      |
| #6445 backport                  | `0d3ffbbce`, from `639dc8d34`                      |
| #6447 backport                  | `78cd0c3d6`, from `a472f2d1a`                      |
| #6451 backport                  | `81d272502`, from `cc518e15f`                      |
| #6452 backport                  | `bc8594d7e`, from `cf6367dab`                      |
| #6453 backport                  | `3f26c8bb8`, from `93c9bbe0e`                      |
| #6454 backport                  | `da656a43b`, from `9be1864a4`                      |
| Inspector cleanup follow-up     | `4c3f256ae`, maintenance-only                      |
| #6459 backport                  | `131870e56`, from `8814a075c`                      |
| #6460 backport                  | `fb9195c11`, from `b127f3218`                      |
| #6460 revert                    | `14a1c8eb4`, returns to the #6459-only tree        |
| Merge base                      | `ef892a123a11461e74a59a4b59ad310ba23180b3`         |
| Mono repository                 | `/Users/chase/git/roci/mono`                       |
| Mono origin                     | `git@github.com:rocicorp/mono.git`                 |
| Docs repository                 | `/Users/chase/.worktree/zero-docs/0.10`            |
| Raw target range                | 141 commits, all non-merge                         |
| Previous-only maintenance range | 39 commits, all non-merge                          |

No stable `zero/v1.10.0` tag existed when this audit was created. The target is
the exact SHA above, not the moving maintenance branch. If the stable tag
differs, every additional or removed commit must be audited before publication.

Canary.13 is a version-only child of `4c3f256ae` and supplied the adapter test
artifact. Canary.14 is a version-only child of `131870e56` and includes #6459.
Canary.15 is a version-only child of `fb9195c11`; it contains unstable #6460 and
is rejected. Signed commit `14a1c8eb4` reverts #6460 and has the same tree as
`131870e56`. The next candidate must be a version-only child of `14a1c8eb4`.

Commands used:

```bash
git remote -v
git rev-parse 'zero/v1.9.0^{commit}' '23da5f1cbb8a3a5dc3101517b1d32bf2a842809c^{commit}'
git merge-base zero/v1.9.0 23da5f1cbb8a3a5dc3101517b1d32bf2a842809c
git rev-list --left-right --count zero/v1.9.0...23da5f1cbb8a3a5dc3101517b1d32bf2a842809c
git log --reverse --oneline --no-merges zero/v1.9.0..23da5f1cbb8a3a5dc3101517b1d32bf2a842809c
git log --right-only --no-merges --cherry-mark --format='%m%x09%h%x09%s' zero/v1.9.0...23da5f1cbb8a3a5dc3101517b1d32bf2a842809c
git cherry -v zero/v1.9.0 23da5f1cbb8a3a5dc3101517b1d32bf2a842809c
git log ef892a123a11461e74a59a4b59ad310ba23180b3..zero/v1.9.0 --format='%H%n%B'
git diff zero/v1.9.0 23da5f1cbb8a3a5dc3101517b1d32bf2a842809c
git log --reverse --oneline 23da5f1cbb8a3a5dc3101517b1d32bf2a842809c..14a1c8eb4846b92948a8006cec8b331612085288
git show <main-commit> --pretty=format: | git patch-id --stable
git show <maintenance-commit> --pretty=format: | git patch-id --stable
git diff --exit-code 131870e5617931499135ba63e4922dee525a7831 14a1c8eb4846b92948a8006cec8b331612085288
git ls-remote --tags origin 'refs/tags/zero/v1.10.0-canary.*'
```

## Protocol Compatibility

| Protocol                             | Zero 1.9 |  Target | Result                             |
| ------------------------------------ | -------: | ------: | ---------------------------------- |
| Public sync `PROTOCOL_VERSION`       |       51 |      52 | Compatible version branch retained |
| `MIN_SERVER_SUPPORTED_SYNC_PROTOCOL` |       30 |      30 | Compatible                         |
| RM/view-syncer current protocol      |        6 |       6 | Compatible                         |
| RM/view-syncer minimum protocol      |        1 |       4 | Zero 1.9 sends 6                   |
| Emitted DDL protocol                 |        1 |       1 | Compatible                         |
| Accepted DDL protocol                |  1 and 2 | 1 and 2 | Compatible                         |

Result: **PASS**. The target minimum supported sync protocol, 30, is less
than or equal to the previous release's protocol, 51. Protocol 52 clients use
bounded binary poke chunks, while the target server retains JSON `pokePart`
messages for protocol 51 and older clients. Deploy 1.10 servers before 1.10
clients; a 1.10 client cannot connect to a rolled-back 1.9 server. The final tree
delta through `14a1c8eb4` does not change protocol constants or wire schemas.

## Backport Detection

The release refs diverged at the merge base. The raw target range contains 38
changes that were already shipped from the 1.9 maintenance branch:

- 24 target commits are stable-patch-ID equivalent to a 1.9-side commit and
  are marked `-` by `git cherry`.
- 14 target commits have `cherry picked from` evidence and equivalent public
  behavior adapted to the 1.9 code shape.
- Two of those 14 name rewritten source objects. `25ece7f96` and source
  `3f196851b` share a parent, tree, and stable patch ID; `6454b307a` and source
  `f19a09590` do as well.
- The unmatched 1.9-side commit, `342fc33d5`, is test-only adaptation for the
  #6338 backport.

Count reconciliation: `141 = 24 exact backports + 14 adapted backports + 103
target-only commits`.

## Breaking-Change Review

All `MAYBE` classifications are resolved.

| Area                       | Finding                                                                                                                                                                        | Migration or resolution                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scalar query typing        | **UPGRADE NOTE.** Invalid or ineffective `scalar: true` calls that previously typechecked now fail compilation.                                                                | Remove `scalar: true`, constrain every column of a primary key, or declare and constrain a real upstream unique key with `.unique(...)`. Only literal equality predicates prove uniqueness.                      |
| Flow-control configuration | **UPGRADE NOTE.** `ZERO_CHANGE_STREAMER_FLOW_CONTROL_CONSENSUS_PADDING_SECONDS` is removed.                                                                                    | Configure `ZERO_CHANGE_STREAMER_FLOW_CONTROL_CONSENSUS_TIMEOUT_PROPORTION`; it is a ratio, not a unit conversion. The default is `2`. Set the new slow-subscriber grace period to `0` to disable forced resets.  |
| ChangeDB connections       | **BREAKING for constrained pools.** `ZERO_CHANGE_MAX_CONNS` is hidden, deprecated, and no longer controls usage; view-syncer catch-up connections are dynamic.                 | Allow at least five ChangeDB connections plus one per view-syncer. Remove reliance on `ZERO_CHANGE_MAX_CONNS` as a connection cap.                                                                               |
| Very old upstream state    | **BREAKING for ancient deployments.** Direct migration from pre-February-2025 upstream shard metadata older than schema v6 is removed.                                         | Upgrade through Zero 1.9 first, or recreate/resync the Zero replica and shard metadata. Metadata already at v6 is supported.                                                                                     |
| Docker source builds       | **BREAKING for direct Dockerfile consumers.** The Dockerfile now requires a named `monogo` build context.                                                                      | Use `docker buildx build --build-context monogo=./go packages/zero`. Official images are unaffected.                                                                                                             |
| Backup readiness           | After initial sync or a change to the destination backup path, a replication manager waits for its first recoverable backup before reporting ready or starting takeover delay. | Ensure startup-probe budgets cover initial sync and the first backup upload. Treat failure to become ready as a backup configuration or storage failure.                                                         |
| Backup defaults            | Legacy incremental backups change from every 15 minutes to every 5 minutes; snapshots change from every 12 hours to every 4 hours.                                             | Set explicit intervals to retain the old storage and I/O profile. The new defaults reduce restart catch-up distance.                                                                                             |
| Litestream v5 backup       | New and opt-in. Replica-specific backup paths are not readable by Zero 1.9's old path selection.                                                                               | Keep v5 backup disabled when immediate rollback to 1.9 is required, or expect rollback to perform a full resync. Apply an object-store lifecycle policy because old replica paths are not automatically removed. |
| Persisted data             | Replica schema 13 -> 17 and upstream shard schema 23 -> 25 are additive/internal and have no new rollback floor for 1.9.                                                       | No application-data migration is required. The sidecar SQLite change log is disposable and off by default.                                                                                                       |
| Public API and exports     | `.unique(...)`, optional `uniqueKeys`, and an internal/defaulted query generic are additive. No package export is removed.                                                     | No migration except for invalid `scalar: true` usage described above.                                                                                                                                            |
| Dependencies               | Node remains `>=22`; the published Zero package has no net consumer dependency or peer-dependency change from 1.9.                                                             | No application install migration. Custom image and Litestream operators must follow the Docker and backup guidance above.                                                                                        |

The user explicitly excluded the apparent `vfs-query` executable validation
defect from this release audit because it will be fixed separately.

## Approved Public Selection

Human review approved the base selection on 2026-08-24. The latest maintenance
additions were reviewed and their documentation implementation was requested on
2026-09-01. The #6459 addition and #6460 omission were directed on 2026-09-02.

### Features and Operator Changes

- Type-safe scalar subqueries and `.unique(...)` schema declarations (#6307),
  with upgrade guidance.
- Protocol-52 binary poke chunks bound large result delivery to 1 MiB frames
  while retaining the old protocol for older clients (#6328).
- Event-driven proportional replication flow control, reset of chronically
  slow serving subscribers, and backup-replica participation after catch-up
  (#6357, #6358, and #6451), including the configuration migration.
- Backup readiness, more frequent legacy backups, and opt-in Litestream v5
  backup with replica-specific paths and VFS recovery (#6313, #6319, #6368,
  #6369, #6394, #6395, #6401, #6402, and #6403).

### Fixes

- Complex flipped and limited relationship queries no longer lose updates or
  prune optimistic overlay rows with the wrong order (#6380 and #6381).
- PostgreSQL nullability-only changes no longer rebuild SQLite tables and
  indexes (#6309).
- Temporary backfill slots no longer remain orphaned and retain WAL after a
  failed backfill (#6335).
- Stalled WebSocket sends fail rather than blocking a client pipeline forever
  (#6329).
- Concurrent first connections for one client group no longer race while
  initializing CVR state (#6389).
- Permission-check, CRUD SQL, custom-query transformation, and PostgreSQL
  notice logs omit the app-data fields removed by #6390.
- Historical lag reports and unaffected client groups no longer inflate
  replication and serving-lag metrics (#6279 and #6367).
- The bundled legacy Litestream includes SQLite's WAL-reset fix (#6359).
- Change-database operations recover instead of hanging indefinitely on an
  orphaned or half-open connection (#6419).
- Legacy Litestream reads watermarks correctly from database pages beyond
  32-bit file offsets, and invalid values are ignored so a later valid
  watermark can be processed (#6425 and #6428).
- Large SQLite replicas use bounded optimization work instead of a full
  `ANALYZE` during schema migration startup (#6426).
- A failed initial sync no longer leaves a partial SQLite file at the canonical
  replica path that can prevent backup restore after restart (#6427).
- Backfills remain live during long copies, ignore unrelated non-transactional
  lag reports without pausing, correctly include pre-existing rows after
  Supabase publication hooks, yield replica access between batches, and refresh
  query pipelines before later writes (#6439, #6440, #6453, #6454, and #6459).
- Concurrent ChangeDB operations use isolated PostgreSQL connections instead of
  risking hung or combined transactions (#6445), with connection-capacity
  migration guidance.
- Inspector errors retain the server message and server-side analysis accepts
  `NOT EXISTS` without enabling client execution (#6447 and `4c3f256ae`).
- Backup replicas are exempt from laggard disconnection, and change-streamer
  errors preserve replicas for startup validation (#6451 and #6452).

### Intentional Omissions

- All 38 changes already shipped in Zero 1.9.
- The RMv2 SQLite change-log sequence because the default remains `off`; its
  compare, serve, and cold-read paths are hidden rollout mechanisms.
- zbugs/sample changes, CI and release automation, tests, benchmarks, internal
  diagnostics, and telemetry without a supported operator workflow.
- Reverted, superseded, and in-range regression-repair commits whose endpoint
  behavior only preserves the previous release's contract.
- Unstable partial-index support from #6460, which is fully reverted before the
  release and is not a Zero 1.10 capability.
- Minor unbenchmarked performance candidates such as Replicache index elision,
  serialization reuse, one avoided `sqlite_master` lookup, and backfill
  transaction batching.
- Internal details of the latest fixes: the backfill batch threshold, COPY and
  TCP keepalive mechanics, postgres.js pool structure, consensus bookkeeping,
  and replica file-handle behavior.

## Performance Candidates

No public performance claim is currently approved, and no release benchmark
has been run for 1.10.

- #6309 can be explained as avoiding a table rebuild without quantifying
  latency or memory. Its tests establish the behavioral boundary.
- #6357/#6358 would require an end-to-end multi-subscriber replication workload
  measuring healthy-subscriber throughput, lag, and reset behavior.
- #6328 would require complete client materialization and peak-memory
  measurements through a production-equivalent WebSocket path; frame size
  alone does not substantiate a speed claim.
- RMv2 benchmark results are excluded because the path is disabled by default.
- #6453 is a fairness and reliability fix. Do not claim faster backfills without
  an end-to-end benchmark covering the complete backfill lifecycle.
- #6237 and #6292 performance work was already shipped and documented in 1.9.

If human review requests a performance section, use `benchmark-compare`, exact
release SHAs, equivalent benchmark definitions, and normally ten
process-isolated runs per ref. Save commands, raw results, aggregates, and
environment details under `.releases/1.10/benchmarks/`.

## Required Product Documentation

- `contents/docs/zql.mdx`: scalar uniqueness requirements and fallback
  behavior for callers that bypass types.
- `contents/docs/schema.mdx`: `.unique(...)`, compound keys, and the fact that
  the declaration does not create a database constraint.
- `contents/docs/zero-cache-config.mdx`: proportional flow control,
  slow-subscriber grace period, changed backup defaults, and v5 backup/VFS
  settings. Remove the old consensus-padding setting, deprecate
  `ZERO_CHANGE_MAX_CONNS`, document ChangeDB capacity, and describe the backup
  exception to laggard handling.
- `contents/docs/self-host.mdx`: server-first rollout, first-backup readiness,
  v5 rollback and object-store lifecycle guidance, and the named Docker build
  context. Add ChangeDB connection sizing and startup replica validation.
- `contents/docs/otel.mdx`: historical-lag suppression, serving-lag
  corrections, and slow-subscriber interpretation.
- `contents/docs/debug/replication.mdx`: temporary backfill slots, backup/VFS
  recovery, and reduced application-data logging where relevant.
- `contents/docs/connecting-to-postgres.mdx`: change-database progress
  monitoring replaces the obsolete wire-activity watchdog description. Schema
  hooks backfill rows that predate publication.
- `contents/docs/debug/inspector.mdx` and
  `contents/docs/debug/analyze-query-cli.mdx`: server-side `NOT EXISTS` analysis,
  client-execution scope, and surfaced server errors.
- `contents/docs/release-notes/1.10.mdx` and
  `contents/docs/release-notes/index.mdx` after this audit is approved.
- `assets/search-index.json` after public and product documentation changes.

## Smoke Testing and Handoff

- **Backported before release:** #6406 (`2c6020486`) corrects validation of the
  v5 VFS executable, and #6407 (`73ed80837`) prevents bundled Litestream
  executables from enabling restore in single-node mode. The canary.3 image
  failed no-backup startup with `backups are not configured`; a source-built
  arm64 image containing the #6407 patch reached readiness and replicated from
  Postgres with both executable variables present and no backup URL. On the
  maintenance branch, all 13 focused normalization tests and all 11 focused
  PostgreSQL 16 integration scenarios pass.
- #6409 (`d9d23d3c7`) streams Litestream restore output as it arrives, #6410
  (`1b2f16bd5`) builds the v5 executable from the Rocicorp fork, and #6418
  (`ba2274cfd`) updates that fork with the compaction serialization fix. All 25
  focused Litestream command tests pass; the changed Docker stage builds
  successfully and its executable reports `0.5.17-zero.2`.
- #6412 (`113d50a66`) lets fleet-wide hidden SQLite change-log settings reach
  view-syncers without preventing startup. Formatting, types, lint, and all 18
  focused normalization tests pass on the maintenance branch.
- #6408 (`ad38f6d82`), #6419 (`15e4d4f4d`), and #6420 (`928e9161a`) ensure
  flow-control waits terminate and replace the low-level query watchdog with a
  progress monitor for the main change-streamer and storer loops.
- #6425 (`9175ccfa1`) ignores transient invalid watermarks from legacy
  Litestream metrics, and #6426 (`aa6887490`) replaces a potentially
  long-running SQLite `ANALYZE` with bounded `PRAGMA optimize`. The full no-PG
  suite passed at `aa6887490`: 132 files and 1,962 tests.
- #6427 is cherry-picked as `0d4d58be1` from main `ed6ca267e`. Fresh initial
  sync runs against a temporary SQLite file and publishes it atomically only
  after setup succeeds, so a failed attempt cannot block backup restore on
  restart. The full no-PG suite passes at this head: 132 files and 1,963 tests.
  Zero Cache formatting and TypeScript checks also pass.
- #6428 is cherry-picked as `6a1b81de9` from main `b1da23cef`. The legacy
  Litestream stage builds successfully from `v0.3.13-zero.11`, and the packaged
  executable reports `0.3.13-zero.11`.
- #6439 through #6454 are audited maintenance backports. The source checks
  at signed head `4c3f256ae` pass: Zero Client 40 files and 650 tests; Zero Cache
  no-PG 132 files and 1,973 tests; and PostgreSQL 16 52 files and 724 tests, with
  one file and nine tests skipped. Package formatting, TypeScript, and lint
  complete with no errors. The first full PostgreSQL run had one auto-discovery
  timeout; its isolated rerun and the complete rerun passed.
- #6459 is patch-equivalent to main `8814a075c`; its focused regression proves
  a foreign-shard lag report cannot pause an active backfill. All 28 source PR
  checks passed. Signed head `14a1c8eb4` reverts unstable #6460 and has exactly
  the same tree as the #6459-only commit `131870e56`.
- React and Solid starter builds pass with the exact canary. The Cloudflare
  starter's full `check` passes; its plain build has the same nominal Postgres
  type conflict on the 1.8 baseline, so it is not a 1.10 regression.
- Prisma generation, type checks, unit tests, and integration tests pass.
  Drizzle also passes after unifying its workspace's two Postgres dependency
  resolutions; that fixture issue is not a Zero API incompatibility.
- Docker Hub and GHCR publish matching multi-architecture images. The arm64
  image, Zero CLI tools, both Litestream binaries, and `vfs-query` help all run
  without loader or architecture failures.
- A real v5 file-backed drill passed. Readiness remained closed until the first
  LTX backup was confirmed, a later transaction produced a new backup
  watermark, and a fresh replica volume restored both rows from the recorded
  replica-specific path. V5 folder URLs must end in `/` so relative replica
  paths remain below the configured prefix.
- Rollback to the published 1.9 image with a fresh replica volume passed. The
  old server could not find the replica-specific v5 backup, logged the expected
  restore failure, performed a full resync from Postgres, and served both rows.
- Killing the real `vfs-query` process while a transaction was behind produced
  the expected warning and two-second retry; the replacement process confirmed
  the backup watermark and zero-cache remained ready.
- Server-first rollout passed with published artifacts: a 1.9 client queried
  and mutated through canary.3. The reverse pairing returned the expected
  `VersionNotSupported` response and used controlled exponential reload
  backoff without server restarts or writes.

## Commit Audit

| Commit              | Category    | Breaking? | Public impact                                                                                                                       | Decision and evidence                                                                                                                       |
| ------------------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `d87c1c813` (#6230) | skip        | -         | Version metadata only.                                                                                                              | Skip. Changes the development package version to 1.10.                                                                                      |
| `950b15f7a` (#6231) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `7546a1f79`; fixes duplicate `@rocicorp/zero` installations caused by optional integration peers.                    |
| `7da45c558` (#6195) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `d29624c0c`; accepts context-only DDL-v2 starts without emitting them.                                               |
| `bde5ed6f0` (#6215) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `ca2762da2`; adds SQLite-corruption diagnostics and tests.                                                           |
| `69055b17a` (#6225) | skip        | -         | Already shipped in 1.9; test coverage only in this commit.                                                                          | Skip as exact backport `a4075b077`; adds the compound-index reorder reproduction.                                                           |
| `2ca567a2a` (#6235) | skip        | -         | Already shipped benchmark infrastructure.                                                                                           | Skip as exact backport `d111bcc2e`; adds deterministic initial-sync and COPY fixtures.                                                      |
| `ea459443f` (#6237) | skip        | -         | Already shipped initial-sync metric batching.                                                                                       | Skip as exact backport `7e2957cfd`; batches OpenTelemetry updates in 8 MiB increments.                                                      |
| `ad8d4a9ef` (#6239) | skip        | -         | No runtime change.                                                                                                                  | Skip. Adds resolved declaration snapshots for the public package surface.                                                                   |
| `04a3bbcdd` (#6241) | skip        | -         | zbugs sample application only.                                                                                                      | Skip. Changes only the zbugs comment UI.                                                                                                    |
| `6e34c95a7` (#6236) | skip        | -         | Internal initial-sync diagnostics.                                                                                                  | Skip. Adds source-wait and processing timings to per-table logs.                                                                            |
| `bc1db665f` (#6242) | skip        | -         | Benchmark cleanup only.                                                                                                             | Skip. Removes unrealistic fragmented-COPY benchmark profiles.                                                                               |
| `c53607643` (#6245) | skip        | -         | Already shipped and later superseded in 1.9.                                                                                        | Skip as exact backport `db394cf47`; #6267 removes this restore-classification workaround.                                                   |
| `9e686a48b` (#6244) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `0e3a0bffe`; treats `wal_sender_timeout=0` as disabled.                                                              |
| `32a0b6fc2` (#6248) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `299e4c97f`; expected auto-reset signals log at warning level.                                                       |
| `2a9bee3d8` (#6240) | skip        | -         | No final default behavior by itself.                                                                                                | Skip as staged flow-control work; its flag defaults false and #6357 supplies the final behavior.                                            |
| `461ce78cd` (#6246) | skip        | -         | CI and repository tooling only.                                                                                                     | Skip. Updates actions and development pnpm metadata.                                                                                        |
| `4192e4407` (#6251) | skip        | -         | Already shipped duplicate-primary-key insert behavior.                                                                              | Skip as exact backport `94938a65e`; both CRUD paths use `ON CONFLICT` for Zero primary keys.                                                |
| `859b5906e` (#6253) | skip        | -         | zbugs service only.                                                                                                                 | Skip. Adds the issue tracker's machine-readable Markdown endpoint.                                                                          |
| `d6f881b1b` (#6252) | skip        | -         | Internal telemetry only.                                                                                                            | Skip. Measures shared-pipeline eligibility without changing product behavior.                                                               |
| `5ea4f33bb` (#6259) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `5d8efe2f7`; avoids restore work without Litestream.                                                                 |
| `7690172ae` (#6260) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `5cd162213`; v5 restore support shipped before v5 backup.                                                            |
| `7af01d6c7` (#6254) | skip        | -         | Benchmark only.                                                                                                                     | Skip. Updates the RMv2 throughput ceiling fixture.                                                                                          |
| `7cf0cea06` (#6255) | skip        | -         | Internal RMv2 refactor.                                                                                                             | Skip. Extracts a shared change-log codec without changing payloads.                                                                         |
| `3336d0905` (#6256) | skip        | -         | Hidden RMv2 storage preparation.                                                                                                    | Skip. Adds an inert SQLite stream-log table while PostgreSQL remains authoritative.                                                         |
| `d459955eb` (#6257) | skip        | -         | Internal RMv2 plumbing.                                                                                                             | Skip. Passes serialized data to a worker that intentionally ignores it in this slice.                                                       |
| `449ed1311` (#6266) | skip        | -         | Refactor only in final range state.                                                                                                 | Skip. Moves purge-lock ownership; #6282 repairs the in-range auto-reset regression.                                                         |
| `6bc268ff9` (#6267) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `46f64921c`; corrects Litestream snapshot retention.                                                                 |
| `02e1edff6` (#6268) | skip        | -         | Internal restore refactor.                                                                                                          | Skip. Separates restore paths; #6274 repairs its in-range view-syncer regression.                                                           |
| `88b391c1d` (#6270) | skip        | -         | Test isolation only.                                                                                                                | Skip. Cleans IndexedDB created by a Replicache worker test.                                                                                 |
| `99bdb1b9c` (#6269) | skip        | -         | CI only.                                                                                                                            | Skip. Adds a timeout around Playwright installation.                                                                                        |
| `9d27505cb` (#6261) | performance | -         | Avoids unnecessary Replicache index work when no indexes exist.                                                                     | Intentionally omit. There is no release-quality workload measurement or material Zero-level claim.                                          |
| `b7aa4eee7` (#6271) | performance | -         | Reports an 8.4 KB smaller core bundle and possible minor speedup.                                                                   | Intentionally omit. Build flags and speculative speed impact are not release-quality evidence.                                              |
| `14567b6e1` (#6262) | performance | -         | Removes redundant serialization in replicators.                                                                                     | Intentionally omit. Protocol behavior is unchanged and no end-to-end result is available.                                                   |
| `9448caae2` (#6258) | skip        | -         | Hidden RMv2 shadow writer.                                                                                                          | Skip. `sqliteChangeLogMode=off` by default.                                                                                                 |
| `d4de72b4d` (#6263) | skip        | -         | Internal rollout telemetry.                                                                                                         | Skip. Metrics apply only to hidden SQLite shadow writes.                                                                                    |
| `a345fadd5` (#6264) | skip        | -         | Hidden RMv2 reader.                                                                                                                 | Skip. The reader is inert in production.                                                                                                    |
| `9b765e0db` (#6274) | skip        | -         | Repairs an in-range regression.                                                                                                     | Skip. Restores the pre-#6268 view-syncer restore condition.                                                                                 |
| `6a8aaf4ed` (#6275) | skip        | -         | Benchmark infrastructure only.                                                                                                      | Skip. Adds a PostgreSQL-backed backfill benchmark.                                                                                          |
| `9604f33bc` (#6272) | skip        | -         | Hidden SQLite catch-up implementation.                                                                                              | Skip. The path is off and its `shouldUse` decision is not wired.                                                                            |
| `645aa8265` (#6276) | skip        | -         | Benchmark and design evidence only.                                                                                                 | Skip. Measures combined versus sidecar change-log layouts.                                                                                  |
| `05892f154` (#6279) | fix         | -         | Prevents replayed historical replication-lag reports from appearing as fresh spikes after restart.                                  | Propose public inclusion with #6367. Source and service tests cover the filter.                                                             |
| `186aa683e` (#6277) | skip        | -         | Hidden RMv2 startup reconciliation.                                                                                                 | Skip. Applies only to the disabled SQLite log path.                                                                                         |
| `4391788c6` (#6281) | skip        | -         | Internal diagnostic logging.                                                                                                        | Skip. Adds subscriber catch-up logs without behavior changes.                                                                               |
| `6e8137836` (#6282) | skip        | -         | Repairs an in-range regression.                                                                                                     | Skip. Restores auto-reset after #6266 by releasing the purge lock before initial sync.                                                      |
| `b84e25882` (#6278) | skip        | -         | Hidden RMv2 reader refactor.                                                                                                        | Skip. Retargets the disabled reader to a sidecar database.                                                                                  |
| `e8decd932` (#6283) | skip        | -         | Hidden RMv2 writer refactor.                                                                                                        | Skip. Sidecar writes remain disabled by default.                                                                                            |
| `3dcaaf2a4` (#6284) | skip        | -         | No production path.                                                                                                                 | Skip. The SQLite catch-up decision remains unwired.                                                                                         |
| `8b9f940a0` (#6285) | skip        | -         | Internal sidecar lifecycle management.                                                                                              | Skip. Keeps hidden change-log files aligned with replica operations.                                                                        |
| `50e16a5f2` (#6289) | feature     | BREAKING  | Adds replica-specific backup-path compatibility and removes in-place migration from pre-February-2025 shard metadata older than v6. | Include backup paths in the v5 cluster. Ancient deployments must upgrade through Zero 1.9 or resync; metadata already at v6 is supported.   |
| `b4190eb24` (#6290) | skip        | -         | Internal schema invariant.                                                                                                          | Skip. Makes hidden change-log `writeTimeMs` non-null.                                                                                       |
| `46af51cd4` (#6286) | skip        | -         | Hidden RMv2 storage cleanup.                                                                                                        | Skip. Removes the abandoned in-replica change-log table.                                                                                    |
| `e10fea327` (#6287) | skip        | -         | Hidden rollout observability.                                                                                                       | Skip. Metrics apply to the disabled SQLite change log.                                                                                      |
| `6372b4144` (#6293) | skip        | -         | Hidden RMv2 refactor.                                                                                                               | Skip. Production effect is none while `sqliteChangeLogMode=off`.                                                                            |
| `55b9865f7` (#6297) | skip        | -         | Internal worker protocol floor only.                                                                                                | Skip. Raises the minimum to protocol 4; Zero 1.9 uses protocol 6.                                                                           |
| `eaa4a6a71` (#6294) | skip        | -         | Hidden RMv2 purger.                                                                                                                 | Skip. Disk-bounds non-default SQLite modes.                                                                                                 |
| `a8b03c754` (#6298) | skip        | -         | Internal RMv2 ownership refactor.                                                                                                   | Skip. Moves backup watermark and snapshot tracking into the change-streamer.                                                                |
| `257606585` (#6300) | skip        | -         | Rollout safety only.                                                                                                                | Skip. Defers writes to replica-specific paths until reader support has shipped.                                                             |
| `e7d6662c1` (#6299) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `7e0436c38`; bounds the complete client connection attempt.                                                          |
| `5b556c8b8` (#6280) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `49b13e3e5`; avoids primary-key update locks in CRUD.                                                                |
| `d18eafdb3` (#6301) | skip        | -         | Already shipped documentation correction.                                                                                           | Skip as exact backport `855935f86`; JSDoc-only correction for `run`.                                                                        |
| `97a40b0f5` (#6295) | skip        | -         | Hidden RMv2 scheduler.                                                                                                              | Skip. Schedules purging only for non-off SQLite modes.                                                                                      |
| `ac745bd97` (#6306) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `43d2c0b8a`; fixes invalid scalar compilation.                                                                       |
| `8d5929db3` (#6310) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `27636641c`; applies the postgres.js patch in the image.                                                             |
| `25c2c7308` (#6292) | skip        | -         | Already shipped server-schema performance and correctness improvement.                                                              | Skip as exact backport `67c8fe4c9`; Zero 1.9 already documented the `pg_catalog` implementation.                                            |
| `80d282f41` (#6313) | feature     | -         | After initial sync or a backup-path change, replication managers wait for a recoverable backup before reporting readiness.          | Include in backup reliability. Operators may need longer startup probes.                                                                    |
| `4b6205bbe` (#6307) | fix         | -         | Invalid `scalar: true` calls now fail TypeScript compilation; `.unique()` declares real upstream unique keys for typing.            | Include in Upgrade Notes. Tests reject unpinned, non-unique, non-equality, and junction shapes.                                             |
| `52e9988b1` (#6314) | skip        | -         | Intermediate Litestream dependency update.                                                                                          | Skip as superseded by later official and Rocicorp fork pins. Upstream v0.5.16 was inspected.                                                |
| `76b792f2c` (#6308) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `b48eaf0f1`; reconnects no longer create false slow-query warnings.                                                  |
| `f275cd6ba` (#6316) | skip        | -         | Internal v5/RMv2 durability plumbing.                                                                                               | Skip standalone. Later consumed by opt-in v5 backup.                                                                                        |
| `00ad4fc3c` (#6311) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `6cfd0cf0f`; serving transactions can spill dirty pages.                                                           |
| `285fa1f15` (#6317) | skip        | -         | Test-only timeout adjustment.                                                                                                       | Skip. Changes one purge-scheduler test.                                                                                                     |
| `8e498b2f1` (#6315) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `bb9540345`; retries all API-server 5xx responses.                                                                   |
| `25ece7f96` (#6318) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as rewritten/adapted backport `2c4a3db6b`; diagnostic behavior is equivalent.                                                          |
| `0beb0ba76` (#6312) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `b90e79d8f`; fixes end-to-end lag accounting.                                                                      |
| `26577bfef` (#6319) | performance | -         | Legacy backups run more frequently by default.                                                                                      | Propose operator-facing inclusion without a speed claim. Help text documents lower catch-up work versus higher storage activity.            |
| `df037e805` (#6321) | skip        | -         | Benchmark infrastructure only.                                                                                                      | Skip. Adds cold/warm request benchmarks but no runtime change.                                                                              |
| `b99a4cddb` (#6322) | skip        | -         | Internal RMv2 refactor.                                                                                                             | Skip. Extracts backfill cookie operations for dual implementations.                                                                         |
| `8f7c8e678` (#6323) | skip        | -         | Hidden RMv2 backfill tracking.                                                                                                      | Skip. Persists cookies only for the disabled SQLite change log.                                                                             |
| `e2974513a` (#6326) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `daa5c9a32`; fatal writer errors reach replication status.                                                         |
| `caa0506a3` (#6324) | skip        | -         | Hidden RMv2 reconciliation.                                                                                                         | Skip. Seeds SQLite cookies from the authoritative PostgreSQL log.                                                                           |
| `3bef8d5bb` (#6325) | skip        | -         | Internal replica metadata.                                                                                                          | Skip. Adds backfilling metadata for future PostgreSQL-log retirement.                                                                       |
| `8ffa93114` (#6332) | skip        | -         | Repairs an in-range metrics regression.                                                                                             | Skip standalone. Corrects `backup_lag` after #6313.                                                                                         |
| `dbe075b1b` (#6334) | performance | -         | Avoids one `sqlite_master` lookup in a common metadata path.                                                                        | Intentionally omit. Small internal optimization has no benchmark or developer claim.                                                        |
| `02581a190` (#6335) | fix         | -         | Failed backfills no longer leave logical replication slots that retain WAL.                                                         | Propose public inclusion. PostgreSQL tests assert temporary-slot behavior.                                                                  |
| `648bde8d2` (#6327) | skip        | -         | Hidden RMv2 comparison telemetry.                                                                                                   | Skip. PostgreSQL remains authoritative.                                                                                                     |
| `b92b6d5e0` (#6339) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `2a2972c37`; recognizes extended SQLite corruption codes.                                                            |
| `6454b307a` (#6341) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as rewritten/adapted backport `8223561de`; corruption scans remain opt-in.                                                             |
| `8fb004105` (#6338) | skip        | -         | Already shipped and reverted in 1.9.                                                                                                | Skip. Adapted backport `bd70c07ea` is reversed by #6345 on both branches.                                                                   |
| `480c201a1` (#6329) | fix         | -         | A stalled client WebSocket send can no longer block its pipeline indefinitely.                                                      | Propose public inclusion. Sends fail after ten seconds; tests cover late callbacks.                                                         |
| `62d31bb11` (#6342) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `1a0095a00`; corrupt replica files are deleted before exit.                                                        |
| `7148a047d` (#6343) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `693907a31`; preserves Litestream restore diagnostics.                                                             |
| `976835cf0` (#6345) | skip        | -         | Revert already shipped in 1.9.                                                                                                      | Skip as adapted backport `4540339f9`; reverses #6338 before its replacement.                                                                |
| `25798c0d2` (#6346) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `da9b61778`; safely interrupts flow-control waits on disconnect.                                                   |
| `84284696f` (#6347) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `8ec7364c0`; retries failed Litestream restores.                                                                   |
| `9d4730dc1` (#6348) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `ad0c6dd3f`; distinguishes backpressure from dead PostgreSQL.                                                        |
| `3fa5a6fcb` (#6350) | skip        | -         | Repository ownership only.                                                                                                          | Skip. Adds a lockfile code owner.                                                                                                           |
| `cad1d2f39` (#6349) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `f0d6fbe82`; upgrades zero-sqlite3 to 1.1.4.                                                                       |
| `f3491e728` (#6340) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as exact backport `dcbc14f02`; fixes cross-tab mutation ordering.                                                                      |
| `dcf126e22` (#6352) | skip        | -         | Internal cleanup consistency.                                                                                                       | Skip. Production already aborted these transactions through the main loop.                                                                  |
| `ff9b906fc` (#6336) | skip        | -         | Hidden RMv2 cutover preparation.                                                                                                    | Skip. PostgreSQL remains authoritative by default.                                                                                          |
| `f7f1ef178` (#6351) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport and 1.9 tag commit `7fb31b033`; adds the inbound-timeout override.                                                 |
| `c754fd6b0` (#6355) | skip        | -         | Already shipped in 1.9.                                                                                                             | Skip as adapted backport `2288320e7`; cleans Litestream restore temporary files.                                                            |
| `9a8ca356a` (#6356) | skip        | -         | Release CI only.                                                                                                                    | Skip. Archives exact release source revisions to Cloud Zero storage.                                                                        |
| `06eee9cb4` (#6357) | performance | -         | Replaces fixed consensus padding with event-driven proportional flow control.                                                       | Include in Upgrade Notes without a quantitative claim. The old setting is removed; default proportion is 2.                                 |
| `3a40ea2ff` (#6358) | fix         | -         | Chronically slow or zombie subscribers reset after a default 30-second grace period.                                                | Propose inclusion with #6357. Tests cover response tracking and replica deletion.                                                           |
| `04aea7e43` (#6359) | fix         | -         | Bundled legacy Litestream receives SQLite's WAL-reset fix.                                                                          | Propose backup-reliability inclusion. Upstream Rocicorp PR #17 moves to go-sqlite3 1.14.49 and SQLite 3.53.4.                               |
| `8dba690d2` (#6309) | fix         | -         | `SET/DROP NOT NULL` no longer rebuilds the entire SQLite table and indexes.                                                         | Propose public inclusion. Tests verify metadata updates without storage replacement.                                                        |
| `eb47b3c66` (#6363) | skip        | -         | Superseded v5 dependency wiring.                                                                                                    | Skip. Temporary configurable-polling fork is replaced later.                                                                                |
| `edf802875` (#6364) | skip        | -         | V5 implementation preparation.                                                                                                      | Skip standalone. Adds config and Docker wiring before #6368 activates backup.                                                               |
| `9940e7676` (#6365) | skip        | -         | V5 implementation detail.                                                                                                           | Skip standalone. Passes a polling interval to the interim VFS process.                                                                      |
| `5e4eba484` (#6368) | feature     | -         | Adds opt-in Litestream-v5 replica backups.                                                                                          | Propose public inclusion with rollback caveat. PostgreSQL acknowledgements wait for durable backup progress and paths are replica-specific. |
| `4d550514d` (#6369) | fix         | -         | V3 and v5 Litestream executables can be configured independently.                                                                   | Include only as part of the v5 feature. Tests allow differing executable paths.                                                             |
| `74e397abc` (#6367) | fix         | -         | Serving-lag metrics no longer grow for client groups unaffected by a transaction.                                                   | Propose public inclusion with #6279. Tests cover no-op CVR flushes.                                                                         |
| `b073a4351` (#6372) | skip        | -         | Release CI only.                                                                                                                    | Skip. Pins an immutable Skopeo image.                                                                                                       |
| `26ec8798c` (#6373) | skip        | -         | Hidden RMv2 comparator support.                                                                                                     | Skip. Adds range reads for dark-launch comparisons.                                                                                         |
| `8ef5c8ce8` (#6385) | skip        | -         | Internal preparation.                                                                                                               | Skip. Changes snapshot import queuing for future multi-worker initialization.                                                               |
| `c9562d7cf` (#6386) | skip        | -         | Internal slot-management preparation.                                                                                               | Skip. Reserves initial-sync slots before future cleanup logic.                                                                              |
| `1082a9605` (#6374) | skip        | -         | Hidden RMv2 comparison primitives.                                                                                                  | Skip. Used only by dark-launch comparison.                                                                                                  |
| `ad02582dd` (#6380) | fix         | -         | Complex limited queries with flipped `whereExists` branches no longer drop additions/removals or repeatedly disconnect groups.      | Propose public inclusion. Regression tests cover `UnionFanIn` yield sentinels.                                                              |
| `93e9281d4` (#6376) | skip        | -         | Hidden RMv2 service.                                                                                                                | Skip. The comparator is not constructed in default operation.                                                                               |
| `e66721ac3` (#6377) | skip        | -         | Hidden comparison mode.                                                                                                             | Skip. Wiring runs only with non-default compare mode.                                                                                       |
| `474a27efd` (#6381) | fix         | -         | Flipped limited queries no longer prune optimistic overlay rows using the wrong order.                                              | Propose public inclusion with #6380. A dedicated regression test covers connection-order `startAt`.                                         |
| `33cee6dd3` (#6382) | skip        | -         | Test coverage only.                                                                                                                 | Skip. Extends fuzzer coverage for flip, push, yield, and limit interactions.                                                                |
| `45caf3acb` (#6383) | skip        | -         | Opt-in diagnostic tests only.                                                                                                       | Skip. The sweep harness is disabled in normal CI.                                                                                           |
| `1be1334de` (#6389) | fix         | -         | Concurrent first connections for a new client group cannot both commit conflicting CVR state.                                       | Propose public inclusion. A PostgreSQL test proves one concurrent flush is rejected.                                                        |
| `796ad1f3e` (#6378) | skip        | -         | Hidden RMv2 serve mode.                                                                                                             | Skip. Applies only to non-default SQLite change-log serving.                                                                                |
| `341590823` (#6328) | fix         | -         | Large or wide query results use bounded chunks instead of arbitrarily large WebSocket messages.                                     | Propose public inclusion. Protocol 52 uses 1 MiB binary chunks; protocols through 51 retain JSON messages.                                  |
| `118bb0f65` (#6391) | skip        | -         | Internal backup-monitor robustness.                                                                                                 | Skip standalone. Ignores duplicate or backward watermark observations.                                                                      |
| `7bb2df549` (#6390) | fix         | -         | Four permission, CRUD SQL, custom-query transformation, and PostgreSQL notice log sites omit app-data fields.                       | Include publicly with the four sites scoped explicitly; other logging paths are unchanged.                                                  |
| `824a5a7b2` (#6392) | skip        | -         | Internal helper not yet integrated in this commit.                                                                                  | Skip. Adds standalone `vfs-query`; integration follows.                                                                                     |
| `e669b21e9` (#6393) | skip        | -         | Test configuration only.                                                                                                            | Skip. Changes Vitest configuration for agent execution.                                                                                     |
| `17e89ba94` (#6395) | fix         | -         | The v5 backup monitor exits even if signalled while VFS open is blocked.                                                            | Include only in the v5 feature. Go source adds forced-exit grace behavior.                                                                  |
| `9801c3c88` (#6394) | fix         | BREAKING  | Makes v5 backup monitoring work through a statically linked helper and changes direct Dockerfile build requirements.                | Propose v5 inclusion. Source builders must pass `--build-context monogo=./go`; official images are unaffected.                              |
| `dd9f275e3` (#6396) | skip        | -         | Release CI only.                                                                                                                    | Skip. Adds the required Docker build context to release automation.                                                                         |
| `4ace2015f` (#6397) | skip        | -         | Test-only timeout adjustment.                                                                                                       | Skip. Changes one purge-scheduler test timeout.                                                                                             |
| `b1dbd8276` (#6398) | skip        | -         | Build-time improvement only.                                                                                                        | Skip. Avoids arm64 emulation while building `vfs-query`.                                                                                    |
| `ef8328d67` (#6387) | skip        | -         | Hidden RMv2 experiment.                                                                                                             | Skip. Cold-read percentage is gated behind non-default serve mode.                                                                          |
| `9f1e077b0` (#6379) | skip        | -         | zbugs rollout script only.                                                                                                          | Skip. Drives local comparison traffic in the sample application.                                                                            |
| `bcc132a59` (#6401) | fix         | -         | Prevents takeover before the first backup is confirmed and readiness is observed.                                                   | Propose inclusion with #6313. HTTP tests cover the gate.                                                                                    |
| `7c3f2161b` (#6402) | fix         | -         | A wedged Litestream VFS follower exits and restarts with backoff instead of serving stale progress forever.                         | Include only in the v5 feature. Tests cover stale-poll detection; upstream issue #1460 documents the failure.                               |
| `23da5f1cb` (#6403) | fix         | -         | Finalizes v5 polling with accurate Litestream time and compaction-boundary fixes.                                                   | Include only in the v5 feature. Target pins `rocicorp/litestream v0.5.17-zerovfs.1`.                                                        |

## Maintenance Delta Audit

These 26 commits follow the immutable 141-commit target snapshot and are on the
remote maintenance branch.

| Commit              | Category | Breaking? | Public impact                                                                                                     | Decision and evidence                                                                                                               |
| ------------------- | -------- | --------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `7dac66447` (#6405) | skip     | -         | Release workflow only.                                                                                            | Skip. Replaces Docker Hub's stored release credential with OIDC and publishes head images to both registries.                       |
| `2c6020486` (#6406) | fix      | -         | V5 backup configuration fails early when the required VFS helper is missing.                                      | Include only as part of the opt-in v5 feature. Patch-equivalent backport of `dbc9dbeeb`; focused normalization tests pass.          |
| `73ed80837` (#6407) | fix      | -         | Single-node deployments without backups no longer attempt restore merely because bundled executables are present. | Include as a release-blocking prerelease repair. Backport of `dd08ad3f9`; source-built startup and replication smoke passed.        |
| `d9d23d3c7` (#6409) | fix      | -         | Litestream restore diagnostics appear while restore is running instead of only after completion.                  | Include only as backup operability support. Backport of `9de6ff3b4`; focused command tests pass.                                    |
| `1b2f16bd5` (#6410) | fix      | -         | The bundled v5 executable includes the Rocicorp VFS fix required by the documented backup path.                   | Include only in the v5 feature. Backport of `49f4f4579`; the changed Docker stage builds successfully.                              |
| `113d50a66` (#6412) | skip     | -         | Hidden RMv2 fleet configuration no longer prevents view-syncers from starting.                                    | Skip publicly because RMv2 remains hidden and off. Backport of `72a869618`; focused normalization tests pass.                       |
| `ba2274cfd` (#6418) | fix      | -         | The bundled v5 executable includes the compaction serialization fix.                                              | Include only in the v5 feature. Backport of `310d01b28`; executable reports `0.5.17-zero.2`.                                        |
| `ad38f6d82` (#6408) | fix      | -         | Change-streamer flow-control waits respond to upstream and internal termination signals.                          | Include with #6419 rather than as a separate public item. Stable patch ID matches main `0df3a76ee`; promise-race tests cover it.    |
| `15e4d4f4d` (#6419) | fix      | -         | Half-open change-database connections no longer leave the storer loop hung indefinitely.                          | Include publicly. Stable patch ID matches main `bd4aedf50`; no-PG and PostgreSQL tests cover acquisition, transactions, and reads.  |
| `928e9161a` (#6420) | skip     | -         | Removes the old wire-activity watchdog after #6419 supersedes it.                                                 | Skip as superseded implementation. Stable patch ID matches main `a0a67e8fb`; document only the final progress-monitor behavior.     |
| `9175ccfa1` (#6425) | fix      | -         | A transient invalid legacy Litestream watermark is ignored instead of breaking backup publication.                | Include publicly. Stable patch ID matches main `ac5eb2311`; regression test proves a subsequent valid watermark is processed.       |
| `aa6887490` (#6426) | fix      | -         | Large SQLite replicas no longer run an unbounded full `ANALYZE` during schema-migration startup.                  | Include publicly as reliability, not a performance claim. Stable patch ID matches main `c725aa39d`; no-PG migration tests pass.     |
| `0d4d58be1` (#6427) | fix      | -         | Failed initial sync no longer leaves a partial canonical replica that prevents backup restore after restart.      | Include publicly. Signed `-x` backport of main `ed6ca267e` with the same stable patch ID; full no-PG suite passes.                  |
| `6a1b81de9` (#6428) | fix      | -         | Legacy Litestream reads watermarks correctly from database pages beyond 32-bit file offsets.                      | Include publicly with #6425. Signed `-x` backport of main `b1da23cef` with the same stable patch ID; Docker build and version pass. |
| `e27876dba` (#6439) | fix      | -         | Long-running backfill COPY operations are no longer aborted by idle transaction handling.                         | Include in grouped backfill reliability. Stable patch ID matches main `ab3264e75`; #6453 completes the final liveness behavior.     |
| `374b2fbf5` (#6440) | fix      | -         | Supabase publication hooks correctly backfill pre-existing rows.                                                  | Include publicly. Stable patch ID matches main `9eb703fb7`; PostgreSQL tests cover same- and separate-transaction changes.          |
| `0d3ffbbce` (#6445) | fix      | BREAKING  | Concurrent ChangeDB work no longer risks corrupt or hung transactions; connection sizing changes.                 | Include in Fixes and Breaking Changes. Stable patch ID matches main `639dc8d34`; config, service, and storer tests cover new pools. |
| `78cd0c3d6` (#6447) | fix      | -         | Inspector errors preserve the server message and server analysis accepts `NOT EXISTS`; client execution does not. | Include publicly. Adapted signed `-x` backport of main `a472f2d1a`; analyzer, inspector, and PostgreSQL tests cover both outcomes.  |
| `81d272502` (#6451) | fix      | -         | Catching-up backups are not disconnected as laggards; caught-up backups participate in flow control.              | Include with flow-control reliability. Stable patch ID matches main `cc518e15f`; broadcast and forwarder tests cover both states.   |
| `bc8594d7e` (#6452) | fix      | -         | Change-streamer errors preserve replicas for startup validation instead of eagerly deleting them.                 | Include with replica recovery. Stable patch ID matches main `cf6367dab`; startup validation remains authoritative.                  |
| `3f26c8bb8` (#6453) | fix      | -         | Large backfills commit in bounded batches and use COPY liveness handling compatible with flow control.            | Include without a speed claim or public batch-size detail. Stable patch ID matches main `93c9bbe0e`; backfill tests cover batching. |
| `da656a43b` (#6454) | fix      | -         | Pipelines refresh when backfills begin, so later writes to newly created or backfilling tables are recognized.    | Include in grouped backfill reliability. Stable patch ID matches main `9be1864a4`; change-processor regression tests cover reset.   |
| `4c3f256ae`         | fix      | -         | Explicit inspector errors release their completed RPC message listeners.                                          | No standalone public item; prerequisite repair for #6447. Signed maintenance-only commit with regression coverage; tests pass.      |
| `131870e56` (#6459) | fix      | -         | A lag report from another shard no longer pauses an active backfill until a new transaction arrives.              | Include in grouped backfill reliability. Stable patch ID matches main `8814a075c`; all 28 source PR checks pass.                    |
| `fb9195c11` (#6460) | skip     | -         | Temporarily adds partial-index replication.                                                                       | Skip. The change was declared unstable and is fully reverted by `14a1c8eb4` before release.                                         |
| `14a1c8eb4`         | skip     | -         | Restores the pre-#6460 behavior.                                                                                  | Skip as the other half of the revert pair. Signed commit; its tree exactly matches #6459-only commit `131870e56`.                   |

## Audit Validation

- Raw range count: PASS, 141 non-merge commits.
- Decision-row count and order: PASS, 141 rows exactly match the raw range.
- Post-target maintenance delta: PASS. All 26 commits after `23da5f1cb` through
  `14a1c8eb4` have decisions above. Nine latest PR backports retain source
  provenance; eight have stable patch IDs, and #6447 is an adapted signed `-x`
  backport. #6460 and its revert have no net tree effect.
- Protocol compatibility: PASS.
- Backport reconciliation: PASS, 38 raw commits already shipped in 1.9.
- Breaking review: PASS, no unresolved `MAYBE` rows. ChangeDB connection sizing
  is documented as an upgrade requirement.
- Human audit review: PASS for the base on 2026-08-24. The latest maintenance
  selection was reviewed and its docs implementation requested on 2026-09-01;
  #6459 inclusion and #6460 omission were directed on 2026-09-02.
- Performance evidence: no public claim selected; no benchmark required yet.
- Public drafting: PASS, release note, product docs, and index updated.
- Production build: PASS, including refreshed search and LLM output, TypeScript,
  and all 162 static pages. Transient documentation fetch and prerender timeouts
  recovered on retry.
- Formatting, types, and tests: PASS. Prettier and TypeScript pass; all 73 tests
  pass.
- Lint: PARTIAL. Non-type-aware Oxlint completed with 15 warnings and no errors;
  the repository's type-aware lint command panics before file analysis because
  its pinned tsgolint does not recognize `no-useless-default-assignment`.
- Links: PASS for all newly changed internal routes and anchors and for pull
  requests #6439, #6440, #6445, #6447, #6451 through #6454, and #6459. The earlier
  repository-wide crawl exceeded ten minutes on older release notes and reported
  only pre-existing external statuses plus the expected GitHub source-link 404
  for the uncommitted release-note file.
- Source tests through `4c3f256ae`: PASS. Zero Client passed 40 files and 650
  tests. Zero Cache no-PG passed 132 files and 1,973 tests; PostgreSQL 16 passed
  52 files and 724 tests, with one file and nine tests skipped. The first
  PostgreSQL run had one auto-discovery timeout; its isolated rerun and the
  complete rerun passed. Zero Client and Zero Cache formatting, TypeScript, and
  lint checks completed with no errors.
- Current-head delta checks: PASS. #6459's 28 source PR checks passed, its
  maintenance patch ID matches main `8814a075c`, and the signed #6460 revert
  restores the exact `131870e56` tree. The focused no-PG change-source test
  passes at `14a1c8eb4`: one file and three tests.
- Legacy Litestream build: PASS. The `litestream` Docker stage builds at
  `6a1b81de9`, checks out tagged upstream commit `f82952e1b`, and reports version
  `0.3.13-zero.11`.
- Canary.12 artifact preflight: PASS for source through `da656a43b`. Workflow run
  `33479508919` published npm provenance and matching Docker Hub/GHCR
  multi-architecture images under OCI digest
  `sha256:bbc5de19c65bf24bd2073b2df43d0f64828a361c09aa86748a68ee27437a5e68`.
  Tag commit `6623c5142` is a version-only child of `da656a43b`. It does not
  contain `4c3f256ae` and is not the final candidate.
- Previous smoke testing: PASS through canary.9. Source Docker startup, v5
  backup/readiness/restore, 1.9 rollback with full resync, VFS process recovery,
  both protocol rollout directions, readiness, initial and incremental
  replication, and persisted-replica restart behaved as documented.
- Canary.13 artifact preflight: PASS for source through `4c3f256ae`. Tag commit
  `25a8e047d` is a version-only child of that source; the adapter branches pass
  against its exact npm package.
- Canary.15 artifact preflight: REJECTED. Tag commit `2c6f76e2a` is a
  version-only child of `fb9195c11` and therefore contains unstable #6460. npm,
  Docker Hub, and GHCR published successfully, with both image registries at
  `sha256:4804df1cea067172150f2b00c37cf9f05592b5388d229322b543a05ecb5123c6`,
  but this artifact must not be used for final validation.
- Current-head artifact and smoke testing: PENDING. Release workflow
  `33685579981` is publishing a replacement candidate. Verify its source parent
  is `14a1c8eb4`, refresh npm/OCI evidence, rerun the #6459 regression, and roll
  companion-package validation to the new exact canary.
