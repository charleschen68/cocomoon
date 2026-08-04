# Operational Wiki

**Owner:** Repository maintainer

**Review trigger:** Review when the wiki lifecycle, verification rules, ownership model, or
template changes.

This directory is the home for verified developer setup instructions, publishing procedures,
troubleshooting guides, and operational runbooks for this repository.

Every wiki page must identify an accountable individual owner, an optional team, an escalation
contact, and a `Last reviewed` date. Review pages whenever the underlying system, access model, or
procedure changes; stale pages must be updated, marked superseded, or retired.

Use one of these statuses on every page:

- `draft` — under development and not reliable for operational use. It may preserve a proposed
  procedure for review only when the procedure is clearly marked `Proposed procedure — do not
execute`.
- `verified` — reviewed against the stated environment and eligible to contain executable
  procedures.
- `superseded` — replaced by a newer page and retained only for history. Historical procedures
  may remain only beneath a `Historical procedure — do not execute` banner and a link to the
  replacement when one exists.
- `retired` — no longer maintained or valid. Historical procedures may remain only beneath a
  `Historical procedure — do not execute` banner.

Only `verified` pages may present procedures as executable. Draft proposals and preserved
historical procedures are review material, not operational instructions, even when they show
commands. Do not present unverified, inferred, incomplete, superseded, or retired instructions as
executable production procedures. A verified page must record its evidence, environment, scope,
and limitations in the verification section.

Start new pages from the [wiki template](TEMPLATE.md). The
[root README](../README.md) contains upstream starter setup guidance, not authoritative publishing
constraints. No verified publishing runbook exists in this wiki until one is added and marked
`verified`; repository helper scripts are not a substitute for a verified runbook.
