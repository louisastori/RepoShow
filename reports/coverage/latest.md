# RepoShow AI Coverage Report

- Generated at: 2026-04-21T06:22:41.6197985+02:00
- Ollama model: gemma4:26b
- Command: npm run coverage
- Success: True
- Thresholds: line 100%, branch 100%, function 100%
- Result: line 100%, branch 100%, function 100%

## Files

- `src/manifest-validator.mjs`: line 100%, branch 100%, function 100%, uncovered ``

- `test/manifest-validator.test.mjs`: line 100%, branch 100%, function 100%, uncovered ``

## Coverage Output

```text
> reposhow@0.1.0 coverage
> node --test --experimental-test-coverage test/manifest-validator.test.mjs

TAP version 13
# Subtest: accepts a valid project manifest
ok 1 - accepts a valid project manifest
  ---
  duration_ms: 1.888
  type: 'test'
  ...
# Subtest: returns the manifest when assertion succeeds
ok 2 - returns the manifest when assertion succeeds
  ---
  duration_ms: 0.1553
  type: 'test'
  ...
# Subtest: rejects a non-object manifest
ok 3 - rejects a non-object manifest
  ---
  duration_ms: 0.2102
  type: 'test'
  ...
# Subtest: rejects cookies as a demo data mode
ok 4 - rejects cookies as a demo data mode
  ---
  duration_ms: 0.1971
  type: 'test'
  ...
# Subtest: rejects non-array tags and stack values
ok 5 - rejects non-array tags and stack values
  ---
  duration_ms: 0.1041
  type: 'test'
  ...
# Subtest: rejects non-boolean featured values
ok 6 - rejects non-boolean featured values
  ---
  duration_ms: 0.0949
  type: 'test'
  ...
# Subtest: rejects non-object android configuration
ok 7 - rejects non-object android configuration
  ---
  duration_ms: 0.1804
  type: 'test'
  ...
# Subtest: requires APK asset pattern when Android support is enabled
ok 8 - requires APK asset pattern when Android support is enabled
  ---
  duration_ms: 0.2159
  type: 'test'
  ...
# Subtest: throws a readable validation error
ok 9 - throws a readable validation error
  ---
  duration_ms: 0.525
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 108.205
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

## Gemma Coverage Review

1. **Verdict coverage** : ✅ Pass
2. **Seuils demandés / valeurs obtenues** : Lignes/Branches/Fonctions : 100% / 100%
3. **Lignes non couvertes** : Aucune
4. **Tests à ajouter** : Aucun nécessaire
5. **Commandes à relancer** : `npm run coverage`
6. **Décision Git** : ✅ Push autorisé
