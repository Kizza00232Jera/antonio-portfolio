---
title: Update author document in Sanity with real contact data via MCP
type: AFK
priority: high
---

## Problem

The author document (ID: `465cfecb-034a-4f5c-8717-8fd37e61b172`) is missing phone numbers, email, GitHub URL, and LinkedIn URL. Issue 021 adds these fields to the schema — this issue fills in the real values using the Sanity MCP.

## Desired behaviour

The author document contains all contact details so the frontend can source everything from Sanity.

## How to do it

Use the Sanity MCP to patch the author document. The MCP is available as `mcp__Sanity__*` tools in your session.

Use the Sanity MCP to run a GROQ mutation / patch on document ID `465cfecb-034a-4f5c-8717-8fd37e61b172` with these field values:

| Field | Value |
|---|---|
| `phoneCroatian` | `+385915124000` |
| `phoneSwedish` | `+46784248374` |
| `email` | `antonio.jera10@gmail.com` |
| `githubUrl` | `https://github.com/Kizza00232Jera` |
| `linkedinUrl` | `https://www.linkedin.com/in/antonio00232/` |

After patching, read the document back and verify all five fields are set correctly.

## Acceptance criteria

- [x] Author document `phoneCroatian` = `+385915124000`
- [x] Author document `phoneSwedish` = `+46784248374`
- [x] Author document `email` = `antonio.jera10@gmail.com`
- [x] Author document `githubUrl` = `https://github.com/Kizza00232Jera`
- [x] Author document `linkedinUrl` = `https://www.linkedin.com/in/antonio00232/`
- [x] Verified by reading the document back via MCP after patching

## Out of scope

- Do not touch any other documents.
- Do not make any code changes — this is a data-only task.

## Notes

Project ID: `b7ue5jlq`, dataset: `production`.
This issue makes no code changes and has no commit. Move the issue file to `issues/done/` when the patch is verified.

## Blocked by

- Issue 021 (schema must be deployed before the new fields exist)
