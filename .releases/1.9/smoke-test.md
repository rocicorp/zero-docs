# Zero 1.9 Smoke Test

Status: canary artifact preflight and automated smoke checks complete; manual runtime and real-backup checks remain.

## Release Metadata

- Previous stable: `1.8.0`
- Target canary: `1.9.0-canary.10`
- Intended stable: `1.9.0`
- Mono source: `maint/zero/v1.9` at `7fb31b033738535c31d83ef476e57771b792474c`
- Release commit: `dbf9a90f09248f8af712b46ddefd0e79628a4c4b`; its parent is the exact mono source above.
- Git tag: `zero/v1.9.0-canary.10`
- npm integrity: `sha512-FKTyB2ouydfW1TqSzOfRS5KR0Bvgb/H/V7VyqD80qf/NgmURtrij7s+8I9GngaSMVCc/oOg37CzjOPUeFTP4yg==`
- Docker Hub and GHCR index digest: `sha256:395d5bde7ab6b2ba286edb1019b98d365154d87e64e969cffd25396e4d4fa7ea`
- Image platforms: Linux AMD64 and ARM64.
- npm SLSA provenance and both registry Cosign signatures verified. Cosign identity: `https://github.com/rocicorp/mono/.github/workflows/release.yml@refs/heads/main`.
- Release notes: `contents/docs/release-notes/1.9.mdx`
- CloudZero staging rollout and rollback: completed with `1.9.0-canary.9` per human report; final-tip difference is the default-preserving #6351 timeout override.

## Worktrees

All branches are named `0xcadams/zero-1.9`.

| Repository         | Base                          | Worktree                                                 | Role                                                |
| ------------------ | ----------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| `hello-zero`       | `6167cce` (`origin/main`)     | `/Users/chase/.worktree/hello-zero/zero-1.9-smoke`       | React install and runtime baseline                  |
| `hello-zero-solid` | `da98082` (`origin/main`)     | `/Users/chase/.worktree/hello-zero-solid/zero-1.9-smoke` | Solid runtime baseline                              |
| `hello-zero-cf`    | `fc27423` (`origin/main`)     | `/Users/chase/.worktree/hello-zero-cf/zero-1.9-smoke`    | Cloudflare Worker and lower-level client            |
| `zero-music`       | `5cb8b7a` (`origin/2-deploy`) | `/Users/chase/.worktree/zero-music/zero-1.9-smoke`       | Bun, Drizzle generation, and onboarding/deploy flow |
| `ztunes`           | `9c63d6b` (`origin/main`)     | `/Users/chase/.worktree/ztunes/zero-1.9-smoke`           | Rich web/query/permissions workload                 |
| `zmail`            | `9cad047` (`origin/main`)     | `/Users/chase/.worktree/zmail/zero-1.9-smoke`            | Large-row replication and backpressure              |
| `zslack`           | `9e28111` (`origin/main`)     | `/Users/chase/.worktree/zslack/zero-1.9-smoke`           | Expo, React Native, OP-SQLite, and Docker image     |
| `drizzle-zero`     | `9a8a572` (`origin/main`)     | `/Users/chase/.worktree/drizzle-zero/zero-1.9-smoke`     | Drizzle schema generator compatibility              |
| `prisma-zero`      | `c059112` (`origin/main`)     | `/Users/chase/.worktree/prisma-zero/zero-1.9-smoke`      | Prisma schema generator compatibility               |
| `zero-virtual`     | `36a0160` (`origin/main`)     | `/Users/chase/.worktree/zero-virtual/zero-1.9-smoke`     | React/Solid virtual scrolling compatibility         |
| `zero-sqlite3`     | `8559637` (`origin/main`)     | `/Users/chase/.worktree/zero-sqlite3/zero-1.9-smoke`     | Native SQLite installation and loading              |

## Upgrade Rules

- Pin `@rocicorp/zero` and Zero Docker images exactly to `1.9.0-canary.10` once published.
- Regenerate lockfiles and checked-in schemas with each repository's declared tools.
- Do not update `zero-virtual` in `zmail`; preserve its existing `0.5.1` pin during this smoke test.
- Do not change unrelated dependencies.

## Planned Order

1. Verify npm provenance, dependency metadata, Docker Hub/GHCR manifests, architecture coverage, and image digests.
2. Test `drizzle-zero`, `prisma-zero`, `zero-virtual`, and `zero-sqlite3`.
3. Install, generate, typecheck, test, and build the maintained samples.
4. Run browser/runtime checks in `hello-zero`, `hello-zero-solid`, `hello-zero-cf`, `zero-music`, `ztunes`, and `zmail`.
5. Run native force-quit/relaunch checks in `zslack`.
6. Run Litestream restore, retry, cleanup, image, upgrade, and rollback checks.
7. Replace canary pins with exact `1.9.0` and run the reduced final-artifact suite before promotion.

## Results

### Artifact And Image Preflight

- npm package, provenance, Git tag, release-parent provenance, Docker Hub image, and GHCR image passed.
- Docker Hub and GHCR expose the same signed multi-platform index.
- The pulled GHCR ARM64 image contains `@rocicorp/zero@1.9.0-canary.10`, legacy Litestream `0.3.13+z0.0.9`, and Litestream v5 `0.5.15`.

### Companion Packages

| Repository           | Automated result    | Notes                                                                                                                                                                                                                                                                                              |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `drizzle-zero`       | Pass                | Format, lint, types, build, 667 unit tests, and PostgreSQL 16/17/18 integration and no-config integration suites passed. Each PG suite passed 9 tests with 1 skipped.                                                                                                                              |
| `prisma-zero`        | Pass                | Format, lint, types, build, 260 tests, generator checks, migration generation, and integration typecheck passed. One existing lint warning remains.                                                                                                                                                |
| `zero-virtual`       | Pass                | Format, lint/check, types, build, 58 unit tests, and 36 React E2E tests passed. Existing warnings remain. The `^1.7.0` peer range already admits Zero 1.9.                                                                                                                                         |
| `zero-sqlite3@1.1.4` | Accepted limitation | Published package installation, native load, and an in-memory query passed on Node 22.23.1 and 24.19.0. Bun 1.3.14 installs the package but segfaults while loading ABI 137. Versions 1.1.2 and 1.1.3 also fail on the same Bun, so this is not a 1.1.4 regression; the release owner accepted it. |

### Maintained Samples

| Repository         | Automated result | Notes                                                                                                                                                                                                                                          |
| ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hello-zero`       | Pass             | Clean install, lint, and production build passed.                                                                                                                                                                                              |
| `hello-zero-solid` | Partial          | Clean install and production build passed. Lint is blocked by existing undeclared `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` imports.                                                                                       |
| `hello-zero-cf`    | Pass             | Clean install, Wrangler type generation, lint, build, and deploy dry-run passed. The lockfile resolves `postgres` 3.4.7 to match the Zero adapter.                                                                                             |
| `zero-music`       | Pass             | Bun install/frozen install, schema generation, formatting, build, and all Compose validations passed. All four images are pinned to canary.10.                                                                                                 |
| `ztunes`           | Pass             | Clean install, schema generation, and environment-backed production build passed. Generated schema was unchanged.                                                                                                                              |
| `zmail`            | Pass             | Install/frozen install, schema generation, format, types, and build passed. `zero-virtual` remains exactly `0.5.1`.                                                                                                                            |
| `zslack`           | Partial          | Bun install/frozen install, generation, lint, types, web export, generated-schema formatting, and Compose validation passed. Full-repository Prettier remains blocked by the existing `shared/src/mutators.ts`. Physical-device checks remain. |

### Focused Zero Regression Coverage

- The selected no-PG command ran 106 files and passed all 1,532 tests.
- The selected PostgreSQL 16 command ran 49 files: 48 passed and 1 skipped, with 631 tests passed and 9 skipped.
- Covered API 5xx retries, configured replication-stream inbound timeout behavior, lag and serving telemetry, WebSocket and subscriber backpressure, 1 MiB row flow control, failed restore retries, temporary-family cleanup, snapshot reservation/retention, replication-manager and view-syncer startup, protocol compatibility, rollback drills, and flip-forward drills.
- The PostgreSQL suite emitted a non-failing `MaxListenersExceededWarning`.

### Operational Evidence

- CloudZero canary.9 rollout, rollback to 1.8, and recovery are accepted as the cross-version operational check. Repeating with canary.10 is optional because #6351 preserves default behavior.

### Real Litestream Image Fixtures

- Legacy restore passed: Litestream v5 restored a backup written by legacy Litestream `0.3.13+z0.0.9`; SQLite integrity and fixture data matched.
- Mixed-format selection passed: a destination containing legacy snapshot/WAL files and newer LTX files restored the newer LTX data.
- Legacy opt-out passed at the Zero restore-service boundary: `restoreUsingV5: false` selected the legacy executable and restored a compatible Zero replica. A full zero-cache startup attempt stopped earlier because no PostgreSQL service was configured.
- Age behavior passed: the legacy binary created and restored an age-encrypted backup; v5 explicitly rejected age configuration and rejected encrypted content without it. Selecting the legacy executable is the supported opt-out.
- Fixtures and direct evidence are under `/var/folders/97/c3gvpw6d46g3nm0y2684_cfm0000gn/T/opencode/litestream-smoke-1.9.0-canary.10-20260814`.

### Remaining Manual Gates

- Browser runtime checks: initial sync, queries, mutations, reload, reconnect, restart, two-tab ordering, and visible API retry behavior.
- `zmail`: end-to-end large-row and backpressure behavior against running services.
- `zslack`: physical-device OP-SQLite force-quit and relaunch.
- Inspect emitted lag and serving telemetry from a running deployment.
- A historical-binary local upgrade/rollback/re-upgrade test is not present in the repository; CloudZero supplies the accepted operational evidence instead.

### Manual Test Cards

| Surface                | Branch and setup                                                                                                                             | Actions                                                                                                                              | Pass condition                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Browser baseline       | `hello-zero`, `hello-zero-solid`, and `hello-zero-cf` on `0xcadams/zero-1.9`; start each repository's database, zero-cache, and UI commands. | Complete initial sync; query and mutate; reload; disconnect and reconnect; restart zero-cache; repeat a mutation with two tabs open. | Both tabs converge without lost or reordered mutations, reload/reconnect preserve data, and restart recovers cleanly. |
| Rich browser apps      | `zero-music`, `ztunes`, and `zmail` on `0xcadams/zero-1.9`; use each repository's normal development command and seed flow.                  | Exercise primary list/detail queries and mutations; trigger an API 5xx retry where supported; inspect lag and serving telemetry.     | UI and data converge, retries recover without duplicate writes, and telemetry reports finite non-negative values.     |
| Large-row flow control | `zmail` on `0xcadams/zero-1.9` with its existing `zero-virtual@0.5.1`.                                                                       | Replicate a large email row while clients are active, let downstream consumption lag, then allow it to drain.                        | Replication remains live, memory/backlog behavior is bounded, and the full row arrives without corruption.            |
| Native persistence     | `zslack` on `0xcadams/zero-1.9`; run the native app against the pinned canary image.                                                         | Sync and mutate, force-quit during or after sync, relaunch, reconnect, and repeat after restarting zero-cache.                       | OP-SQLite reopens without corruption and the app converges without losing acknowledged mutations.                     |

Record each card as `pass`, `fail`, or `blocked`, with platform/browser/device details and relevant logs on failure.

### Known Non-Release Blockers

- `hello-zero-solid` lint setup is incomplete on its base branch.
- `zslack` has a pre-existing formatting failure in `shared/src/mutators.ts`.
- `zero-sqlite3` cannot load under Bun 1.3.14, including older package versions; Node 22 and 24 are green.
