import assert from "node:assert/strict";
import test from "node:test";
import { assertProjectManifest, validateProjectManifest } from "../src/manifest-validator.mjs";

const validManifest = {
  schemaVersion: "0.1.0",
  title: "Mini CRM",
  summary: "A small CRM demo.",
  status: "active",
  featured: true,
  tags: ["crm", "demo"],
  stack: ["React", "SQLite"],
  dataMode: "sqlite"
};

test("accepts a valid project manifest", () => {
  const result = validateProjectManifest(validManifest);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("returns the manifest when assertion succeeds", () => {
  assert.equal(assertProjectManifest(validManifest), validManifest);
});

test("rejects a non-object manifest", () => {
  const result = validateProjectManifest(null);

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["manifest must be an object"]);
});

test("rejects cookies as a demo data mode", () => {
  const result = validateProjectManifest({
    ...validManifest,
    dataMode: "cookies"
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /dataMode must be one of/);
});

test("requires APK asset pattern when Android support is enabled", () => {
  const result = validateProjectManifest({
    ...validManifest,
    android: {
      enabled: true
    }
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /android\.apkAssetPattern/);
});

test("throws a readable validation error", () => {
  assert.throws(
    () =>
      assertProjectManifest({
        ...validManifest,
        tags: ["demo", ""]
      }),
    /tags must contain strings/
  );
});
