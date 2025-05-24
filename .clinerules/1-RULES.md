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

### Effective Tool Selection

Analyze the capabilities of these tools to determine the most appropriate approach for your tasks.
