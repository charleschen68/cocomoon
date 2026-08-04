# Production Documentation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish an English, production-grade documentation system for safe repository changes, durable design decisions, and operational knowledge.

**Architecture:** `Instructions.md` is the repository-wide entry point, linked prominently from the root README, and links to the standards, design index, wiki index, and existing repository guidance. `PROJECT_STANDARDS.md` holds enforceable engineering requirements; `design/` stores decision records and `wiki/` stores verified operational knowledge. The directory indexes contain reusable templates and ownership rules. A standard-library Node.js command validates local links and required documentation structure.

**Tech Stack:** Markdown, Next.js 15 repository conventions, npm validation.

## Global Constraints

- Preserve and do not edit existing `AGENTS.md`, `CLAUDE.md`, or user-created blog content. Limit the root `README.md` change to the required prominent link to `Instructions.md`.
- Write all new documents in English using repository-relative Markdown links.
- Do not claim unverified production procedures or create deployment instructions.
- Do not manually edit generated Contentlayer output or search assets; no build regeneration is expected for this documentation-only change.
- Run `npm run docs:check` and `npm run lint` before handoff.
- Do not commit or push unless the user explicitly requests it.

---

### Task 1: Create the repository instruction entry point

**Files:**

- Create: `Instructions.md`

**Interfaces:**

- Consumes: Existing repository guidance in `AGENTS.md`, `CLAUDE.md`, and `README.md`.
- Produces: A stable starting point linking to `PROJECT_STANDARDS.md`, `design/README.md`, and `wiki/README.md`.

- [ ] **Step 1: Write `Instructions.md`**

Include these sections: purpose and precedence; repository map; mandatory change workflow; validation matrix; content and generated-file boundaries; security and dependency limits; delivery checklist; linked references. State exact validation commands: `npm run lint` for every change and `npm run build` for route, Contentlayer, MDX-rendering, or build-script changes.

- [ ] **Step 2: Inspect instruction links and requirements**

Run: `rg -n '\]\(([^)]+)\)|npm run (lint|build)' Instructions.md`

Expected: links target the three new documents and existing repository guidance; both validation commands are stated.

### Task 2: Define enforceable engineering standards

**Files:**

- Create: `PROJECT_STANDARDS.md`

**Interfaces:**

- Consumes: Current stack and coding conventions from `AGENTS.md` and `CLAUDE.md`.
- Produces: A reviewable, normative standard referenced by `Instructions.md`.

- [ ] **Step 1: Write `PROJECT_STANDARDS.md`**

Use mandatory language for TypeScript and React, Next.js and Contentlayer, accessibility, security, performance, dependencies, observability, testing, code review, and documentation maintenance. Require targeted validation for critical paths; because no test suite exists, require a documented repeatable manual check when automated coverage is not practical.

- [ ] **Step 2: Check that standards are actionable**

Run: `rg -n 'MUST|MUST NOT|SHOULD|TODO|TBD' PROJECT_STANDARDS.md`

Expected: requirements use `MUST`, `MUST NOT`, or `SHOULD`; no `TODO` or `TBD` marker appears.

### Task 3: Establish the design-record area

**Files:**

- Create: `design/README.md`
- Create: `design/TEMPLATE.md`

**Interfaces:**

- Consumes: Approved design record at `design/2026-07-31-documentation-system-design.md`.
- Produces: An indexed, repeatable format for future design and architectural decisions.

- [ ] **Step 1: Write the design index**

State that `design/` holds accepted design records, proposals under review, and architectural decision records. Define filename format as `YYYY-MM-DD-<topic>-design.md`; state status transitions (`Proposed`, `Approved`, `Implemented`, `Superseded`) and require updating the index when a record is added or superseded. Link the existing documentation-system design record and the template.

- [ ] **Step 2: Write the design template**

Include mandatory sections: status, owner, problem, context, goals, non-goals, decision, alternatives with trade-offs, consequences, implementation outline, rollout, validation, rollback, security/performance/accessibility considerations, and references.

- [ ] **Step 3: Verify the design area**

Run: `rg -n '2026-07-31-documentation-system-design.md|TEMPLATE.md|Status|Rollback' design/README.md design/TEMPLATE.md`

Expected: the index links both required files and the template contains status and rollback requirements.

### Task 4: Establish the operational wiki area

**Files:**

- Create: `wiki/README.md`
- Create: `wiki/TEMPLATE.md`

**Interfaces:**

- Consumes: Repository setup and operational constraints in `README.md` and `CLAUDE.md`.
- Produces: An indexed, safe format for verified how-to and troubleshooting documentation.

- [ ] **Step 1: Write the wiki index**

Define the wiki as the home for verified developer setup instructions, publishing procedures, troubleshooting, and operational runbooks. Require a named owner and a `Last reviewed` date for each page. State that unverified procedures must not be presented as executable production instructions. Link to the template.

- [ ] **Step 2: Write the wiki template**

Include front matter fields for title, owner, status, last reviewed, and audience. Include sections for purpose, prerequisites, procedure, verification, failure handling, recovery or rollback, security considerations, related links, and change history.

- [ ] **Step 3: Verify wiki safeguards**

Run: `rg -n 'Last reviewed|Prerequisites|Verification|Failure Handling|Recovery|verified' wiki/README.md wiki/TEMPLATE.md`

Expected: the index and template require review freshness, verification, and safe recovery guidance.

### Task 5: Run documentation quality checks

**Files:**

- Verify: `Instructions.md`
- Verify: `PROJECT_STANDARDS.md`
- Verify: `design/README.md`
- Verify: `design/TEMPLATE.md`
- Verify: `wiki/README.md`
- Verify: `wiki/TEMPLATE.md`

**Interfaces:**

- Consumes: All files produced by Tasks 1 through 4.
- Produces: Evidence that the documentation set is internally consistent and meets repository validation rules.

- [ ] **Step 1: Scan for unresolved placeholders and malformed patch whitespace**

Run: `rg -n 'TODO|TBD|PLACEHOLDER' Instructions.md PROJECT_STANDARDS.md design wiki; git diff --check -- Instructions.md PROJECT_STANDARDS.md design wiki`

Expected: no matches and no whitespace errors.

- [ ] **Step 2: Check all local Markdown links**

Run: `npm run docs:check`

Expected: every local link resolves from the file that contains it and required metadata and sections are present.

- [ ] **Step 3: Run the required repository validation**

Run: `npm run lint`

Expected: command exits successfully. If it reports pre-existing errors outside these documents, report them separately and do not modify unrelated code.

- [ ] **Step 4: Inspect the final scope**

Run: `git status --short; git diff --check`

Expected: only the planned documentation files plus the user's pre-existing untracked files are present; no whitespace errors are reported.
