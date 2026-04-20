import { readFile } from "node:fs/promises";

const manifestUrl = new URL("../examples/reposhow.project.json", import.meta.url);
const schemaUrl = new URL("../schemas/reposhow-project.schema.json", import.meta.url);

const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
JSON.parse(await readFile(schemaUrl, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const key of ["schemaVersion", "title", "summary", "status", "dataMode"]) {
  assert(typeof manifest[key] === "string" && manifest[key].length > 0, `${key} must be a non-empty string`);
}

for (const key of ["tags", "stack"]) {
  assert(Array.isArray(manifest[key]), `${key} must be an array`);
  assert(manifest[key].every((value) => typeof value === "string" && value.length > 0), `${key} must contain strings`);
}

assert(typeof manifest.featured === "boolean", "featured must be a boolean");

const validStatuses = new Set(["active", "maintenance", "experimental", "archived"]);
assert(validStatuses.has(manifest.status), `status must be one of: ${[...validStatuses].join(", ")}`);

const validDataModes = new Set(["none", "static-json", "local-storage", "indexeddb", "sqlite"]);
assert(validDataModes.has(manifest.dataMode), `dataMode must be one of: ${[...validDataModes].join(", ")}`);

if (manifest.android) {
  assert(typeof manifest.android.enabled === "boolean", "android.enabled must be a boolean");
  if (manifest.android.enabled) {
    assert(
      typeof manifest.android.apkAssetPattern === "string" && manifest.android.apkAssetPattern.length > 0,
      "android.apkAssetPattern is required when Android is enabled"
    );
  }
}

console.log("RepoShow example manifest is valid.");
