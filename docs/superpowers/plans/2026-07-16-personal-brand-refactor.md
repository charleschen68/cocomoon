# Personal Brand Site Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn cocomoon-tech.com into a personal brand homepage + technical blog: revamped homepage, new consulting page, richer projects portfolio, updated nav.

**Architecture:** Incremental enhancement within the existing Next.js 15 App Router + Contentlayer2 architecture. All placeholder copy lives in `data/` files (`servicesData.ts`, `heroContent.ts`, `projectsData.ts`); page components only render data. No contentlayer, CSP, or build-pipeline changes. No new dependencies.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, Tailwind CSS 4, Contentlayer2, pliny utilities.

**Spec:** `docs/superpowers/specs/2026-07-16-personal-brand-refactor-design.md`

## Global Constraints

- All invented copy must be prefixed `[PLACEHOLDER]` so the user can find and replace it later.
- Visual style: reuse existing typography/color classes (gray scale, `text-primary-500` links, `divide-y` section separators). No new dependencies, no new fonts, no gradients.
- Prettier style: no semicolons, single quotes, 100-char width, 2-space indent (auto-enforced by pre-commit hooks).
- Import paths use `@/` aliases (`@/components/...`, `@/data/...`).
- Keep Timothy Lin's copyright line in `LICENSE` intact.
- There is no test suite. Every task verifies with `npm run lint` and/or `npm run build`; final task does a full build + page walkthrough.
- Digest detection rule (exact): title lowercased starts with `ai builders digest` OR slug starts with `ai-builders-digest`.
- Consulting CTA email: `admin@cocomoon-tech.com` (read from `siteMetadata.email`).

---

### Task 1: License line + navigation links

**Files:**
- Modify: `LICENSE:3`
- Modify: `data/headerNavLinks.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: nav entries `/projects` and `/consulting` (Task 3 creates the `/consulting` route; `/projects` already exists).

- [ ] **Step 1: Append copyright line to LICENSE**

Change lines 1–3 of `LICENSE` from:

```
MIT License

Copyright (c) 2021-2025 Timothy Lin
```

to:

```
MIT License

Copyright (c) 2021-2025 Timothy Lin
Copyright (c) 2026 Charles Chen
```

Do not modify any other line.

- [ ] **Step 2: Update headerNavLinks.ts**

Replace the entire contents of `data/headerNavLinks.ts` with:

```ts
const headerNavLinks = [
  { href: '/', title: 'Home' },
  { href: '/blog', title: 'Blog' },
  { href: '/projects', title: 'Projects' },
  { href: '/consulting', title: 'Consulting' },
  { href: '/tags', title: 'Tags' },
  { href: '/about', title: 'About' },
]

export default headerNavLinks
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: exits 0 (warnings about unrelated files are acceptable; no errors in `data/headerNavLinks.ts`).

- [ ] **Step 4: Commit**

```bash
git add LICENSE data/headerNavLinks.ts
git commit -m "Add own copyright line and enable Projects/Consulting nav"
```

Note: the nav now points at `/consulting`, which 404s until Task 3. That is acceptable on this branch; Task 6 verifies the full site before publishing.

---

### Task 2: Placeholder content data files (`servicesData.ts`, `heroContent.ts`)

**Files:**
- Create: `data/servicesData.ts`
- Create: `data/heroContent.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (used by Tasks 3 and 5):
  - `servicesData: Service[]` (default export of `data/servicesData.ts`) where `Service = { id: string; name: string; blurb: string; description: string; capabilities: string[] }`
  - `howIWork: { step: string; detail: string }[]` (named export of `data/servicesData.ts`)
  - `heroContent: { name: string; tagline: string; intro: string }` (default export of `data/heroContent.ts`)

- [ ] **Step 1: Create `data/servicesData.ts`**

```ts
export interface Service {
  id: string
  name: string
  blurb: string
  description: string
  capabilities: string[]
}

const servicesData: Service[] = [
  {
    id: 'distributed-systems',
    name: 'High-Performance Distributed Systems',
    blurb:
      '[PLACEHOLDER] Architecture and tuning for systems that stay fast and correct under real-world load.',
    description:
      '[PLACEHOLDER] I help teams design, review, and optimize distributed systems — from consensus and replication strategy to tail-latency hunting in production. Replace this paragraph with your real positioning and 1-2 proof points.',
    capabilities: [
      '[PLACEHOLDER] Architecture design and review',
      '[PLACEHOLDER] Performance profiling and tail-latency reduction',
      '[PLACEHOLDER] Scalability and capacity planning',
      '[PLACEHOLDER] Reliability engineering and failure-mode analysis',
    ],
  },
  {
    id: 'realtime-data',
    name: 'Real-Time Data Infrastructure',
    blurb:
      '[PLACEHOLDER] Streaming pipelines and storage layers built for low latency and high throughput.',
    description:
      '[PLACEHOLDER] I build and operate real-time data platforms — event streaming, stream processing, and the serving layers on top. Replace this paragraph with your real positioning and 1-2 proof points.',
    capabilities: [
      '[PLACEHOLDER] Streaming pipeline design (Kafka, Flink, etc.)',
      '[PLACEHOLDER] Real-time analytics and serving layers',
      '[PLACEHOLDER] Exactly-once processing and data correctness',
      '[PLACEHOLDER] Cost and throughput optimization',
    ],
  },
  {
    id: 'ai-data-processing',
    name: 'AI-Driven Data Processing',
    blurb:
      '[PLACEHOLDER] Data platforms and pipelines that put LLMs and ML to work on production data.',
    description:
      '[PLACEHOLDER] I design data processing systems that integrate AI — LLM-powered enrichment, embedding pipelines, and the infrastructure to run them reliably at scale. Replace this paragraph with your real positioning and 1-2 proof points.',
    capabilities: [
      '[PLACEHOLDER] LLM-powered data enrichment pipelines',
      '[PLACEHOLDER] Embedding and vector search infrastructure',
      '[PLACEHOLDER] Evaluation and quality monitoring for AI pipelines',
      '[PLACEHOLDER] Batch-to-real-time AI inference architecture',
    ],
  },
]

export const howIWork = [
  {
    step: 'Scope',
    detail:
      '[PLACEHOLDER] A short call to understand your system, constraints, and what success looks like.',
  },
  {
    step: 'Engage',
    detail:
      '[PLACEHOLDER] Focused engagement — architecture review, hands-on build, or embedded advisory.',
  },
  {
    step: 'Deliver',
    detail:
      '[PLACEHOLDER] Concrete deliverables: designs, working code, runbooks, and a clear handoff.',
  },
]

export default servicesData
```

- [ ] **Step 2: Create `data/heroContent.ts`**

```ts
const heroContent = {
  name: 'Charles Chen',
  tagline:
    '[PLACEHOLDER] I build high-performance distributed systems and real-time data infrastructure.',
  intro:
    '[PLACEHOLDER] Engineer and consultant focused on distributed systems, real-time data, and AI-driven data processing. Replace this with 2-3 sentences about your background and what readers will find here.',
}

export default heroContent
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add data/servicesData.ts data/heroContent.ts
git commit -m "Add placeholder services and hero content data"
```

---

### Task 3: Consulting page

**Files:**
- Create: `app/consulting/page.tsx`

**Interfaces:**
- Consumes: `servicesData` + `howIWork` from `@/data/servicesData` (Task 2), `genPageMetadata` from `app/seo`, `siteMetadata.email`.
- Produces: route `/consulting` with anchor ids `#distributed-systems`, `#realtime-data`, `#ai-data-processing` (Task 5's homepage cards link to these).

- [ ] **Step 1: Create `app/consulting/page.tsx`**

```tsx
import Link from '@/components/Link'
import servicesData, { howIWork } from '@/data/servicesData'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Consulting',
  description:
    'Consulting in high-performance distributed systems, real-time data infrastructure, and AI-driven data processing.',
})

export default function Consulting() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Consulting
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          [PLACEHOLDER] I help teams build and operate systems that are fast, correct, and reliable
          at scale.
        </p>
      </div>
      <div className="divide-y divide-gray-200 py-6 dark:divide-gray-700">
        {servicesData.map((service) => (
          <section key={service.id} id={service.id} className="scroll-mt-24 py-10">
            <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {service.name}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{service.description}</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-gray-500 dark:text-gray-400">
              {service.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="py-10">
        <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          How I work
        </h2>
        <ol className="mt-6 space-y-6">
          {howIWork.map((item, index) => (
            <li key={item.step} className="flex gap-4">
              <span className="text-primary-500 text-lg font-bold">{index + 1}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.step}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="py-10">
        <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Work with me
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          [PLACEHOLDER] Have a project in mind or want a second opinion on your architecture?
        </p>
        <Link
          href={`mailto:${siteMetadata.email}`}
          className="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 mt-6 inline-block rounded-md px-6 py-3 font-medium text-white"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page builds and renders**

Run: `npm run build`
Expected: build succeeds; route list includes `/consulting`.

- [ ] **Step 3: Commit**

```bash
git add app/consulting/page.tsx
git commit -m "Add consulting page with services, process, and mailto CTA"
```

---

### Task 4: Projects portfolio (data model + card chips + page copy)

**Files:**
- Modify: `data/projectsData.ts` (full rewrite)
- Modify: `components/Card.tsx` (add optional `techStack` chips)
- Modify: `app/projects/page.tsx:15-17,21-28` (subtitle + pass `techStack`)

**Interfaces:**
- Consumes: existing `Card` component props (`title`, `description`, `imgSrc`, `href`).
- Produces: `Project = { title: string; description: string; href?: string; imgSrc?: string; techStack?: string[]; year?: string; role?: string; highlights?: string[] }`; `Card` accepts optional `techStack?: string[]`.

- [ ] **Step 1: Rewrite `data/projectsData.ts`**

```ts
interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
  techStack?: string[]
  year?: string
  role?: string
  highlights?: string[]
}

const projectsData: Project[] = [
  {
    title: '[PLACEHOLDER] Real-Time Analytics Platform',
    description: `[PLACEHOLDER] A streaming analytics platform processing millions of events per
    second. Replace with a real project: what it does, the scale it runs at, and your role.`,
    techStack: ['Kafka', 'Flink', 'ClickHouse'],
    year: '2025',
    role: 'Architect & Lead Engineer',
    href: 'https://example.com',
  },
  {
    title: '[PLACEHOLDER] Distributed Storage Engine',
    description: `[PLACEHOLDER] A horizontally scalable storage engine with strong consistency
    guarantees. Replace with a real project: what it does, the scale it runs at, and your role.`,
    techStack: ['Rust', 'Raft', 'RocksDB'],
    year: '2024',
    role: 'Core Contributor',
    href: 'https://example.com',
  },
  {
    title: '[PLACEHOLDER] LLM Data Enrichment Pipeline',
    description: `[PLACEHOLDER] An AI-driven pipeline that classifies and enriches unstructured
    data at scale. Replace with a real project: what it does, the scale it runs at, and your role.`,
    techStack: ['Python', 'Claude API', 'Airflow'],
    year: '2026',
    role: 'Designer & Builder',
    href: 'https://example.com',
  },
]

export default projectsData
```

Note: `year`, `role`, `highlights` are part of the data model for future use; the card renders `techStack` chips now and ignores the rest (YAGNI on extra card layout until real content exists).

- [ ] **Step 2: Add `techStack` chips to `components/Card.tsx`**

Replace the entire contents of `components/Card.tsx` with:

```tsx
import Image from './Image'
import Link from './Link'

const Card = ({ title, description, imgSrc, href, techStack }) => (
  <div className="md max-w-[544px] p-4 md:w-1/2">
    <div
      className={`${
        imgSrc && 'h-full'
      } overflow-hidden rounded-md border-2 border-gray-200/60 dark:border-gray-700/60`}
    >
      {imgSrc &&
        (href ? (
          <Link href={href} aria-label={`Link to ${title}`}>
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          </Link>
        ) : (
          <Image
            alt={title}
            src={imgSrc}
            className="object-cover object-center md:h-36 lg:h-48"
            width={544}
            height={306}
          />
        ))}
      <div className="p-6">
        <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {techStack && techStack.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
        {href && (
          <Link
            href={href}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
            aria-label={`Link to ${title}`}
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
    </div>
  </div>
)

export default Card
```

- [ ] **Step 3: Update `app/projects/page.tsx`**

Change the subtitle paragraph (lines 15–17) from:

```tsx
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Showcase your projects with a hero image (16 x 9)
          </p>
```

to:

```tsx
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            [PLACEHOLDER] Selected work in distributed systems, real-time data, and AI
            infrastructure.
          </p>
```

And change the `Card` invocation (lines 21–28) from:

```tsx
            {projectsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
```

to:

```tsx
            {projectsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
                techStack={d.techStack}
              />
            ))}
```

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add data/projectsData.ts components/Card.tsx app/projects/page.tsx
git commit -m "Extend projects portfolio with tech-stack chips and placeholder projects"
```

---

### Task 5: Homepage revamp

**Files:**
- Modify: `app/Main.tsx` (full rewrite)
- `app/page.tsx` needs no change (already passes all sorted posts).

**Interfaces:**
- Consumes: `heroContent` (Task 2), `servicesData` (Task 2), `/consulting` anchors (Task 3), existing `SocialIcon` from `@/components/social-icons`, `siteMetadata`, pliny `formatDate` and `NewsletterForm`.
- Produces: nothing consumed later.

- [ ] **Step 1: Rewrite `app/Main.tsx`**

```tsx
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import heroContent from '@/data/heroContent'
import servicesData from '@/data/servicesData'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_FEATURED = 3
const MAX_DIGEST = 5

function isDigest(post: { title: string; slug: string }) {
  return (
    post.title.toLowerCase().startsWith('ai builders digest') ||
    post.slug.startsWith('ai-builders-digest')
  )
}

export default function Home({ posts }) {
  const featured = posts.filter((post) => !isDigest(post)).slice(0, MAX_FEATURED)
  const digests = posts.filter((post) => isDigest(post)).slice(0, MAX_DIGEST)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Hero */}
      <div className="space-y-4 pt-10 pb-12">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {heroContent.name}
        </h1>
        <p className="text-xl leading-8 text-gray-700 dark:text-gray-300">{heroContent.tagline}</p>
        <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          {heroContent.intro}
        </p>
        <div className="flex space-x-4 pt-2">
          {siteMetadata.email && <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />}
          {siteMetadata.github && <SocialIcon kind="github" href={siteMetadata.github} />}
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/consulting"
            className="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 rounded-md px-5 py-2.5 font-medium text-white"
          >
            Consulting &rarr;
          </Link>
          <Link
            href="/blog"
            className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Read the blog
          </Link>
        </div>
      </div>

      {/* Services */}
      <div className="py-12">
        <h2 className="mb-8 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          What I do
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {servicesData.map((service) => (
            <Link
              key={service.id}
              href={`/consulting#${service.id}`}
              className="block rounded-md border-2 border-gray-200/60 p-6 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600"
            >
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{service.blurb}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured writing */}
      {featured.length > 0 && (
        <div className="py-12">
          <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Featured writing
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {featured.map((post) => {
              const { slug, date, title, summary, tags } = post
              return (
                <li key={slug} className="py-8">
                  <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-3 xl:col-span-3">
                      <div>
                        <h3 className="text-xl leading-7 font-bold tracking-tight">
                          <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                            {title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap">
                          {tags.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {summary}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
          <div className="text-base leading-6 font-medium">
            <Link
              href="/blog"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All posts"
            >
              All posts &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Daily digest */}
      {digests.length > 0 && (
        <div className="py-12">
          <h2 className="mb-6 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            AI Builders Digest
          </h2>
          <ul className="space-y-3">
            {digests.map((post) => (
              <li key={post.slug} className="flex flex-wrap items-baseline gap-x-4">
                <time
                  dateTime={post.date}
                  className="text-sm text-gray-500 tabular-nums dark:text-gray-400"
                >
                  {formatDate(post.date, siteMetadata.locale)}
                </time>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-medium text-gray-900 hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-400"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-base leading-6 font-medium">
            <Link
              href="/tags/ai-builders-digest"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All digests"
            >
              All digests &rarr;
            </Link>
          </div>
        </div>
      )}

      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify the homepage builds**

Run: `npm run build`
Expected: build succeeds, `/` route generated without errors.

- [ ] **Step 3: Commit**

```bash
git add app/Main.tsx
git commit -m "Revamp homepage with hero, services, featured writing, and digest strip"
```

---

### Task 6: Full verification walkthrough

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: verified working site.

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: contentlayer generates all documents, build completes, postbuild (RSS + search index) succeeds. Route list includes `/`, `/consulting`, `/projects`.

- [ ] **Step 2: Start dev server and walk through pages**

Run: `npm run dev` (background), then check each page returns 200 and contains expected content:

```bash
curl -s http://localhost:3000/ | grep -o 'Charles Chen' | head -1        # expect: Charles Chen
curl -s http://localhost:3000/ | grep -c 'AI Builders Digest'            # expect: >= 1
curl -s http://localhost:3000/consulting | grep -o 'How I work'          # expect: How I work
curl -s http://localhost:3000/consulting | grep -o 'id="distributed-systems"'  # expect match
curl -s http://localhost:3000/projects | grep -o 'ClickHouse'            # expect: ClickHouse
curl -s http://localhost:3000/tags/ai-builders-digest -o /dev/null -w '%{http_code}'  # expect: 200
```

Also verify nav links render on the homepage: `curl -s http://localhost:3000/ | grep -o 'Consulting' | head -1` → `Consulting`.

- [ ] **Step 3: Visual spot-check (user or screenshot)**

Open `http://localhost:3000/` in a browser: check hero, service cards, featured list excludes digests, digest strip shows 5 rows; toggle dark mode; click a service card → lands on the matching consulting section.

- [ ] **Step 4: Stop dev server**

Kill the background dev server process.

No commit in this task. Publishing (`npm run pub`) is deliberately left to the user.
