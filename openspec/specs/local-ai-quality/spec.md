# Local AI Quality Specification

## Purpose

Define the local Ollama-backed quality loop used to run tests, collect coverage, and ask an AI reviewer how to strengthen test coverage.

## Requirements

### Requirement: Ollama startup

RepoShow SHALL start or reuse a local Ollama API before requesting an AI review.

#### Scenario: Ollama is already running

- **GIVEN** the Ollama API responds on the configured host
- **WHEN** the quality loop starts
- **THEN** RepoShow reuses the running Ollama process
- **AND** does not start a duplicate process

#### Scenario: Ollama is stopped

- **GIVEN** the Ollama API does not respond
- **WHEN** the quality loop starts
- **THEN** RepoShow starts `ollama serve`
- **AND** waits until the API becomes available or a timeout is reached

### Requirement: Test and coverage execution

RepoShow SHALL run configured validation, test, coverage, and OpenSpec commands during the quality loop.

#### Scenario: RepoShow quality pass

- **GIVEN** RepoShow has npm scripts for validation, tests, and coverage
- **WHEN** the quality loop runs
- **THEN** it executes those commands
- **AND** records each command, exit code, duration, and output

### Requirement: Durable quality report

RepoShow SHALL write the latest quality pass to durable files in the repository.

#### Scenario: Quality report is generated

- **GIVEN** a quality loop has completed
- **WHEN** RepoShow writes the report
- **THEN** `reports/quality/latest.md` contains a human-readable report
- **AND** `reports/quality/latest.json` contains a structured report

### Requirement: AI test review

RepoShow SHALL ask the configured Ollama model to review the test and coverage report.

#### Scenario: Gemma reviews coverage

- **GIVEN** the configured model exists in Ollama
- **WHEN** RepoShow sends the quality report to the model
- **THEN** the AI response is stored in the durable report
- **AND** it recommends tests to add or strengthen

### Requirement: Controlled Git push

RepoShow SHALL NOT allow the local AI model to push Git changes automatically.

#### Scenario: AI recommends a commit

- **GIVEN** all quality commands pass
- **WHEN** the AI recommends committing or pushing changes
- **THEN** RepoShow records the recommendation
- **AND** leaves the actual Git commit and push under developer control
