# RepoShow AI Coverage Report

- Generated at: 2026-04-21T06:48:41.9514686+02:00
- Ollama model: gemma4:26b
- Command: npm run coverage
- Success: True
- Thresholds: line 100%, branch 95%, function 100%
- Result: line 100%, branch 97.1%, function 100%

## Files

- `src/manifest-validator.mjs`: line 100%, branch 100%, function 100%, uncovered ``

- `src/project-catalog.mjs`: line 100%, branch 95,6%, function 100%, uncovered ``

- `test/manifest-validator.test.mjs`: line 100%, branch 100%, function 100%, uncovered ``

- `test/project-catalog.test.mjs`: line 100%, branch 100%, function 100%, uncovered ``

## Coverage Output

```text
> reposhow@0.1.0 coverage
> node --test --experimental-test-coverage test/manifest-validator.test.mjs test/project-catalog.test.mjs

TAP version 13
# Subtest: accepts a valid project manifest
ok 1 - accepts a valid project manifest
  ---
  duration_ms: 3.066
  type: 'test'
  ...
# Subtest: returns the manifest when assertion succeeds
ok 2 - returns the manifest when assertion succeeds
  ---
  duration_ms: 0.2097
  type: 'test'
  ...
# Subtest: rejects a non-object manifest
ok 3 - rejects a non-object manifest
  ---
  duration_ms: 0.2561
  type: 'test'
  ...
# Subtest: rejects cookies as a demo data mode
ok 4 - rejects cookies as a demo data mode
  ---
  duration_ms: 0.23
  type: 'test'
  ...
# Subtest: rejects non-array tags and stack values
ok 5 - rejects non-array tags and stack values
  ---
  duration_ms: 0.1288
  type: 'test'
  ...
# Subtest: rejects non-boolean featured values
ok 6 - rejects non-boolean featured values
  ---
  duration_ms: 0.1
  type: 'test'
  ...
# Subtest: rejects non-object android configuration
ok 7 - rejects non-object android configuration
  ---
  duration_ms: 0.2161
  type: 'test'
  ...
# Subtest: requires APK asset pattern when Android support is enabled
ok 8 - requires APK asset pattern when Android support is enabled
  ---
  duration_ms: 0.1416
  type: 'test'
  ...
# Subtest: throws a readable validation error
ok 9 - throws a readable validation error
  ---
  duration_ms: 0.6214
  type: 'test'
  ...
# Subtest: converts simple globs to regular expressions
ok 10 - converts simple globs to regular expressions
  ---
  duration_ms: 1.5617
  type: 'test'
  ...
# Subtest: finds release assets with a glob pattern
ok 11 - finds release assets with a glob pattern
  ---
  duration_ms: 0.2581
  type: 'test'
  ...
# Subtest: creates a project entry from a valid manifest and release
ok 12 - creates a project entry from a valid manifest and release
  ---
  duration_ms: 2.2982
  type: 'test'
  ...
# Subtest: creates an inferred project entry without a manifest
ok 13 - creates an inferred project entry without a manifest
  ---
  duration_ms: 0.4278
  type: 'test'
  ...
# Subtest: uses fallback fields when GitHub metadata is sparse
ok 14 - uses fallback fields when GitHub metadata is sparse
  ---
  duration_ms: 0.2929
  type: 'test'
  ...
# Subtest: falls back to summary and repository homepage for partial valid manifests
ok 15 - falls back to summary and repository homepage for partial valid manifests
  ---
  duration_ms: 0.5218
  type: 'test'
  ...
# Subtest: keeps invalid manifest warnings while falling back to GitHub metadata
ok 16 - keeps invalid manifest warnings while falling back to GitHub metadata
  ---
  duration_ms: 0.3234
  type: 'test'
  ...
# Subtest: warns when Android is enabled but no APK matches
ok 17 - warns when Android is enabled but no APK matches
  ---
  duration_ms: 0.2174
  type: 'test'
  ...
# Subtest: sorts catalog projects by featured status then activity date
ok 18 - sorts catalog projects by featured status then activity date
  ---
  duration_ms: 0.2565
  type: 'test'
  ...
# Subtest: sorts projects with the same featured status by pushed or updated date
ok 19 - sorts projects with the same featured status by pushed or updated date
  ---
  duration_ms: 10.0646
  type: 'test'
  ...
1..19
# tests 19
# suites 0
# pass 19
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 127.4104
# start of coverage report
# -----------------------------------------------------------------------------
# file                         | line % | branch % | funcs % | uncovered lines
# -----------------------------------------------------------------------------
# src                          |        |          |         | 
#  manifest-validator.mjs      | 100.00 |   100.00 |  100.00 | 
#  project-catalog.mjs         | 100.00 |    95.60 |  100.00 | 
# test                         |        |          |         | 
#  manifest-validator.test.mjs | 100.00 |   100.00 |  100.00 | 
#  project-catalog.test.mjs    | 100.00 |   100.00 |  100.00 | 
# -----------------------------------------------------------------------------
# all files                    | 100.00 |    97.10 |  100.00 | 
# -----------------------------------------------------------------------------
# end of coverage report
```

## Gemma Coverage Review

1. **Verdict coverage :** ✅ Succès
2. **Seuils demandés / valeurs obtenues :** Lignes: 100% / 100% | Branches: 95% / 97.1% | Fonctions: 100% / 100%
3. **Lignes non couvertes :** Aucune.
4. **Tests à ajouter si utile :** Vérifier les branches non couvertes dans `src/project-catalog.mjs` pour atteindre 100% de couverture de branches.
5. **Commandes à relancer :** `npm run coverage`
6. **Décision Git :** ✅ Approuvé (Push recommandé)
