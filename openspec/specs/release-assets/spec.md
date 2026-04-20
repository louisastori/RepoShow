# Release Assets Specification

## Purpose

Define how RepoShow discovers release versions and Android APK downloads.

## Requirements

### Requirement: Latest release metadata

RepoShow SHALL read latest release metadata for each included repository when available.

#### Scenario: Repository has a release

- **GIVEN** a repository has a GitHub Release
- **WHEN** RepoShow builds the project catalog
- **THEN** the catalog records the release tag, release URL, published date, and release name when available

### Requirement: APK asset detection

RepoShow SHALL detect Android APK assets from GitHub Releases when a project enables Android metadata.

#### Scenario: APK asset exists

- **GIVEN** a manifest enables Android support
- **AND** the latest release contains an asset matching `apkAssetPattern`
- **WHEN** RepoShow builds the catalog
- **THEN** the project entry includes a downloadable APK URL

### Requirement: Missing APK fallback

RepoShow SHALL keep projects visible when no APK is found.

#### Scenario: Android project has no release APK

- **GIVEN** a manifest enables Android support
- **AND** no release asset matches the APK pattern
- **WHEN** RepoShow renders the project card
- **THEN** it does not show an APK download action
- **AND** it records a non-blocking warning in build output
