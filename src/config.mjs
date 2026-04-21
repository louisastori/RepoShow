import { readFile } from "node:fs/promises";

const defaultConfig = {
  schemaVersion: "0.1.0",
  github: {
    ownerType: "user",
    visibility: "public",
    manifestPath: "reposhow.json",
    includeArchived: false,
    includeForks: false
  },
  output: {
    projectsPath: "public/projects.json"
  }
};

function assertString(value, message) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(message);
  }
}

export async function readRepoShowConfig(path = "reposhow.config.json") {
  const config = JSON.parse(await readFile(path, "utf8"));

  const normalized = {
    ...defaultConfig,
    ...config,
    github: {
      ...defaultConfig.github,
      ...config.github
    },
    output: {
      ...defaultConfig.output,
      ...config.output
    }
  };

  assertString(normalized.schemaVersion, "schemaVersion must be a non-empty string");
  assertString(normalized.github.owner, "github.owner must be a non-empty string");
  assertString(normalized.github.manifestPath, "github.manifestPath must be a non-empty string");
  assertString(normalized.output.projectsPath, "output.projectsPath must be a non-empty string");

  if (!["user", "organization"].includes(normalized.github.ownerType)) {
    throw new Error("github.ownerType must be user or organization");
  }

  if (normalized.github.visibility !== "public") {
    throw new Error("github.visibility currently supports only public");
  }

  for (const key of ["includeArchived", "includeForks"]) {
    if (typeof normalized.github[key] !== "boolean") {
      throw new Error(`github.${key} must be a boolean`);
    }
  }

  return normalized;
}
