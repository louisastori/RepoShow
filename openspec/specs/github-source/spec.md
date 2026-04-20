# GitHub Source Specification

## Purpose

Define how RepoShow discovers repositories and reads metadata without cloning or hosting every project.

## Requirements

### Requirement: Organization repository discovery

RepoShow SHALL scan repositories from a configured GitHub user or organization.

#### Scenario: Scan public repositories

- **GIVEN** a configured GitHub owner
- **WHEN** RepoShow runs discovery
- **THEN** it lists public repositories for that owner
- **AND** records each repository name, URL, description, topics, default branch, pushed timestamp, and archived state when available

### Requirement: Lightweight metadata retrieval

RepoShow SHALL retrieve only metadata files and API fields needed to build the portfolio catalog.

#### Scenario: Avoid cloning source code

- **GIVEN** a repository has a large source tree
- **WHEN** RepoShow reads that repository
- **THEN** it does not clone the full repository
- **AND** it attempts to read only the root-level `reposhow.json` file plus GitHub API metadata

### Requirement: Metadata precedence

RepoShow SHALL use explicit `reposhow.json` values before inferred GitHub values.

#### Scenario: Manifest overrides repository description

- **GIVEN** a repository description says `Old demo`
- **AND** its `reposhow.json` summary says `Modern CRM demo`
- **WHEN** RepoShow builds the project catalog
- **THEN** the catalog uses `Modern CRM demo` as the displayed summary

### Requirement: Missing manifest fallback

RepoShow SHALL still include repositories without `reposhow.json` when they pass filtering rules.

#### Scenario: Repository has no manifest

- **GIVEN** a public repository without `reposhow.json`
- **WHEN** RepoShow builds the catalog
- **THEN** it creates a minimal project entry from GitHub metadata
- **AND** marks the metadata source as inferred
