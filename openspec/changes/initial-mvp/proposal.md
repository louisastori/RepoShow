# Initial MVP Proposal

## Why

Developers often have many small projects that are hard for recruiters to evaluate. A single portfolio should summarize those projects without moving all source code into one large repository.

## What Changes

- Add a GitHub repository scanner.
- Add support for a `reposhow.json` project manifest.
- Generate a normalized `projects.json` catalog.
- Build a static portfolio from that catalog.
- Detect latest releases and APK assets.
- Add CI validation for manifest examples and specs.

## Impact

- Introduces the first user-facing RepoShow workflow.
- Establishes the project manifest contract.
- Keeps deployment simple: one portfolio site, many source repositories.
