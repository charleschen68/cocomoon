# Design Records

**Owner:** Repository maintainer

**Review trigger:** Review when the record lifecycle, template requirements, or design ownership
model changes.

This directory holds accepted design records, proposals under review, and
architectural decision records. These records explain why a significant change
was chosen, the alternatives considered, and the conditions for its safe
delivery.

## Creating and Maintaining Records

Create each new record with the filename format
`YYYY-MM-DD-topic-design.md`, replacing `topic` with a descriptive kebab-case
name. Start from [the design record template](TEMPLATE.md)
and keep the record focused on one decision or a tightly related set of
decisions.

Use these statuses as the record evolves:

1. `Proposed` — under review; it is not an approved basis for implementation.
2. `Approved` — accepted decision; implementation has not yet been completed.
3. `Implemented` — the approved decision has been delivered and validated.
4. `Superseded` — replaced by a newer record.

Valid transitions are `Proposed` → `Approved` → `Implemented`; a record in
`Proposed`, `Approved`, or `Implemented` may transition to `Superseded` when a
newer record replaces it. A `Superseded` record is historical and does not
transition again. When superseding a record, update the superseded record with
a repository-relative link to its replacement, and have the replacement link
back to the record it supersedes.

Update this index whenever a record is added or its status changes. Do not
rewrite a historical record solely to reflect a later decision beyond its
status and replacement link; create the newer record and link the relationship
instead.

## Index

| Date       | Record                                                                       | Status      |
| ---------- | ---------------------------------------------------------------------------- | ----------- |
| 2026-07-31 | [Production Documentation System](2026-07-31-documentation-system-design.md) | Implemented |

## Template

Use [TEMPLATE.md](TEMPLATE.md) for new design and architectural decision
records.
