---
applyTo: "**"
---

# Project Guidelines

## Documentation Requirements

- Update relevant documentation in `src/lib/documents/DOCUMENTATION.md` when modifying features
- Keep `README.md` in sync with new capabilities
- Maintain changelog entries in `/CHANGELOG.md`

## Project Awareness & Context

- Always read `2-PLANNING.md` at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- Check and update `3-TASKS.md` before starting a new task. If the task isn’t listed, add it with a brief description and today's date.
- Refer to `4-PUSH-AND-COMMIT.md` for commit and push guidelines.
- Review `5-BRANDING.md` for branding guidelines, including color palette, typography, and voice/tone.

## Architecture Decision Records

Create ADRs in `src/lib/documents/ADRs.md` for:

- Major dependency changes
- Architectural pattern changes
- New integration patterns

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

## Code Style & Patterns

- Generate API clients using OpenAPI Generator
- Prefer composition over inheritance
- Use repository pattern for data access

## Testing Standards

- Unit tests required for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

## Tool Usage

A suite of MCP Server tools is available for your use. These tools should be employed as needed to perform various tasks.

### MCP Server Discovery

To identify available MCP Servers, utilize the `@modelcontextprotocol/server-filesystem` to read the configuration file located at:
`/Users/macbookpro/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

This will provide you with a complete list of configured MCP servers and their capabilities.

### Astro Project Documentation

As this is an Astro project, before executing any task related to the structure of the project, you should use the `@upstash/context7-mcp@latest` MCP server tool to look for Astro documentation in <https://docs.astro.build/en/getting-started/>. This will ensure you have the most up-to-date information about Astro's patterns, conventions, and best practices.

### Effective Tool Selection

Analyze the capabilities of these tools to determine the most appropriate approach for your tasks.

**Note**: When running any Node.js commands or scripts, always use `pnpm` instead of `npm` or `yarn` as this project uses pnpm as the package manager.

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

1. **Initialize Commit Message File**:
   Clear the contents of the @/lib/documents/commit-message.txt file.

2. **Verify Codebase Status**:
   Query the current status of the codebase using your `git_status` MCP server with the following request body:

   ```json
   {
     "repo_path": "/Users/macbookpro/GitHub/budgetbee"
   }
   ```

3. **Formulate Commit Message**:
   Populate the @/lib/documents/commit-message.txt file with a message that accurately describes the latest modifications.

4. **Execute Workflow Script**:
   Run the `pnpm workflow` command to execute the workflow automation script.
