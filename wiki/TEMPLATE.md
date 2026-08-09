# Wiki Page Template

**Owner:** Repository maintainer

**Review trigger:** Review when wiki metadata, lifecycle rules, or required runbook sections
change.

Copy the following front matter into a new page and replace each descriptive value:

```yaml
---
title: Runbook or guide title
owner: Accountable individual or team
team: Optional owning team
escalation_contact: Named person, team, or on-call route
status: draft
last reviewed: YYYY-MM-DD
audience: Intended readers
---
```

# Runbook or Guide Title

Keep `Last reviewed` current whenever the documented system, access model, or procedure changes.
Allowed status values are `draft`, `verified`, `superseded`, and `retired`. Only a `verified` page
may present a procedure as executable. A draft may include review material beneath this exact
banner:

> **Proposed procedure — do not execute.**

A superseded or retired page may retain a prior procedure only beneath this exact banner:

> **Historical procedure — do not execute.**

When a page is superseded, place a repository-relative link to its replacement beside the banner.

## Purpose

State the problem this page solves, its scope, and when readers should use it.

## Prerequisites

- List the required access, tools, environment, and approvals.
- Link to the source of truth for any configuration or policy.
- Do not assume production access or secrets are available.

## Procedure

On a `verified` page, document only steps verified for the stated environment. On a `draft` page,
clearly mark proposed steps with the non-executable proposal banner. On a `superseded` or `retired`
page, keep any historical steps only with the non-executable historical banner. Identify commands,
values, and decisions that the operator must supply.

## Verification

Describe the expected observable result, how to check it, and the evidence that confirms success.

## Failure Handling

List likely failures, their safe stopping points, diagnostic signals, and escalation owner or path.
Do not continue when verification fails or the system state is uncertain.

## Recovery or Rollback

Describe verified recovery or rollback steps, including the point at which to stop and escalate if
recovery cannot be safely completed.

## Security Considerations

Record access controls, secret-handling requirements, data sensitivity, audit requirements, and any
security review needed before use.

## Related Links

- [Repository README](../README.md)
- [Repository guidance](../CLAUDE.md)

## Change History

| Date       | Owner             | Change       |
| ---------- | ----------------- | ------------ |
| YYYY-MM-DD | Accountable owner | Created page |
