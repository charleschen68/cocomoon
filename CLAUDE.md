# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15 + React 19 blogging site** built on the Tailwind Nextjs Starter Blog v2 template. It uses the Next.js App Router with React Server Components, Contentlayer2 for MDX content management, and Tailwind CSS 4 for styling. The site serves as a personal/technical blog focused on distributed systems and AI infrastructure.

## Key Directories

- `app/` — Next.js App Router pages, layouts, and API routes (app layout, page, blog, tags, projects, about, api)
- `components/` — Reusable React components (MDXComponents, Card, Header, Footer, Comments, etc.)
- `data/` — Content sources: `blog/` (MDX posts), `authors/` (author MDX files), `siteMetadata.js`, `projectsData.ts`, `headerNavLinks.ts`, `references-data.bib`
- `layouts/` — Page layout templates (PostLayout, PostSimple, PostBanner, ListLayoutWithTags, AuthorLayout)
- `css/` — Tailwind stylesheet (`tailwind.css`) and Prism code highlighting (`prism.css`)
- `scripts/` — Build scripts (`postbuild.mjs`, `rss.mjs`, `pub.sh`)
- `public/` — Static assets (images, favicons, `search.json`)
- `faq/` — FAQ markdown files

## Architecture

- **Root layout** (`app/layout.tsx`) sets up the font (Space Grotesk), theme providers, analytics, search provider (kbar), Header, and Footer.
- **Content pipeline**: Contentlayer2 reads MDX from `data/blog/` and `data/authors/`, generating typed content objects (`contentlayer/generated`). The `contentlayer.config.ts` defines Blog and Authors document types with computed fields (readingTime, slug, path, toc, structuredData).
- **Pages**: `app/page.tsx` (home with blog listing), `app/blog/[...slug]/page.tsx` (dynamic blog posts), `app/tags/[tag]/page.tsx` (tag pages), `app/projects/page.tsx`, `app/about/page.tsx`.
- **MDX rendering**: `components/MDXComponents.tsx` provides custom components (Image, CustomLink, TOCInline, Pre, TableWrapper, BlogNewsletterForm) passed to MDXContent.
- **SEO**: `app/sitemap.ts` and `app/robots.ts` generate dynamically from siteMetadata.
- **Search**: kbar command palette with local search index generated at build time.
- **Comments**: giscus (configurable via env vars in `.env.example`).
- **Analytics**: Umami (primary), with Plausible, Simple Analytics, Posthog, Google Analytics options.

## Development Commands

```bash
npm install          # Install dependencies
npm dev              # Start dev server (localhost:3000)
npm build            # Production build + RSS feed generation
npm start            # Start production server
npm serve            # Same as start
npm lint             # ESLint with auto-fix across app, components, layouts, scripts
npm analyze          # Build with bundle analyzer (ANALYZE=true)
npm pub              # Run publish script (scripts/pub.sh)
```

For static export (GitHub Pages, S3, etc.):

```bash
EXPORT=1 UNOPTIMIZED=1 npm build    # Static export without image optimization
EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/myblog npm build  # With base path
```

## Code Style

- **TypeScript/JS mixed**: `tsconfig.json` uses path aliases (`@/components/*`, `@/data/*`, `@/layouts/*`, `@/css/*`). Mixed .js/.ts/.tsx files — ESLint config ignores prop-types (uses TypeScript).
- **Prettier**: no semicolons, single quotes, 100 char print width, 2-space indent, trailing commas, Tailwind plugin sorts classes.
- **ESLint**: flat config, extends next/core-web-vitals, @typescript-eslint, jsx-a11y, prettier. `@typescript-eslint/no-unused-vars` and `react/prop-types` are off.
- **Tailwind CSS 4**: uses `@tailwindcss/postcss` plugin. Styles in `css/tailwind.css`.
- **MDX posts**: frontmatter follows Hugo's standard (title, date, tags, lastmod, draft, summary, images, authors, layout, canonicalUrl). Draft posts are filtered in production.
- **Import paths**: use `@/` aliases (e.g., `@/components/Header`, `@/data/siteMetadata`).

## Adding Content

- **Blog posts**: Add MDX files to `data/blog/`. Frontmatter fields: `title`, `date`, `tags`, `lastmod`, `draft`, `summary`, `images`, `authors`, `layout`, `canonicalUrl`.
- **Authors**: Add MDX files to `data/authors/`. File name maps to the `authors` field in post frontmatter.
- **Site config**: Modify `data/siteMetadata.js` for site-wide settings (title, analytics, comments, search, newsletter).
- **Navigation**: Modify `data/headerNavLinks.ts` to update nav links.
- **Projects**: Modify `data/projectsData.ts` for the projects page.

## Configuration Highlights

- **CSP**: Defined in `next.config.js` — update to add external services (analytics, comments).
- **Security headers**: Applied in production via `async headers()` in `next.config.js` (skipped during static export).
- **ContentSecurityPolicy**: default-src self, allows giscus.app, umami.is for scripts/frames.
- **Image optimization**: remote patterns include `picsum.photos`. Set `UNOPTIMIZED=1` for static exports or alternative providers (Imgix, Cloudinary).
- **Code highlighting**: rehype-prism-plus with default language `js`. Styles in `css/prism.css`.
- **Math support**: KaTeX via rehype-katex.
- **Citations**: rehype-citation from `data/references-data.bib`.
