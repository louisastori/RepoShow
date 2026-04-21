# RepoShow

RepoShow is a lightweight tool for turning a developer's GitHub organization into a living project portfolio.

The core idea is simple: every project stays in its own repository, while RepoShow reads only metadata, releases, APK assets, screenshots, and optional `reposhow.json` manifests. The portfolio repository stays small because it does not clone or host every project.

## Goals

- Build one central portfolio from many GitHub repositories.
- Keep each project independent instead of forcing a monorepo.
- Show recruiters useful signals quickly: purpose, stack, status, demo link, repo link, latest update, and downloadable APK when available.
- Prefer static output so the public site can be hosted on GitHub Pages, Netlify, Vercel, or any static host.
- Keep demo data simple: embedded JSON, `localStorage`, IndexedDB, or SQLite depending on the app. Cookies are not used as a database.

## MVP Scope

1. Scan repositories from a configured GitHub user or organization.
2. Read an optional `reposhow.json` file from each repository.
3. Merge that manifest with GitHub metadata such as description, topics, timestamps, and releases.
4. Generate a small `projects.json` catalog.
5. Render a static portfolio from the catalog.
6. Detect Android APK assets from GitHub releases.

## Repository Layout

```text
openspec/                 Product and technical specifications
schemas/                  JSON schemas for RepoShow manifest files
examples/                 Example manifest files used for validation
src/                      Initial project scripts
.github/workflows/        CI checks
```

## Project Manifest

Repositories can opt in to better presentation by adding a `reposhow.json` file at their root. See [examples/reposhow.project.json](examples/reposhow.project.json).

```json
{
  "$schema": "https://reposhow.dev/schemas/reposhow-project.schema.json",
  "schemaVersion": "0.1.0",
  "title": "Mini CRM",
  "summary": "A small CRM demo for freelance client tracking.",
  "status": "active",
  "featured": true,
  "tags": ["crm", "demo"],
  "stack": ["React", "Node.js", "SQLite"],
  "dataMode": "sqlite"
}
```

## Development

```bash
npm install
npm run validate
```

At this stage the project is intentionally specification-first. Implementation should follow the OpenSpec files in [openspec](openspec).

## Prototype

The Stitch mockup has been reproduced as a static prototype in [prototype/index.html](prototype/index.html).

It includes:

- the RepoShow landing view
- the internal dashboard
- the Mini CRM project detail view

Open the HTML file directly in a browser or run:

```bash
npm run prototype:check
```

## Local AI Quality Loop

RepoShow can run a local quality pass with Ollama and write the result to disk.

Prerequisites:

- Ollama installed locally.
- The `gemma4:26b` model available in Ollama.
- Node.js 20 or newer.

Run:

```powershell
npm run quality:ai
```

The command:

1. Starts Ollama if the API is not already responding.
2. Runs validation, unit tests, coverage, and OpenSpec validation.
3. Writes the latest report to `reports/quality/latest.md` and `reports/quality/latest.json`.
4. Sends the report to Gemma so it can recommend which tests to strengthen next.

To include cloned repositories stored in `repo/`, run:

```powershell
.\scripts\run-ai-quality.ps1 -IncludeClonedRepos
```

Gemma is used as a reviewer. It does not write code or push to Git automatically.

For a coverage-only pass with AI review and strict 100% thresholds:

```powershell
npm run coverage:ai
```

That command writes `reports/coverage/latest.md` and `reports/coverage/latest.json`. You can lower thresholds when needed:

```powershell
.\scripts\run-ai-coverage.ps1 -MinLinePercent 90 -MinBranchPercent 85 -MinFunctionPercent 90
```
