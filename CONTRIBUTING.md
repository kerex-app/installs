# Contributing Install Packages

Thanks for contributing to the Kerex install catalog!

## Creating a new install package

1. **Use the visual editor** at [install.kerex.app/editor](https://install.kerex.app/editor) (recommended)
2. Or create a JSON file manually in the `configs/` directory

## Config format

Each config is a JSON file with this structure:

```json
{
  "id": "my-package",
  "name": "Install My Package",
  "description": "What this package does.",
  "variables": {
    "branch_name": "my-package/setup",
    "commit_message": "Add My Package",
    "pr_title": "Add My Package",
    "pr_body": "PR description in markdown"
  },
  "steps": [
    { "id": "clone", "name": "Cloning repository", "action": "clone_repo" },
    { "id": "branch", "name": "Creating branch", "action": "git", "params": ["checkout", "-b", "{{ branch_name }}"] },
    { "id": "config", "name": "Writing config", "action": "write_file", "params": { "path": ".config.json", "content": "{}\n" } },
    { "id": "stage", "name": "Staging", "action": "git", "params": ["add", "."] },
    { "id": "commit", "name": "Committing", "action": "git", "params": ["commit", "-m", "{{ commit_message }}"] },
    { "id": "push", "name": "Pushing", "action": "push" },
    { "id": "pr", "name": "Creating PR", "action": "create_pr", "params": { "title": "{{ pr_title }}", "body": "{{ pr_body }}" } }
  ],
  "outputs": [
    { "type": "text", "value": "Done!" },
    { "type": "link", "href": "{{ steps.pr.pr_url }}", "text": "View Pull Request" }
  ]
}
```

## Available actions

| Action | Params | Description |
|--------|--------|-------------|
| `clone_repo` | none | Clone the target repository |
| `git` | `string[]` | Run a git command |
| `npx` | `string[]` | Run an npx command |
| `write_file` | `{ path, content }` | Write a file |
| `push` | none | Push the current branch |
| `create_pr` | `{ title, body }` | Open a pull request |

## Variables

Use `{{ variable_name }}` in step params to reference variables. Standard variables:
- `branch_name` - Branch to create
- `commit_message` - Commit message
- `pr_title` - Pull request title
- `pr_body` - Pull request body (markdown)

## Validation

Run `npm run validate` to check all configs. The CI will also validate on PRs.

## Review process

1. Submit your config (via editor or manual PR)
2. CI validates the config schema
3. A maintainer reviews the steps and content
4. Once approved, the config goes live in the install catalog
