## Project Overview

This project is a website built with the AstroJS framework. It is a content-focused site, likely a blog or marketing website, that uses Markdown and MDX for content creation. The project is configured to use React for interactive components and Tailwind CSS for styling.

## Key Technologies

    ***Framework:** AstroJS
    ***UI Library:** React (for interactive components)
    ***Styling:** Tailwind CSS
    ***Package Manager:** pnpm
    ***Content:** Markdown and MDX

## Project Structure

    * `rc/content/`: Contains the content for the website, organized into collections (e.g.~`, `blog`, `pages`).
    * `src/components/`: Contains reusable UI components, including both Astro components (`.astro`) and React components (`.tsx`, `.jsx`).
    * `src/layouts/`: Defines the overall page structure and layout for different types of pages.
    * `rc/pages/`: Defines the routes for the website. Astro uses a file-based routing system.
    * `astro.config.mjs`: The main configuration file for the Astro project.
    * `package.json`: Defines the project's dependencies and scripts.
    * `pnpm-lock.yaml`: The lock file for the pnpm package manager.

## Development Workflow

    ***Install dependencies:** `pnpm install`   
    ***Run the development server:** `pnpm dev`
    ***Build the project for production:** `pnpm build`
    ***Format the code:** `pnpm format`   
    ***Check for type errors:** `pnpm check`

## Content Management

Content is managed through Mardown (`.md`) and MDX (`.mdx`) files in the `src/content/` directory. MDX allows for the use of React components directly within the content files, providing a powerful way to create dynamic and interactive content.

## Architectural Notes

    * The project uses Astro's "islands" architecture, where interactive components (in this case, React components) are loaded individually, keeping the rest of the site as static HTML. This results in faster page loads and better performance.
    * The project uses Astro's content collections feature to manage and query the content from the `src/content/` directory.
    * The `astro.config.mjs` file is the central point for configuring the project's integrations, such as sitemaps, MDX, and Tailwind CSS.