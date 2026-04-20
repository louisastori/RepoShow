# Initial MVP Design

## Architecture

RepoShow is built around a static-generation pipeline:

1. Load configuration for a GitHub owner.
2. Discover repositories with the GitHub API.
3. Read optional `reposhow.json` files from repository roots.
4. Merge manifests, GitHub metadata, and release metadata.
5. Write a normalized catalog.
6. Render a static portfolio.

## Data Sources

- GitHub repository metadata: name, URL, description, topics, timestamps, archived state.
- GitHub contents API: root-level `reposhow.json`.
- GitHub releases API: latest release and downloadable assets.

## Manifest Rules

Manifest values override inferred GitHub values when present. Invalid manifests should not remove a project from discovery; they should produce warnings and fall back to available GitHub metadata.

## Hosting

The MVP targets static hosts. GitHub Pages is the baseline deployment target, but the generated site should also work on Netlify or Vercel.

## Demo Data Policy

Project demos should use embedded JSON, `localStorage`, IndexedDB, or SQLite. Cookies are intentionally excluded because they are size-limited, awkward for structured data, and sent with HTTP requests.
