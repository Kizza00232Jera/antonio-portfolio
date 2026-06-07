# scout.ps1 — Run Scout: read all projects in projects.json, append new blog idea cards
# to blog-ideas.md. Picky by design. See scout.md for the contract.
#
# Usage:  pwsh scribe/scout.ps1
# Or:     .\scribe\scout.ps1   (from repo root, PowerShell)

$ErrorActionPreference = "Stop"
$scribeDir = $PSScriptRoot

$prompt       = Get-Content "$scribeDir\scout.md"          -Raw
$manifest     = Get-Content "$scribeDir\projects.json"     -Raw
$backlog      = Get-Content "$scribeDir\blog-ideas.md"     -Raw
$cardTemplate = Get-Content "$scribeDir\card-template.md"  -Raw

$context = @"
# Card template (the format every card must follow)

$cardTemplate

---

# Current backlog (do NOT duplicate or re-propose any of these — every status, including killed, is off-limits)

$backlog

---

# Project manifest — read each project's local path with your file tools

$manifest

---

# Scout prompt — your operating instructions

$prompt
"@

claude --permission-mode acceptEdits $context
