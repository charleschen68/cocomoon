# Personal Brand Site Refactor — Design

**Date:** 2026-07-16
**Status:** Approved by user

## Goal

Evolve cocomoon-tech.com from a plain blog into a personal brand homepage + technical blog for Charles Chen, showcasing consulting services in three areas: high-performance distributed systems, real-time data infrastructure, and AI-driven data processing.

## Decisions (from requirements discussion)

- **Positioning:** personal brand homepage, technical blog as the core content.
- **Scope:** homepage revamp, projects portfolio, consulting/services page.
- **Content strategy:** scaffold first — all copy is clearly-marked placeholder (`[PLACEHOLDER]`), to be replaced with real info later. Placeholder copy is centralized in `data/` files so replacement never touches page components.
- **Visual style:** restrained/professional — extend the existing minimal typography system (same fonts, gray scale, spacing, primary color). No new dependencies.
- **Homepage articles:** original posts and AI Builders Digest posts shown separately.
- **Consulting CTA:** `mailto:admin@cocomoon-tech.com`. No booking calendar, no contact form.
- **Approach:** incremental enhancement within the existing architecture (approach A). No changes to contentlayer config, CSP, or build pipeline.

## License compliance

Project is MIT-licensed, copyright Timothy Lin 2021–2025 (Tailwind Nextjs Starter Blog v2 template). Keep the `LICENSE` file and Timothy Lin's copyright line intact; append `Copyright (c) 2026 Charles Chen`. No visible site attribution is required by MIT.

## Design

### 1. Homepage (`app/Main.tsx` rewrite; `app/page.tsx` passes data)

Four sections, top to bottom:

1. **Hero** — name "Charles Chen", one-line positioning statement (placeholder, e.g. "I build high-performance distributed systems and real-time data infrastructure"), 2–3 sentence intro, social icons (reuse existing `SocialIcon` component), two buttons: `Consulting →` and `Read the blog`.
2. **Services cards** — three cards (High-Performance Distributed Systems / Real-time Data Infrastructure / AI-Driven Data Processing), one-line blurb each, linking to the consulting page's anchor sections. Data comes from the new `data/servicesData.ts`, shared with the consulting page — edit once, both pages update.
3. **Featured writing** — latest 3 non-digest posts. Digest detection is a single `isDigest(post)` helper: title or slug starts with "AI Builders Digest" / "ai-builders-digest".
4. **Daily Digest strip** — latest 5 digest posts as compact one-line rows (date + title), with an "All digests →" link to the digest tag page.

### 2. Consulting page (new `app/consulting/page.tsx`)

- Page header: title + positioning line (placeholder).
- Three service sections with anchor ids: service name, one paragraph description, 3–4 capability/deliverable bullets — all placeholder copy living in `data/servicesData.ts`.
- Short "How I work" section: 3 steps (placeholder).
- CTA button: `mailto:admin@cocomoon-tech.com`.
- SEO metadata via existing `genPageMetadata`.

### 3. Projects portfolio (`data/projectsData.ts` + projects page)

- Extend the `Project` interface: `techStack?: string[]`, `year?: string`, `role?: string`, `highlights?: string[]`.
- Card component displays tech-stack chips.
- Replace the template's Google/Time Machine placeholders with 2–3 structurally complete example projects clearly marked `[PLACEHOLDER]`.

### 4. Navigation & compliance

- `data/headerNavLinks.ts`: enable Projects, add Consulting → `Home / Blog / Projects / Consulting / Tags / About`.
- `LICENSE`: append `Copyright (c) 2026 Charles Chen` under Timothy Lin's line.

## Error handling

- Homepage sections degrade gracefully: if no non-digest posts exist, the featured section shows nothing rather than erroring; same for the digest strip.
- Consulting anchors are plain fragment links — no JS required.

## Testing / verification

No test suite exists in this project. Verification is:

1. `npm run build` passes (includes contentlayer generation and postbuild).
2. Local dev walkthrough of every changed page: `/`, `/consulting`, `/projects`, nav links, light/dark themes.

## Out of scope

- Real copy for services, hero, and projects (user will supply later).
- Contact form, booking calendar, newsletter changes.
- Contentlayer document-type changes, CSP changes, build pipeline changes.
- Restructuring of blog/tags/about pages.
