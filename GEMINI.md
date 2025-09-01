# Project Overview

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

## Installation Workflow

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

## Package Manager

This project uses **pnpm** as the Node.js package manager. Always use `pnpm` commands instead of `npm` or `yarn`.

### Common Commands

- **Install dependencies**: `pnpm install`
- **Add new dependency**: `pnpm add <package-name>`
- **Add development dependency**: `pnpm add -D <package-name>`
- **Remove dependency**: `pnpm remove <package-name>`
- **Run scripts**: `pnpm run <script-name>` or `pnpm <script-name>`
- **Update dependencies**: `pnpm update`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Astro checks
- `pnpm format` - Format code with Prettier
- `pnpm workflow` - Run git workflow script
- `pnpm sync` - Sync with main branch
- `pnpm deploy` - Deploy to production

### Why pnpm?

- **Disk efficiency**: Shared dependencies across projects
- **Speed**: Faster installations than npm/yarn
- **Strict**: Better dependency resolution
- **Workspace support**: Excellent monorepo capabilities

## Development Workflow

### Development Server Assumption

**Always assume the development server is running** unless explicitly told otherwise. The development server is typically started with `pnpm dev` and runs on `http://localhost:4321` for Astro projects.

### Post-Iteration Testing

After completing any successful development iteration (code changes, feature additions, bug fixes), **immediately initiate testing** to verify the changes work as expected. This includes:

- **Functional Testing**: Verify the implemented features work correctly
- **UI/UX Testing**: Check visual elements, responsiveness, and user interactions
- **Integration Testing**: Ensure new changes don't break existing functionality
- **Performance Testing**: Confirm changes don't negatively impact site performance

Testing should be done proactively without waiting for user prompts, as part of the standard development cycle quality assurance.

## Push and Commit Guidelines

### Trigger

This procedure is initiated when the user issues the prompt "Push and commit our latest changes." following a successful development cycle.

#### Steps

1.  **Initialize Commit Message File**:
    Clear the contents of the @/lib/documents/commit-message.txt file.

2.  **Verify Codebase Status**:

    Query the current status of the codebase using your `git_status` MCP server with the following request body:

        ```json
        {
          "repo_path": "/Users/macbookpro/GitHub/budgetbee"
        }
        ```

3.  **Formulate Commit Message**:

    Populate the @/lib/documents/commit-message.txt file with a message that accurately describes the latest modifications.

4.  **Execute Workflow Script**:
    Run the `pnpm workflow` command to execute the workflow automation script.
