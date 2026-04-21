# RepoShow Quality Report

- Generated at: 2026-04-21T06:18:52.1617439+02:00
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
- Duration: 1.06s

```text
> reposhow@0.1.0 test
> node --test test/manifest-validator.test.mjs

TAP version 13
# Subtest: accepts a valid project manifest
ok 1 - accepts a valid project manifest
  ---
  duration_ms: 1.4865
  type: 'test'
  ...
# Subtest: returns the manifest when assertion succeeds
ok 2 - returns the manifest when assertion succeeds
  ---
  duration_ms: 0.1455
  type: 'test'
  ...
# Subtest: rejects a non-object manifest
ok 3 - rejects a non-object manifest
  ---
  duration_ms: 0.8834
  type: 'test'
  ...
# Subtest: rejects cookies as a demo data mode
ok 4 - rejects cookies as a demo data mode
  ---
  duration_ms: 0.3368
  type: 'test'
  ...
# Subtest: rejects non-array tags and stack values
ok 5 - rejects non-array tags and stack values
  ---
  duration_ms: 0.1424
  type: 'test'
  ...
# Subtest: rejects non-boolean featured values
ok 6 - rejects non-boolean featured values
  ---
  duration_ms: 0.198
  type: 'test'
  ...
# Subtest: rejects non-object android configuration
ok 7 - rejects non-object android configuration
  ---
  duration_ms: 0.1057
  type: 'test'
  ...
# Subtest: requires APK asset pattern when Android support is enabled
ok 8 - requires APK asset pattern when Android support is enabled
  ---
  duration_ms: 0.0888
  type: 'test'
  ...
# Subtest: throws a readable validation error
ok 9 - throws a readable validation error
  ---
  duration_ms: 0.5565
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
# duration_ms 89.3999
```

#### coverage

- Command: `npm run coverage`
- Exit code: 0
- Duration: 1.05s

```text
> reposhow@0.1.0 coverage
> node --test --experimental-test-coverage test/manifest-validator.test.mjs

TAP version 13
# Subtest: accepts a valid project manifest
ok 1 - accepts a valid project manifest
  ---
  duration_ms: 1.7905
  type: 'test'
  ...
# Subtest: returns the manifest when assertion succeeds
ok 2 - returns the manifest when assertion succeeds
  ---
  duration_ms: 0.1483
  type: 'test'
  ...
# Subtest: rejects a non-object manifest
ok 3 - rejects a non-object manifest
  ---
  duration_ms: 0.2098
  type: 'test'
  ...
# Subtest: rejects cookies as a demo data mode
ok 4 - rejects cookies as a demo data mode
  ---
  duration_ms: 0.1964
  type: 'test'
  ...
# Subtest: rejects non-array tags and stack values
ok 5 - rejects non-array tags and stack values
  ---
  duration_ms: 0.1283
  type: 'test'
  ...
# Subtest: rejects non-boolean featured values
ok 6 - rejects non-boolean featured values
  ---
  duration_ms: 0.0951
  type: 'test'
  ...
# Subtest: rejects non-object android configuration
ok 7 - rejects non-object android configuration
  ---
  duration_ms: 0.1756
  type: 'test'
  ...
# Subtest: requires APK asset pattern when Android support is enabled
ok 8 - requires APK asset pattern when Android support is enabled
  ---
  duration_ms: 0.1064
  type: 'test'
  ...
# Subtest: throws a readable validation error
ok 9 - throws a readable validation error
  ---
  duration_ms: 0.4803
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
# duration_ms 107.2513
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
- Duration: 3.07s

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

Voici l'analyse de votre rapport de qualité :

1. **Verdict court**
**Excellent.** Le pipeline est au vert, la couverture est maximale et les spécifications sont respectées.

2. **Tests ou suites qui passent**
* **Validation du manifeste** (`npm run validate`) : Réussie.
* **Tests unitaires** (`npm run test`) : 9/9 tests réussis.
* **Couverture de code** (`npm run coverage`) : 100% de couverture sur `manifest-validator.mjs`.
* **Validation OpenSpec** : 6/6 spécifications validées avec succès.

3. **Echecs ou manques de coverage**
* **Aucun échec détecté.**
* **Note sur la couverture :** Bien que la couverture soit de 100% sur le fichier testé, la suite de tests est actuellement limitée à un seul fichier (`manifest-validator.test.mjs`). La couverture est parfaite pour ce module, mais la surface de test globale du projet reste à étendre au fur et à mesure de l'ajout de nouveaux modules.

4. **Tests à ajouter en priorité**
* **Tests d'intégration :** Vérifier la validation avec de vrais fichiers physiques sur le disque (et non uniquement des objets en mémoire).
* **Tests de robustesse (Fuzzing) :** Tester des manifestes avec des structures très profondes ou des caractères spéciaux inhabituels pour pousser les limites du `manifest-validator`.
* **Tests de régression OpenSpec :** Automatiser la vérification que toute modification de code ne casse pas l'une des 6 spécifications validées.

5. **Commandes exactes à relancer**
Pour confirmer la stabilité avant toute action :
```bash
npm run validate
npm run test
npm run coverage
npx @fission-ai/openspec@latest validate --all
```

6. **Recommendation Git**
**Un commit et un push sont tout à fait raisonnables.** L'état actuel du dépôt est stable et conforme aux exigences de qualité définies.
