# RepoShow Project Context

## Product Vision

RepoShow helps solo developers and small teams present many small GitHub projects as one credible, always-current portfolio.

The portfolio repository must stay lightweight. RepoShow reads project metadata from GitHub and optional `reposhow.json` files instead of copying every project into one large folder.

## Target Users

- Developers who have several small projects spread across repositories.
- Recruiters or clients who need to understand project quality quickly.
- Developers who publish Android APK demos through GitHub Releases.

## Core Decisions

- One repository per project remains the default organization model.
- One separate repository hosts RepoShow and the generated portfolio.
- GitHub is the first source of truth for repository names, descriptions, topics, timestamps, and releases.
- A root-level `reposhow.json` file can override or enrich GitHub metadata.
- Public hosting should require only one static site deployment.
- Demo data should use embedded JSON, `localStorage`, IndexedDB, or SQLite. Cookies are excluded as a data store.

## Out Of Scope For MVP

- Hosting every project inside the portfolio repository.
- Requiring every web project to have its own GitHub Pages deployment.
- Full backend hosting for demos.
- Private repository scanning without an explicit GitHub token.
- AI-generated project descriptions.
