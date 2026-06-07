# draft.ps1 — Run Drafter on ONE card.
# Picks the topmost card with `Status: drafting` in blog-ideas.md, writes a full blog post,
# pushes it to Sanity as a draft, updates the card to `Status: drafted`, then stops.
# Run this script repeatedly to draft multiple posts — one per run, by design.
#
# Usage:  .\scribe\draft.ps1   (from the repo root, in PowerShell)

$ErrorActionPreference = "Stop"
$scribeDir = $PSScriptRoot

$prompt       = Get-Content "$scribeDir\draft.md"          -Raw
$manifest     = Get-Content "$scribeDir\projects.json"     -Raw
$backlog      = Get-Content "$scribeDir\blog-ideas.md"     -Raw
$cardTemplate = Get-Content "$scribeDir\card-template.md"  -Raw

$context = @"
# Card template (the format every card follows)

$cardTemplate

---

# Current backlog — find the topmost card with Status: drafting and process ONLY that one card

$backlog

---

# Project manifest — read each project's local path with your file tools

$manifest

---

# Drafter prompt — your operating instructions

$prompt
"@

claude --permission-mode acceptEdits $context
