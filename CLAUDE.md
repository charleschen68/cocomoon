# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15 + React 19 blogging site** built on the Tailwind Nextjs Starter Blog v2 template. It uses the Next.js App Router with React Server Components, Contentlayer2 for MDX content management, and Tailwind CSS 4 for styling. The site serves as a personal/technical blog focused on distributed systems and AI infrastructure.

## Key Directories

- `app/` — Next.js App Router pages, layouts, and API routes (app layout, page, blog, tags, projects, about, api)
- `components/` — Reusable React components (MDXComponents, Card, Header, Footer, Comments, etc.)
- `data/` — Content sources: `blog/` (`.md` posts, processed through the MDX pipeline so JSX components still work), `authors/` (author `.md` files), `siteMetadata.js`, `projectsData.ts`, `servicesData.ts` (consulting services, shared by homepage cards and `/consulting`), `heroContent.ts` (homepage hero copy), `headerNavLinks.ts`, `references-data.bib`. Copy still marked `[PLACEHOLDER]` is scaffold text awaiting real content — replace it in these data files, not in page components.
- `layouts/` — Page layout templates (PostLayout, PostSimple, PostBanner, ListLayoutWithTags, AuthorLayout)
- `css/` — Tailwind stylesheet (`tailwind.css`) and Prism code highlighting (`prism.css`)
- `scripts/` — Build scripts (`postbuild.mjs`, `rss.mjs`, `pub.sh`)
- `public/` — Static assets (images, favicons, `search.json`)
- `faq/` — FAQ markdown files

## Architecture

- **Root layout** (`app/layout.tsx`) sets up the font (Space Grotesk), theme providers, analytics, search provider (kbar), Header, and Footer.
- **Content pipeline**: Contentlayer2 reads `.md` files from `data/blog/` and `data/authors/` (via `filePathPattern: '**/*.md'`) and processes them through the `contentType: 'mdx'` pipeline, so JSX components still work in these `.md` files. It generates typed content objects (`contentlayer/generated`). The `contentlayer.config.ts` defines Blog and Authors document types with computed fields (readingTime, slug, path, toc, structuredData). Its `onSuccess` hook also generates `app/tag-data.json` (tag counts) and the local search index — do not edit those files by hand.
- **Pages**: `app/page.tsx` (home: hero, service cards, featured non-digest posts, AI Builders Digest strip — rendered by `app/Main.tsx`), `app/blog/[...slug]/page.tsx` (dynamic blog posts), `app/tags/[tag]/page.tsx` (tag pages), `app/projects/page.tsx`, `app/consulting/page.tsx` (services with anchor ids + mailto CTA), `app/about/page.tsx`.
- **MDX rendering**: `components/MDXComponents.tsx` provides custom components (Image, CustomLink, TOCInline, Pre, TableWrapper, BlogNewsletterForm) passed to MDXContent.
- **SEO**: `app/sitemap.ts` and `app/robots.ts` generate dynamically from siteMetadata.
- **Search**: kbar command palette with local search index generated at build time.
- **Comments**: giscus (configurable via env vars in `.env.example`).
- **Analytics**: Umami (primary), with Plausible, Simple Analytics, Posthog, Google Analytics options.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:3000); npm start does the same
npm run build            # Production build + postbuild (RSS feed, search index)
npm run serve            # Start production server
npm run lint             # ESLint with auto-fix across app, components, layouts, scripts
npm run analyze          # Build with bundle analyzer (ANALYZE=true)
npm run pub "message"    # Publish: prettier --write ., git commit --no-verify, git push
```

There is no test suite in this project.

**Publishing**: `npm run pub "commit message"` (requires the message argument) formats the entire repo with Prettier, commits with `--no-verify`, and pushes; Vercel then auto-builds and deploys to cocomoon-tech.com.

**Pre-commit hooks**: husky + lint-staged run ESLint (js/jsx/ts/tsx) and Prettier (plus json/css/md/mdx) on staged files for normal commits.

For static export (GitHub Pages, S3, etc.):

```bash
EXPORT=1 UNOPTIMIZED=1 npm run build    # Static export without image optimization
EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/myblog npm run build  # With base path
```

## Code Style

- **TypeScript/JS mixed**: `tsconfig.json` uses path aliases (`@/components/*`, `@/data/*`, `@/layouts/*`, `@/css/*`). Mixed .js/.ts/.tsx files — ESLint config ignores prop-types (uses TypeScript).
- **Prettier**: no semicolons, single quotes, 100 char print width, 2-space indent, trailing commas, Tailwind plugin sorts classes.
- **ESLint**: flat config, extends next/core-web-vitals, @typescript-eslint, jsx-a11y, prettier. `@typescript-eslint/no-unused-vars` and `react/prop-types` are off.
- **Tailwind CSS 4**: uses `@tailwindcss/postcss` plugin. Styles in `css/tailwind.css`.
- **Posts**: `.md` files (MDX-processed, so JSX components are allowed), frontmatter follows Hugo's standard (title, date, tags, lastmod, draft, summary, images, authors, layout, canonicalUrl). Draft posts are filtered in production.
- **Import paths**: use `@/` aliases (e.g., `@/components/Header`, `@/data/siteMetadata`).

## Adding Content

- **Blog posts**: Add `.md` files to `data/blog/`. Frontmatter fields: `title`, `date`, `tags`, `lastmod`, `draft`, `summary`, `images`, `authors`, `layout`, `canonicalUrl`.
- **Authors**: Add `.md` files to `data/authors/`. File name maps to the `authors` field in post frontmatter.
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
