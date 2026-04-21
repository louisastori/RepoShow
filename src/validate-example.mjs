import { readFile } from "node:fs/promises";
import { assertProjectManifest } from "./manifest-validator.mjs";

const manifestUrl = new URL("../examples/reposhow.project.json", import.meta.url);
const schemaUrl = new URL("../schemas/reposhow-project.schema.json", import.meta.url);

const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
JSON.parse(await readFile(schemaUrl, "utf8"));
assertProjectManifest(manifest);

console.log("RepoShow example manifest is valid.");
