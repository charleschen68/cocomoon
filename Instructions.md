# Repository Instructions

**Owner:** Repository maintainer

**Review trigger:** Review whenever contributor workflow, validation commands, repository
structure, or governing policy changes.

## Purpose and precedence

This document is the starting point for work in this repository. It directs contributors to
the repository standards and area-specific documentation; it does not replace them.

Follow instructions in this order when they conflict: platform requirements, the active user
request, [`AGENTS.md`](AGENTS.md), this document, then the relevant linked reference. Use
[`CLAUDE.md`](CLAUDE.md) for repository context and [`README.md`](README.md) for the upstream
starter-template documentation. Do not treat unverified documentation as authorization to run a
production procedure.

## Repository map

- `app/` contains App Router routes, layouts, and API handlers.
- `components/` contains reusable UI and MDX rendering components.
- `layouts/` contains page-level templates.
- `data/` contains site configuration, author profiles, and blog content.
- `public/static/` contains static assets.
- `scripts/` contains build and publishing helpers.
- `design/` records design decisions and architecture references.
- `wiki/` contains operational and contributor documentation.

## Mandatory change workflow

1. Read the applicable instructions and the files being changed before editing.
2. Keep the change scoped; preserve user-created content and follow the generated-output policy.
3. Update the relevant documentation when behavior, configuration, or operational guidance
   changes.
4. Run the validation required by the matrix below and inspect the resulting diff.
5. Report the changed files, validation performed, and any remaining limitations or risks.

## Validation matrix

| Change                                                              | Required validation  |
| ------------------------------------------------------------------- | -------------------- |
| Every change                                                        | `npm run lint`       |
| Documentation in this system                                        | `npm run docs:check` |
| Routes, Contentlayer configuration, MDX rendering, or build scripts | `npm run build`      |

Run `npm run lint` for every change. Run `npm run build` when changing routes,
Contentlayer configuration, MDX rendering, or build scripts. Run `npm run docs:check` when
changing this document, `PROJECT_STANDARDS.md`, or files under `design/` or `wiki/`.

## Content and generated-file boundaries

Write blog posts in `data/blog/` and author profiles in `data/authors/`; keep required
frontmatter and author references aligned with the content schema. Place static images under
`public/static/images/` and use stable repository paths.

Generated-output policy is defined in
[`PROJECT_STANDARDS.md`](PROJECT_STANDARDS.md#generated-outputs). Do not alter existing
user-created blog content unless the requested change explicitly targets that content.

## Security and dependency limits

Do not commit secrets, credentials, or environment-specific values. Review browser-facing
integrations, external image hosts, and Content Security Policy implications before changing
`next.config.js`. Add or upgrade dependencies only when the requested work requires them,
the dependency has been reviewed for maintenance and security impact, and the resulting lockfile
change is included intentionally.

## Delivery checklist

- The implementation is scoped to the request and follows the applicable references.
- Required documentation and configuration changes are included.
- `npm run lint` has run for every change.
- `npm run docs:check` has run when documentation-system files changed.
- `npm run build` has run when the validation matrix requires it.
- Generated-file changes satisfy the review rules in `PROJECT_STANDARDS.md`; unrelated user
  changes are untouched.
- The handoff names changed files, validation results, and remaining concerns.

## Linked references

- [Repository standards](PROJECT_STANDARDS.md)
- [Design documentation](design/README.md)
- [Wiki documentation](wiki/README.md)
- [Repository guidance](AGENTS.md)
- [Repository context](CLAUDE.md)
- [Starter-template reference](README.md)
