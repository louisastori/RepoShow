const validStatuses = new Set(["active", "maintenance", "experimental", "archived"]);
const validDataModes = new Set(["none", "static-json", "local-storage", "indexeddb", "sqlite"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function addError(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

export function validateProjectManifest(manifest) {
  const errors = [];

  addError(errors, manifest && typeof manifest === "object" && !Array.isArray(manifest), "manifest must be an object");

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return { valid: false, errors };
  }

  for (const key of ["schemaVersion", "title", "summary", "status", "dataMode"]) {
    addError(errors, isNonEmptyString(manifest[key]), `${key} must be a non-empty string`);
  }

  for (const key of ["tags", "stack"]) {
    addError(errors, Array.isArray(manifest[key]), `${key} must be an array`);

    if (Array.isArray(manifest[key])) {
      addError(
        errors,
        manifest[key].every((value) => isNonEmptyString(value)),
        `${key} must contain strings`
      );
    }
  }

  addError(errors, typeof manifest.featured === "boolean", "featured must be a boolean");
  addError(errors, validStatuses.has(manifest.status), `status must be one of: ${[...validStatuses].join(", ")}`);
  addError(
    errors,
    validDataModes.has(manifest.dataMode),
    `dataMode must be one of: ${[...validDataModes].join(", ")}`
  );

  if (manifest.android) {
    addError(errors, typeof manifest.android === "object" && !Array.isArray(manifest.android), "android must be an object");

    if (typeof manifest.android === "object" && !Array.isArray(manifest.android)) {
      addError(errors, typeof manifest.android.enabled === "boolean", "android.enabled must be a boolean");

      if (manifest.android.enabled) {
        addError(
          errors,
          isNonEmptyString(manifest.android.apkAssetPattern),
          "android.apkAssetPattern is required when Android is enabled"
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function assertProjectManifest(manifest) {
  const result = validateProjectManifest(manifest);

  if (!result.valid) {
    throw new Error(result.errors.join("\n"));
  }

  return manifest;
}
