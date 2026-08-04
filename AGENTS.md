# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 personal/technical blog using the App Router, React 19, Tailwind CSS, and Contentlayer2. Route pages, layouts, and API handlers live in `app/`; reusable UI is in `components/`; and page-level templates are in `layouts/`.

Content and site configuration live in `data/`: write posts in `data/blog/*.mdx`, author profiles in `data/authors/*.mdx`, and update navigation or shared copy in files such as `headerNavLinks.ts`, `heroContent.ts`, and `siteMetadata.js`. Put static images and favicons under `public/static/`. Do not manually edit generated `app/tag-data.json` or search output.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run dev` starts the local site at `http://localhost:3000`.
- `npm run lint` runs ESLint with auto-fixes across application code.
- `npm run build` creates a production build and generates RSS, tags, and search assets.
- `npm run serve` runs the built application locally.
- `npm run analyze` builds with the bundle analyzer enabled.

There is currently no automated test suite. For every change, run `npm run lint`; run `npm run build` when modifying routes, Contentlayer configuration, MDX rendering, or build scripts.

## Coding Style & Naming Conventions

Use TypeScript for new React code where practical and follow existing App Router conventions. Import local modules through the `@/` aliases, for example `@/components/Header`. Use PascalCase for React component files (`PostBanner.tsx`), camelCase for utilities/data fields, and kebab-case or descriptive filenames for content.

Prettier is authoritative: two spaces, single quotes, no semicolons, 100-character lines, and trailing commas where valid. The Tailwind Prettier plugin orders utility classes. Husky/lint-staged formats staged JS, TS, JSON, CSS, Markdown, and MDX files.

## Content and Configuration

New posts require MDX frontmatter such as `title`, `date`, `tags`, `summary`, and `draft`; keep `authors` aligned with a filename in `data/authors/`. Add images beneath `public/static/images/` and reference stable paths. Update `next.config.js` when introducing a new external image host or browser-facing integration so CSP and image settings remain correct.

## Commit & Pull Request Guidelines

Recent history uses brief imperative summaries, e.g. `Fix undefined class emitted by Card` or `Update CLAUDE.md docs`. Keep commits focused and describe the user-visible change. PRs should explain the change, link the relevant issue when available, list validation performed, and include screenshots for visual/UI updates. Do not use `npm run pub` unless you intend to format, commit, and push the repository.
