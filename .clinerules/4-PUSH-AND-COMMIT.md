# Push and Commit Guidelines

## Trigger

This procedure is initiated when the user issues the prompt "Push and commit our latest changes." following a successful development cycle.

### Steps

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
    Run the `git workflow` automation script using the command:

    ```bash
    bash ./scripts/git-workflow.sh
    ```
