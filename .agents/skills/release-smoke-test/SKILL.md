---
name: release-smoke-test
description: Plan and run Zero canary smoke tests across maintained sample apps, companion packages, Docker images, and internal rollout or rollback. Use when preparing a Zero release, upgrading examples to a canary, testing drizzle-zero or prisma-zero, or coordinating manual app validation.
---

# Zero Release Smoke Test

Use this skill after the release contents are understood and a canary is available. It coordinates published-artifact validation, sample-app upgrades, feature-focused manual testing, companion-package tests, and internal rollout or rollback.

## Goal

Prove that a Zero release can be installed, integrated, operated, and rolled back through representative public and internal applications. Use the process to find runtime defects, accidental breaking changes, awkward APIs, packaging problems, missing release notes, and incomplete product documentation before the final release.

## Inputs

Collect or infer:

- Previous stable Zero version.
- Target canary version.
- Intended final version, if known.
- Target release notes and release working-state directory.
- `rocicorp/mono` target ref.
- Parent directory where Rocicorp repositories should be checked out.
- Maintained sample and companion-package scope.
- Native platforms available for manual testing.
- Human owners for internal rollout and manual app checks.

Ask one short question for any input that materially changes scope or makes a test impossible. Do not block mechanical discovery on optional inputs.

## Upgrade Contract

1. Treat the target release notes as the upgrade contract.
2. Do not read older release notes, migration guides, PR descriptions, or unrelated product docs unless the human permits it.
3. Repository source, manifests, lockfiles, generated files, package metadata, compiler errors, tests, and runtime diagnostics are valid evidence.
4. Record any required migration that cannot be inferred from the target release notes as a release-note or documentation gap.
5. Do not silently add compatibility workarounds. Prefer fixing the canary or documenting a real migration requirement.

## Repository Discovery

1. Inventory existing sibling repositories before cloning.
2. Inspect the Rocicorp organization repository list when the local inventory is incomplete.
3. Classify each candidate as one of:
   - Maintained sample, demo, quickstart, or onboarding repository.
   - Companion package with Zero integration tests, such as schema generators or UI helpers.
   - Internal dogfood or deployment stack.
   - Production product rather than a sample.
   - Legacy or inactive sample.
   - Archived repository.
4. Include maintained samples and selected companion packages by default.
5. Ask the human before including ambiguous production, legacy, inactive, or archived repositories.
6. Exclude repositories that do not consume the published canary when the goal is package validation. They may still be useful as source-level regression surfaces, but label that distinction.
7. Clone missing included repositories into the configured parent directory. Use each repository's default branch unless onboarding is intentionally represented as a branch sequence.
8. Create branches named `0xcadams/<purpose>` unless the human specifies another owner prefix.

## Tracking File

Default to `.releases/<major>.<minor>/smoke-test.md` in `zero-docs`. If the human prefers an issue or another system, keep the same information there.

Record:

- Release metadata, source refs, and artifact availability.
- Included and excluded repositories with reasons.
- Repository, base ref, previous version, target version, branch, and PR link.
- Dependency, override, release-age exclusion, generated-file, lockfile, and image changes.
- Automated install, generation, format, lint, typecheck, unit, integration, build, and package checks.
- Feature-to-test-surface coverage.
- Manual owner, status, observations, and evidence.
- Internal rollout and rollback results.
- Failures, reduced reproductions, release blockers, and documentation gaps.
- Canary rollover history and final-version replacement status.

Update the file as work happens. Do not mark tests complete based on intent.

## Artifact Preflight

Before editing consumers:

1. Confirm the exact npm canary exists.
2. Inspect its peer dependencies and optional peer metadata.
3. Confirm every required companion version exists.
4. Confirm Docker Hub and GHCR images exist when samples or deployments use them.
5. Record digests where image identity matters.
6. Stop and report a release blocker when a required artifact is missing.

## Upgrade Rules

1. Pin the canary exactly. Do not use `^`, `~`, `latest`, or a broad range for release validation.
2. Update every direct dependency declaration, workspace override, package-manager catalog, release-age exclusion, Docker tag, and relevant fixture.
3. Regenerate lockfiles with the repository's declared package manager.
4. Regenerate checked-in schemas or other artifacts through repository scripts rather than manual edits.
5. Upgrade companion packages only when selected for the release test or required by package compatibility.
6. Inspect peer warnings. Do not dismiss them merely because installation succeeds.
7. Keep feature-specific sample changes only when they naturally improve the sample or demonstrate recommended production configuration.
8. Use temporary local instrumentation or a disposable test commit for contrived checks.
9. Do not change unrelated dependencies merely to refresh a lockfile.

## Test Order

Use small batches so failures are attributable and humans are not overwhelmed:

1. Companion packages and their unit or integration fixtures.
2. Onboarding and installation examples.
3. Framework quickstarts.
4. Rich browser applications.
5. Native applications.
6. Internal dogfood and deployment stacks.

Finish automated checks for a batch before requesting its manual checks. Stop between manual batches for human results when practical.

## Feature Coverage

1. Map every feature, breaking change, reliability fix, and high-risk performance change in the target release notes to at least one test surface.
2. Prefer applications already exercising the affected API, adapter, runtime, or deployment mode.
3. Test new APIs for usability, not only compilation.
4. Test fixes by reproducing the old risk when feasible.
5. Include reconnect, restart, stale-data, and offline transitions for sync correctness changes.
6. Include deep, sparse, or boundary-heavy data when validating ordered limited queries.
7. Include a large upstream transaction for replication persistence or flow-control changes.
8. Include native force-quit and relaunch when validating native SQLite behavior.
9. Include telemetry collection and metric inspection for observability changes.
10. Record why an item was not directly testable.

## Automated Checks

Infer commands from each repository's manifests and CI. Run applicable checks in this order:

1. Package-manager install.
2. Generated artifact or schema checks.
3. Formatting and linting.
4. Typechecking.
5. Unit tests.
6. Integration tests.
7. Production build or package build.
8. Focused runtime smoke test.

Use clean installs when validating package resolution. Preserve package-manager and runtime versions declared by the repository.

## Manual Test Cards

For each manual session, give the human a short card containing:

- Repository and exact branch or commit.
- Required services and startup commands.
- Starting state or seed data.
- Actions to perform in order.
- Expected visible behavior.
- Logs, screenshots, metrics, or device details to capture on failure.
- A clear pass, fail, or blocked response format.

The agent owns setup, logs, and diagnosis. The human owns visual judgment, API-design judgment, native-device behavior, privileged deployment actions, and final manual pass or fail decisions.

## Draft PRs

1. Use one draft PR per repository when possible.
2. Use separate PRs when one repository has independent onboarding branches that must remain individually runnable.
3. Keep PRs draft until automated and assigned manual checks pass.
4. Write PR descriptions for reviewers, using the repository's required format.
5. Include the target canary and relevant feature coverage, but do not dump the whole checklist into every PR.

## Internal Rollout And Rollback

1. Select an internal stack that exercises the published package or image.
2. Capture the current version and a basic health baseline.
3. Upgrade to the canary and verify sync, mutations, queries, reconnects, startup, and telemetry.
4. Roll back to the previous version and verify compatibility and recovery.
5. Upgrade to the canary again and repeat the reduced health check.
6. Record timing, errors, data correctness, metrics, and operator observations.
7. Treat rollback failure, protocol incompatibility, data loss, or unrecoverable stale state as a release blocker.

Never perform a production or CloudZero rollout without explicit human approval. Follow the operational repository's incident and deployment instructions.

## Fix And Canary Loop

When testing finds a release issue:

1. Reduce it to the smallest reliable reproduction.
2. Classify it as a release blocker, documentation gap, sample bug, companion-package issue, or non-blocking observation.
3. Decide with the human whether the fix belongs on trunk or a maintenance branch.
4. Use `git cherry-pick -x` for release-branch cherry-picks.
5. Cut a new canary after the fix.
6. Update every draft sample branch to the new exact canary.
7. Rerun the failed test, affected feature tests, artifact checks, and a reduced cross-app compatibility suite.
8. Record the rollover and why it happened.

## Finalization

After the final non-canary release exists:

1. Replace canary pins with the exact final version.
2. Replace canary image tags with final tags.
3. Regenerate lockfiles and generated artifacts.
4. Rerun automated checks and a reduced manual suite.
5. Update tracking with final results.
6. Merge sample and docs changes only after the release manager confirms promotion timing.
7. Release selected companion packages after their final Zero compatibility pass.

## Output Checklist

- Target canary and artifact preflight results.
- Included and excluded repositories with rationale.
- Branch and PR inventory.
- Automated results by repository.
- Manual test cards and human results.
- Feature coverage matrix.
- Internal rollout and rollback result.
- Release blockers and documentation gaps.
- Canary rollover history.
- Final-version replacement status.
