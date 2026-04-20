# Initial MVP Scope Delta

## ADDED Requirements

### Requirement: MVP end-to-end refresh

RepoShow SHALL support an end-to-end refresh from GitHub metadata to generated static portfolio output.

#### Scenario: Refresh portfolio from GitHub owner

- **GIVEN** a configured GitHub owner
- **WHEN** the refresh command runs
- **THEN** RepoShow discovers repositories
- **AND** reads available project manifests
- **AND** reads release metadata
- **AND** writes a normalized catalog
- **AND** renders a static portfolio from that catalog

### Requirement: Repository-size protection

RepoShow SHALL keep the portfolio repository small by avoiding full project copies.

#### Scenario: Large external project

- **GIVEN** an external project repository contains a large codebase
- **WHEN** RepoShow refreshes the portfolio
- **THEN** it stores only metadata, links, release references, and selected image references
- **AND** it does not copy the full external repository into the portfolio repository
