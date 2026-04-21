# RepoShow Quality Report

- Generated at: 2026-04-21T05:39:40.8894495+02:00
- Ollama model: gemma4:26b
- Include cloned repos: False
- Success: True
- Failed commands: 0

## Commands

### RepoShow

#### manifest validation

- Command: `npm run validate`
- Exit code: 0
- Duration: 1.07s

```text
> reposhow@0.1.0 validate
> node ./src/validate-example.mjs

RepoShow example manifest is valid.
```

#### unit tests

- Command: `npm run test`
- Exit code: 0
- Duration: 1.05s

```text
> reposhow@0.1.0 test
> node --test test/manifest-validator.test.mjs

TAP version 13
# Subtest: accepts a valid project manifest
ok 1 - accepts a valid project manifest
  ---
  duration_ms: 1.6462
  type: 'test'
  ...
# Subtest: returns the manifest when assertion succeeds
ok 2 - returns the manifest when assertion succeeds
  ---
  duration_ms: 0.1725
  type: 'test'
  ...
# Subtest: rejects a non-object manifest
ok 3 - rejects a non-object manifest
  ---
  duration_ms: 0.1976
  type: 'test'
  ...
# Subtest: rejects cookies as a demo data mode
ok 4 - rejects cookies as a demo data mode
  ---
  duration_ms: 0.9082
  type: 'test'
  ...
# Subtest: requires APK asset pattern when Android support is enabled
ok 5 - requires APK asset pattern when Android support is enabled
  ---
  duration_ms: 0.2809
  type: 'test'
  ...
# Subtest: throws a readable validation error
ok 6 - throws a readable validation error
  ---
  duration_ms: 0.5523
  type: 'test'
  ...
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 91.5339
```

#### coverage

- Command: `npm run coverage`
- Exit code: 0
- Duration: 1.04s

```text
> reposhow@0.1.0 coverage
> node --test --experimental-test-coverage test/manifest-validator.test.mjs

TAP version 13
# Subtest: accepts a valid project manifest
ok 1 - accepts a valid project manifest
  ---
  duration_ms: 3.0464
  type: 'test'
  ...
# Subtest: returns the manifest when assertion succeeds
ok 2 - returns the manifest when assertion succeeds
  ---
  duration_ms: 0.1982
  type: 'test'
  ...
# Subtest: rejects a non-object manifest
ok 3 - rejects a non-object manifest
  ---
  duration_ms: 0.2194
  type: 'test'
  ...
# Subtest: rejects cookies as a demo data mode
ok 4 - rejects cookies as a demo data mode
  ---
  duration_ms: 0.204
  type: 'test'
  ...
# Subtest: requires APK asset pattern when Android support is enabled
ok 5 - requires APK asset pattern when Android support is enabled
  ---
  duration_ms: 0.1168
  type: 'test'
  ...
# Subtest: throws a readable validation error
ok 6 - throws a readable validation error
  ---
  duration_ms: 0.4614
  type: 'test'
  ...
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 104.9175
# start of coverage report
# -----------------------------------------------------------------------------
# file                         | line % | branch % | funcs % | uncovered lines
# -----------------------------------------------------------------------------
# src                          |        |          |         | 
#  manifest-validator.mjs      | 100.00 |   100.00 |  100.00 | 
# test                         |        |          |         | 
#  manifest-validator.test.mjs | 100.00 |   100.00 |  100.00 | 
# -----------------------------------------------------------------------------
# all files                    | 100.00 |   100.00 |  100.00 | 
# -----------------------------------------------------------------------------
# end of coverage report
```

#### openspec validation

- Command: `npx @fission-ai/openspec@latest validate --all`
- Exit code: 0
- Duration: 3.08s

```text
✓ spec/github-source
✓ change/initial-mvp
✓ spec/local-ai-quality
✓ spec/project-metadata
✓ spec/release-assets
✓ spec/static-portfolio
Totals: 6 passed, 0 failed (6 items)

- Validating...
```

## Gemma Review

Voici le rapport de qualité pour **RepoShow** :

1. **Verdict court**
   **Excellent.** Le dépôt est dans un état de stabilité parfaite avec une couverture maximale.

2. **Tests ou suites qui passent**
   * **Validation du manifeste** : `npm run validate` (Réussi).
   * **Tests unitaires** : 6/6 tests réussis (`npm run test`).
   * **Couverture de code** : 100% (Lignes, branches et fonctions) sur `manifest-validator.mjs` (`npm run coverage`).
   * **Validation OpenSpec** : 6/6 spécifications validées (`openspec validation`).

3. **Echecs ou manques de coverage**
   * Aucun échec détecté.
   * La couverture est actuellement de 100% sur le périmètre testé.

4. **Tests à ajouter en priorité**
   * Étant donné que le module `manifest-validator.mjs` est déjà totalement couvert, la priorité est d'étendre la suite de tests vers de nouveaux modules ou de nouveaux fichiers sources dès leur création pour maintenir ce standard de 100%.

5. **Commandes exactes à relancer**
   * `npm run validate`
   * `npm run test`
   * `npm run coverage`
   * `npx @fission-ai/openspec@latest validate --all`

6. **Recommendation Git**
   **Un commit et un push sont tout à fait raisonnables.** Le code est validé, testé et couvert.
