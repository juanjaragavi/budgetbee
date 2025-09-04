# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BudgetBee is an Astro-based financial information platform focused on the US market, providing unbiased financial guidance, budgeting tips, and personalized credit card recommendations through interactive quizzes.

## Essential Commands

### Package Manager - pnpm (REQUIRED)

This project uses **pnpm** — always use pnpm instead of npm/yarn:

```bash
# Setup
pnpm install          # Install dependencies

# Development
pnpm dev              # Start dev server at http://localhost:4321
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm format           # Format with Prettier (.prettierrc, Astro plugin)
pnpm check            # Run Astro/TS checks

# Git Workflow
pnpm workflow         # Execute git workflow automation
pnpm sync             # Sync with main branch
pnpm deploy-project   # Deploy to production (note: rules doc says 'deploy', script here is 'deploy-project')
```

### Development Server

- **Default port**: <http://localhost:4321>
- **Always assume the dev server is running** unless told otherwise
- Hot module replacement enabled for Astro, MDX, and React components

## Architecture

### Tech Stack

- **Framework**: Astro 5.x with MDX support
- **UI**: React 19 for interactive components (quiz system, recommender)
- **Styling**: Tailwind CSS v4 with typography and forms plugins
- **Fonts**: Montserrat (custom font via astro-font)
- **Search**: Fuse.js for client-side content search
- **Email**: Nodemailer for contact form submissions
- **Animation**: Framer Motion for UI transitions

### Content Structure

```mermaid
src/content/
├── blog/              # General blog metadata
├── contact/           # Contact page content
├── personal-finance/  # TOFU content (educational articles)
└── financial-solutions/ # MOFU/BOFU content (product reviews)
```

### Key Components & Pages

```mermaid
src/pages/
├── index.astro                      # Homepage with latest articles
├── blog/index.astro                 # Main blog hub (aggregates content)
├── personal-finance/index.astro     # TOFU content listing
└── financial-solutions/index.astro  # MOFU/BOFU content listing
```

### Pagination System

- Main blog: `/blog/page/[slug].astro`
- Personal finance: `/personal-finance/page/[slug].astro`
- Financial solutions: `/financial-solutions/page/[slug].astro`

## Content Creation Workflow

### Blog Post Generation

When creating new articles:

1. Review `lib/documents/blog-post-generation-prompt.md` for content rules
2. Check `lib/documents/topfinanzas-us-topic-outline.csv` for article type (pillar/cluster)
3. Verify existing content via `dist/sitemap-index.xml` to avoid duplicates
4. Use US English (en-US) with budgetbeepro.com domain for internal links
5. Place TOFU content in `src/content/personal-finance/`

### Required Frontmatter

```yaml
---
title: "Article Title"
description: "Meta description"
date: 2025-08-27T10:00:00Z # ISO format required
categories: ["category-name"]
---
```

### Post-Creation Verification

New articles must appear in:

1. Homepage latest articles section (top 3)
2. Main blog hub `/blog/`
3. Category-specific index pages
4. Pagination systems
5. Category filtering pages

Common issues preventing visibility:

- Future publication dates (filtered out)
- Invalid ISO date format
- Incorrect category names
- Missing required frontmatter fields
- Wrong content directory placement

## Git Workflow & Deployment

### Push and Commit Process

When prompted "Push and commit our latest changes":

1. Clear `lib/documents/commit-message.txt`
2. Check git status for changes
3. Write descriptive commit message to file
4. Execute `pnpm workflow`

### Deployment Scripts

- `scripts/git-workflow.sh` - Automated commit and push
- `scripts/sync-main.sh` - Sync with main branch
- `scripts/deploy.sh` - Production deployment
- `scripts/validate-sitemap.sh` - Sitemap validation

## Project-Specific Rules

### Documentation Updates

- Update `src/lib/documents/DOCUMENTATION.md` for feature changes
- Maintain changelog in `/CHANGELOG.md`
- Create ADRs in `src/lib/documents/ADRs.md` for major decisions

### Planning & Tasks

- Read `2-PLANNING.md` at conversation start for context
- Update `3-TASKS.md` before starting new work
- Follow `4-PUSH-AND-COMMIT.md` for git guidelines
- Reference `5-BRANDING.md` for brand consistency

### Development Assumptions

- Dev server is always running unless explicitly stated
- Test immediately after code changes (functional, UI/UX, integration, performance)
- Use Astro docs at <https://docs.astro.build> for framework questions

## Critical Paths & Utilities

### Content Parser (`src/lib/contentParser.astro`)

- `getSinglePage()` - Primary content fetching function
- `sortByDate()` - Chronological sorting utility
- Handles both MDX and Markdown content

### Blog Manager (`src/lib/blogManager.ts`)

- Aggregates content from multiple collections
- Provides unified interface for blog listings
- Handles category filtering and pagination

### Configuration

- Main config: `src/config/config.json`
- Site URL: <https://budgetbeepro.com> (driven by config.json; overridden in astro.config.mjs)
- Sitemap: Advanced serialization/filtering in `astro.config.mjs`
- MDX imports: Auto-import shortcodes (Button, Accordion, Notice, Video, Youtube, Tabs, Tab)
- TypeScript path aliases (tsconfig.json): `@/components/*`, `@/shortcodes/*`, `@/helpers/*`, `@/partials/*`, `@/* -> src/*`

## Testing & Validation

- Unit tests: Not configured in this repository (no Jest/Vitest/Cypress). Running a single test is not applicable.

### Type Checking

```bash
pnpm check  # TypeScript and Astro checks
```

### Build Validation

```bash
pnpm build && pnpm preview  # Test production build locally
```

### Sitemap Validation

```bash
./scripts/validate-sitemap.sh  # Verify sitemap integrity
```
