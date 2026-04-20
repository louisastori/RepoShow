# Static Portfolio Specification

## Purpose

Define the generated portfolio experience and hosting model.

## Requirements

### Requirement: Static catalog output

RepoShow SHALL generate a static `projects.json` catalog from GitHub and manifest metadata.

#### Scenario: Catalog generation

- **GIVEN** discovered repositories with metadata
- **WHEN** RepoShow runs the build step
- **THEN** it writes a normalized project catalog
- **AND** the catalog contains no full source-code copies from project repositories

### Requirement: Project card content

RepoShow SHALL render a portfolio card for each included project.

#### Scenario: Recruiter scans projects

- **GIVEN** a project catalog entry
- **WHEN** the portfolio renders the project list
- **THEN** the card shows title, summary, stack, status, repository link, last update, and available demo or APK actions

### Requirement: Project details

RepoShow SHALL render a details page or section for each project.

#### Scenario: User opens project details

- **GIVEN** a project has screenshots, description, release data, and links
- **WHEN** a visitor opens its detail view
- **THEN** RepoShow displays that richer project information in one place

### Requirement: Single site deployment

RepoShow SHALL support deploying only the portfolio site.

#### Scenario: Projects are not individually deployed

- **GIVEN** several repositories have no live demo URL
- **WHEN** the portfolio is deployed
- **THEN** those projects still appear with repository links, screenshots, status, and metadata
