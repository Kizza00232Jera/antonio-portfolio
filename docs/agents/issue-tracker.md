# Issue tracker

Issues are stored as local markdown files in the `issues/` directory at the repo root.

Completed issues are moved to `issues/done/`.

## Reading issues

```bash
cat issues/*.md
```

## Creating an issue

Create a new file: `issues/<short-slug>.md`

Use the template at `ralph/issue-template.md`.

## Completing an issue

Move the file:

```bash
mv issues/<slug>.md issues/done/<slug>.md
```

## Label meanings

- `type: AFK` — Ralph can complete this autonomously, no human input needed
- `type: HITL` — requires a human decision before implementation
- `priority: high` — pick this before lower priority tasks
- `priority: normal` — standard priority
- `priority: low` — pick last
