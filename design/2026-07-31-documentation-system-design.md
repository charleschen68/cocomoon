# Production Documentation System Design

**Date:** 2026-07-31

**Status:** Implemented

**Owner:** Repository maintainer

**Review trigger:** Review when documentation precedence, validation, lifecycle rules, ownership,
or repository publishing guidance changes.

## Problem

The repository lacked a discoverable, shared documentation contract for safe
changes, durable design decisions, and verified operational knowledge. The root
README is primarily upstream starter documentation and cannot serve as that
contract.

## Context

Repository guidance already exists in `AGENTS.md` and `CLAUDE.md`, but each has
a distinct audience. The project has no automated test suite, and builds may
regenerate checked-in outputs. Operational procedures must not become
actionable until they have been verified for a stated environment.

## Goals

- Provide one prominent starting point for contributors and coding agents.
- Define enforceable engineering, validation, and generated-output rules.
- Preserve design decisions through an indexed lifecycle.
- Separate verified runbooks from proposals and historical procedures.
- Make documentation structure and links reproducibly checkable.

## Non-Goals

- Replace or consolidate `README.md`, `AGENTS.md`, or `CLAUDE.md`.
- Add CI enforcement, a test framework, publishing runbooks, or release tooling.
- Change application code, dependencies, user content, or runtime behavior.

## Decision

Create a small documentation system with one source of truth for each concern:

| Location                 | Source-of-truth responsibility                                       |
| ------------------------ | -------------------------------------------------------------------- |
| `Instructions.md`        | Entry point, precedence, contributor workflow, and validation matrix |
| `PROJECT_STANDARDS.md`   | Normative engineering and generated-output policy                    |
| `design/README.md`       | Design-record lifecycle, index, ownership, and template              |
| `wiki/README.md`         | Operational-page lifecycle and executable-procedure policy           |
| `scripts/docs-check.mjs` | Executable validation of documentation links and structure           |

The root `README.md` links prominently to `Instructions.md`. The package script
`npm run docs:check` runs the standard-library Node.js validator over
`Instructions.md`, `PROJECT_STANDARDS.md`, `design/`, and `wiki/`.

## Alternatives and Trade-Offs

- Expanding the root README would improve visibility but mix project-facing
  starter content with contributor policy and increase duplication.
- Using only `AGENTS.md` would leave human contributors and tools that do not
  consume agent instructions without a stable entry point.
- Adding a third-party Markdown checker would provide more features but add a
  dependency for a small, repository-specific contract.

## Consequences

Contributors have a discoverable workflow and maintainers can review design and
operational material against explicit lifecycles. The repository gains a small
maintenance obligation: policy metadata, indexes, and validator expectations
must evolve together. The validator checks repository structure, not the truth
of operational claims; verification evidence remains a human review concern.

## Implementation Outline

1. Link `Instructions.md` prominently from the root README.
2. Add the instruction entry point and normative project standards.
3. Add indexed design and wiki areas with reusable templates.
4. Add `scripts/docs-check.mjs` and expose it as `npm run docs:check`.
5. Validate the documentation contract and repository lint.

## Rollout

Deliver the documentation, README link, and local validator together. No
compatibility period or runtime monitoring is required because the change does
not affect application behavior. Run the documentation check before lint so
structural failures are reported directly.

## Validation

1. Run `npm run docs:check` to validate local links, required metadata, and
   required sections.
2. Scan new documents for conflicting requirements.
3. Run `npm run lint` as the repository's required validation for every change.
4. Do not run a production build: the documentation validator is not a build
   script and this change does not affect routes,
   Contentlayer configuration, MDX rendering, or build scripts.

## Rollback

If the documentation system must be withdrawn, remove the root README link,
the `docs:check` package script and validator, and the documentation files as
one reviewed change. No runtime recovery or data migration is required.

## Security, Performance, and Accessibility Considerations

The validator reads local Markdown and performs no network access or writes.
The documentation introduces no runtime bundle, user interface, personal data,
credentials, or production permissions. Operational pages remain
non-executable unless their status is `verified`.

## References

- [Repository instructions](../Instructions.md)
- [Project standards](../PROJECT_STANDARDS.md)
- [Design record index](README.md)
- [Operational wiki](../wiki/README.md)
- [Implementation plan](../docs/superpowers/plans/2026-07-31-production-documentation-system.md)
