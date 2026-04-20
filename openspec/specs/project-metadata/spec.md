# Project Metadata Specification

## Purpose

Define the project manifest used to enrich a GitHub repository for portfolio display.

## Requirements

### Requirement: Project manifest schema

RepoShow SHALL support a root-level `reposhow.json` manifest validated against `schemas/reposhow-project.schema.json`.

#### Scenario: Valid manifest

- **GIVEN** a repository contains a valid `reposhow.json`
- **WHEN** RepoShow reads the repository
- **THEN** the manifest fields are merged into the project catalog entry

#### Scenario: Invalid manifest

- **GIVEN** a repository contains an invalid `reposhow.json`
- **WHEN** RepoShow validates the manifest
- **THEN** the repository remains discoverable
- **AND** the project entry includes a validation warning

### Requirement: Project status

RepoShow SHALL classify each project as `active`, `maintenance`, `experimental`, or `archived`.

#### Scenario: Archived GitHub repository

- **GIVEN** GitHub reports a repository as archived
- **WHEN** no manifest status overrides it
- **THEN** RepoShow marks the project as `archived`

### Requirement: Demo data mode

RepoShow SHALL expose the demo storage mode for each project.

#### Scenario: Demo uses local data

- **GIVEN** a manifest sets `dataMode` to `sqlite`
- **WHEN** the project card is rendered
- **THEN** RepoShow can display that the demo uses local SQLite data

### Requirement: Cookie exclusion

RepoShow SHALL NOT use cookies as a database mode for demo data.

#### Scenario: Unsupported cookie storage

- **GIVEN** a manifest attempts to set `dataMode` to `cookies`
- **WHEN** RepoShow validates the manifest
- **THEN** validation fails for that field
