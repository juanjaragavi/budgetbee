# BudgetBee AI Coding Conventions

This document provides AI-driven guidance for developers working on the BudgetBee platform. It outlines the core architecture, key workflows, and established conventions to ensure consistency and efficiency.

## Core Architecture

BudgetBee is built on Astro.js and leverages a hybrid rendering model with both server-side and client-side components. The architecture is designed for performance, SEO, and maintainability.

- **Astro.js (`.astro` files)**: The foundation of the project, used for creating pages, layouts, and components. Astro components are server-rendered by default, providing excellent performance and SEO.
- **React (`.tsx` files)**: Used for interactive UI components that require client-side state management. These are integrated into Astro pages using the `@astrojs/react` integration.
- **Content Management**: Content is managed through Markdown (`.md`) and MDX (`.mdx`) files located in the `src/content/` directory. This approach allows for easy content updates and a separation of concerns between content and presentation.
- **Styling**: Tailwind CSS is used for styling, with custom configurations defined in `tailwind.config.js` and `src/styles/`.

### Key Directories

- `src/pages/`: Contains the main pages of the application, with each file representing a route.
- `src/layouts/`: Defines the overall structure of pages, such as `Base.astro` and `PostSingle.astro`.
- `src/components/`: Reusable UI components, organized by function (e.g., `analytics/`, `quiz/`, `ui/`).
- `src/content/`: Houses all content, categorized by type (e.g., `blog/`, `personal-finance/`).
- `src/lib/`: Shared utilities and business logic, including ad management and blog-related functions.

## Developer Workflows

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/juanjaragavi/budgetbee.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```

### Scripts and Automation

The `scripts/` directory contains several automation scripts for common development tasks:

- `generate-sitemap.js`: Generates the sitemap for SEO purposes.
- `fix-post-dates.js`: Corrects and standardizes dates in blog posts.
- `validate-canonical-urls.js`: Ensures all canonical URLs are correctly formatted.

### Ad Management

Ad integration is managed through the AdZep system, which is designed to prevent duplicate ad calls in the SPA-like environment.

- **Activation**: The `window.AdZepActivateAds()` function is called once per page load.
- **Components**:
  - `src/components/analytics/AdZepActivator.tsx`: A React component that handles ad activation.
  - `src/hooks/useAdZep.ts`: A React hook for interacting with the AdZep system.
  - `src/lib/adZepUtils.ts`: Utility functions for managing ad activation state.

## Conventions and Patterns

### Interactive Components

For interactive features, such as the credit card recommender, React components are used. These components are typically located in `src/components/quiz/` and are integrated into Astro pages.

- **State Management**: Client-side state is managed within React components using hooks like `useState` and `useEffect`.
- **Animations**: Framer Motion is used for animations to create a more engaging user experience.

### Content-Driven Pages

Blog posts and other content-heavy pages are generated from Markdown/MDX files. This allows for a clean separation of content from the presentation layer.

- **Frontmatter**: Metadata for each post (e.g., title, author, date) is defined in the frontmatter of the Markdown/MDX file.
- **Layouts**: The `PostSingle.astro` layout is used to render individual blog posts, ensuring a consistent look and feel.

### SEO and Performance

- **Sitemap**: The sitemap is automatically generated and configured in `astro.config.mjs` to ensure all pages are indexed by search engines.
- **Image Optimization**: Astro's built-in image optimization is used to serve optimized images in modern formats like WebP.
- **Prefetching**: Links are prefetched to provide a near-instantaneous navigation experience.

By adhering to these conventions, developers can contribute to the BudgetBee platform in a consistent and efficient manner, ensuring the continued quality and performance of the application.
