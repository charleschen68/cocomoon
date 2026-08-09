# Project Engineering Standards

**Owner:** Repository maintainer

**Review trigger:** Review whenever supported tooling, architecture, security policy, quality
gates, or generated-output behavior changes.

## Scope and precedence

This document defines the engineering standard for this repository. Platform requirements take
precedence, followed by an active user request, [`AGENTS.md`](AGENTS.md), and this standard.
[`CLAUDE.md`](CLAUDE.md) provides repository context, while
[`Instructions.md`](Instructions.md) defines the contributor workflow.

## TypeScript and React

- New application code MUST use TypeScript unless a documented compatibility constraint requires
  JavaScript.
- Components MUST use PascalCase file and component names. A component MUST be split when it
  combines unrelated domain behavior or when its presentation, data-fetching, and mutation logic
  cannot be independently understood or validated. Utilities and data fields MUST use camelCase.
- Local imports MUST use the configured `@/` aliases where an alias exists.
- Components MUST model loading, empty, error, and success states when their inputs can reach
  those states. Error paths MUST retain enough context to diagnose failures without exposing
  secrets to users or the browser console.
- React effects MUST clean up subscriptions, timers, and other resources. Components MUST NOT
  introduce state updates after unmounting.
- Code MUST follow the repository Prettier configuration: two-space indentation, single quotes,
  no semicolons, 100-character lines, trailing commas where valid, and Tailwind class ordering.

## Next.js and Contentlayer

- Routes, layouts, and API handlers MUST follow the App Router conventions in `app/`.
- Server Components MUST remain server-side unless a client boundary is required for browser APIs,
  event handling, or client-only state.
- New or changed Contentlayer documents MUST remain compatible with the schema in
  [`contentlayer.config.ts`](contentlayer.config.ts). Blog and author content MUST preserve the
  required frontmatter and valid author references.
- Changes to routes, Contentlayer configuration, MDX rendering, or build scripts MUST be checked
  with `npm run build` before handoff.

## Generated outputs

- Generated outputs, including `app/tag-data.json` and search assets, MUST NOT be edited manually
  or as part of an unrelated change.
- A required build MAY regenerate generated outputs. Such regeneration is expected only when it
  follows from an intentional source, configuration, dependency, or build-tool change.
- A generated diff MUST be reviewed before handoff for scope, unexpected deletions, nondeterministic
  churn, sensitive data, and consistency with the initiating source change.
- Expected generated changes MUST be included with the initiating change when consumers require
  checked-in output. Unexpected or unrelated generated changes MUST NOT be included; preserve any
  pre-existing user change and report it instead of overwriting it.

## Accessibility

- User-facing UI MUST use semantic HTML before adding ARIA attributes.
- Interactive controls MUST be keyboard-operable, have an accessible name, and show a visible
  focus indicator.
- Images that convey information MUST have alternative text that identifies the information or
  action needed to understand the surrounding content; decorative images MUST use an empty
  alternative text value.
- Color alone MUST NOT convey state or meaning. Text, controls, and focus indicators MUST retain
  WCAG 2.2 AA contrast: 4.5:1 for normal text, 3:1 for large text, and 3:1 for controls and focus
  indicators against adjacent colors.
- A new or materially changed user flow containing an interactive control, form, modal, menu, or
  navigation change MUST be checked with keyboard-only navigation and an accessibility inspection
  that verifies accessible names, roles, and focus order.

## Security and privacy

- Secrets, credentials, private keys, and environment-specific values MUST NOT be committed,
  rendered to the client, or written to logs.
- Browser-facing integrations, external image hosts, and third-party scripts MUST be reviewed for
  Content Security Policy and privacy implications before they are introduced or changed.
- Changes to [`next.config.js`](next.config.js) MUST preserve intentional security headers and
  explicitly account for any new browser-facing origin.
- Input crossing a trust boundary MUST be validated and encoded for its output context. Code MUST
  NOT use unsanitized HTML or URLs from untrusted sources.
- Documentation MUST NOT be treated as authorization for a production action unless that
  procedure has been verified for the intended environment.

## Performance and resilience

- A Client Component MUST be introduced only when the component needs a browser API, event
  handler, client-only state, or client-side effect; the client boundary MUST exclude descendants
  that do not need one of those capabilities.
- A page or layout MUST NOT fetch the same resource more than once during one render path unless
  the requests intentionally use different inputs or cache policies.
- Images MUST use stable paths and either explicit dimensions or an aspect-ratio-preserving
  container. Remote images MUST use the configured Next.js image policy or document why
  optimization cannot be used.
- A route, content, or data-fetching change that adds runtime work MUST document its rendering
  mode, cache or revalidation behavior, and user-visible failure behavior before handoff.
- Network and external-service failures MUST have deliberate user-visible or operational handling;
  failures MUST NOT silently produce misleading content.

## Dependencies and configuration

- A dependency MUST be added or upgraded only when the requested work requires it and its
  maintenance, security, bundle-size, license, and compatibility impact have been reviewed.
- Dependency and lockfile changes MUST be intentional and included in review. Unrelated lockfile
  churn MUST NOT be included.
- Configuration changes MUST document the behavior they change and MUST NOT introduce local-only
  assumptions into shared configuration.

## Observability

- A new server-side failure path with logging available MUST record the operation name, route or
  job identifier, error category, and a correlation identifier when one exists; logs MUST exclude
  secrets and personal data.
- An analytics or telemetry change MUST identify the event name, purpose, fields collected,
  retention or destination when known, and privacy implications in the change description or
  relevant documentation.
- Production monitoring, deployment, and incident procedures MUST be documented only when their
  commands, permissions, and environment assumptions have been verified.

## Testing and validation

- Every change MUST run `npm run lint` and the result MUST be reported. The command may modify
  files, so its resulting diff MUST be inspected.
- Changes to `Instructions.md`, `PROJECT_STANDARDS.md`, `design/`, or `wiki/` MUST run
  `npm run docs:check`. The command MUST validate local Markdown links and the required
  documentation metadata and sections.
- A changed behavior is critical when it changes a route or API contract, content generation or
  rendering, authentication or authorization, input validation or output encoding, security
  headers or browser-facing integrations, data persistence or deletion, analytics or telemetry,
  dependency resolution, or a user flow that can prevent users from reading or navigating the
  site.
- Every critical behavior change MUST have targeted validation for the changed success case, a
  relevant failure case, and an applicable boundary case. Lower-risk changes MUST at minimum have
  validation that exercises the changed behavior in its expected execution path.
- For a critical behavior change, the handoff MUST record the changed behavior, validation command
  or manual steps, inputs or preconditions, expected result, actual result, environment, and a
  durable evidence reference such as test output, a screenshot, or a reproducible log excerpt.
- Automated tests MUST be added or updated for changed critical behavior when the behavior can be
  exercised in the repository's supported test tooling without introducing a disproportionate new
  harness or external dependency.
- This repository currently has no automated test suite. When automated coverage for a critical
  behavior is not feasible, the handoff MUST document why it is not feasible and provide a
  repeatable manual check with preconditions, exact steps, expected result, actual result,
  environment, and evidence reference.
- Changes affecting routes, Contentlayer configuration, MDX rendering, or build scripts MUST run
  `npm run build`; generated build outputs MUST follow the
  [generated-output policy](#generated-outputs).

## Code review

- Every change MUST be reviewed for correctness, maintainability, error handling, accessibility,
  security, performance, race conditions, resource leaks, and scalability assumptions.
- Reviewers MUST challenge unclear naming, unexplained design trade-offs, and missing validation
  for critical paths.
- A change MUST NOT be described as complete while required validation is missing, failing, or
  known risks remain undocumented.

## Documentation maintenance

- Documentation MUST be updated when behavior, configuration, operational guidance, or
  contributor workflow changes.
- Documentation links MUST use repository-relative paths unless an external primary source is
  required.
- Documentation MUST distinguish verified facts from assumptions and MUST state remaining
  limitations or risks in the handoff.
- Documentation-system changes MUST pass `npm run docs:check` before handoff.
