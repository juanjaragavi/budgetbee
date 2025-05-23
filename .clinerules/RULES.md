# Project Guidelines

## Documentation Requirements

- Update relevant documentation in src/lib/documents/DOCUMENTATION.md when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md

## Project Awareness & Context

- Always read `PLANNING.md` at the start of a new conversation to understand the project's architecture, goals, style, and constraints.

## Architecture Decision Records

Create ADRs in src/lib/documents/ADRs.md for:

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
