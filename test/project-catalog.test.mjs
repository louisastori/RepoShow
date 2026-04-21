import assert from "node:assert/strict";
import test from "node:test";
import { createProjectCatalog, createProjectEntry, findReleaseAsset, globToRegExp } from "../src/project-catalog.mjs";

const repo = {
  name: "mini-crm",
  description: "GitHub fallback description",
  topics: ["react", "sqlite"],
  html_url: "https://github.com/louisastori/mini-crm",
  homepage: "https://mini-crm.example.com",
  default_branch: "main",
  pushed_at: "2026-04-20T10:00:00Z",
  updated_at: "2026-04-20T10:30:00Z",
  archived: false,
  fork: false
};

const manifest = {
  schemaVersion: "0.1.0",
  title: "Mini CRM",
  summary: "Small CRM demo.",
  description: "A compact CRM for demo portfolios.",
  status: "active",
  featured: true,
  tags: ["crm", "demo"],
  stack: ["React", "SQLite"],
  demoUrl: "https://demo.example.com",
  screenshots: ["docs/home.png"],
  dataMode: "sqlite",
  android: {
    enabled: true,
    apkAssetPattern: "*.apk"
  }
};

const release = {
  tag_name: "v1.2.0",
  name: "Version 1.2",
  html_url: "https://github.com/louisastori/mini-crm/releases/tag/v1.2.0",
  published_at: "2026-04-20T11:00:00Z",
  assets: [
    {
      name: "mini-crm.apk",
      browser_download_url: "https://github.com/download/mini-crm.apk",
      size: 1234,
      content_type: "application/vnd.android.package-archive"
    }
  ]
};

test("converts simple globs to regular expressions", () => {
  const matcher = globToRegExp("app-?.apk");

  assert.equal(matcher.test("app-1.apk"), true);
  assert.equal(matcher.test("app-12.apk"), false);
});

test("finds release assets with a glob pattern", () => {
  assert.equal(findReleaseAsset(release, "*.apk")?.name, "mini-crm.apk");
  assert.equal(findReleaseAsset(release, "*.zip"), null);
  assert.equal(findReleaseAsset(null, "*.apk"), null);
  assert.equal(findReleaseAsset({ assets: null }, "*.apk"), null);
});

test("creates a project entry from a valid manifest and release", () => {
  const project = createProjectEntry({
    owner: "louisastori",
    repo,
    manifest,
    release
  });

  assert.equal(project.id, "mini-crm");
  assert.equal(project.title, "Mini CRM");
  assert.equal(project.summary, "Small CRM demo.");
  assert.equal(project.metadataSource, "manifest");
  assert.equal(project.featured, true);
  assert.deepEqual(project.tags, ["crm", "demo"]);
  assert.deepEqual(project.stack, ["React", "SQLite"]);
  assert.equal(project.release.tagName, "v1.2.0");
  assert.equal(project.apk.name, "mini-crm.apk");
  assert.deepEqual(project.warnings, []);
});

test("creates an inferred project entry without a manifest", () => {
  const project = createProjectEntry({
    owner: "louisastori",
    repo: {
      ...repo,
      name: "archived-tool",
      description: "",
      homepage: "not-a-url",
      archived: true
    },
    manifest: null,
    release: null
  });

  assert.equal(project.title, "archived-tool");
  assert.equal(project.summary, "No description provided.");
  assert.equal(project.status, "archived");
  assert.equal(project.demoUrl, "");
  assert.equal(project.metadataSource, "inferred");
  assert.equal(project.release, null);
  assert.equal(project.apk, null);
});

test("uses fallback fields when GitHub metadata is sparse", () => {
  const project = createProjectEntry({
    owner: "louisastori",
    repo: {
      name: "sparse repo",
      url: "",
      topics: null,
      homepage: "",
      archived: false,
      fork: true
    },
    manifest: null,
    release: {
      tag_name: "v1.0.0",
      assets: null
    }
  });

  assert.equal(project.id, "sparse-repo");
  assert.equal(project.repoUrl, "https://github.com/louisastori/sparse repo");
  assert.equal(project.status, "active");
  assert.deepEqual(project.tags, []);
  assert.equal(project.release.name, "v1.0.0");
  assert.deepEqual(project.release.assets, []);
  assert.equal(project.fork, true);
});

test("falls back to summary and repository homepage for partial valid manifests", () => {
  const project = createProjectEntry({
    owner: "louisastori",
    repo,
    manifest: {
      schemaVersion: "0.1.0",
      title: "Mini CRM",
      summary: "Manifest summary.",
      status: "maintenance",
      featured: false,
      tags: ["demo", "demo"],
      stack: ["Node.js", "Node.js"],
      dataMode: "static-json"
    },
    release: {
      tag_name: "",
      html_url: "",
      published_at: "",
      assets: [
        {
          name: "",
          browser_download_url: "",
          size: 0,
          content_type: ""
        }
      ]
    }
  });

  assert.equal(project.description, "Manifest summary.");
  assert.equal(project.demoUrl, "https://mini-crm.example.com");
  assert.deepEqual(project.tags, ["demo"]);
  assert.deepEqual(project.stack, ["Node.js"]);
  assert.deepEqual(project.screenshots, []);
  assert.equal(project.release.name, "");
  assert.equal(project.release.assets[0].name, "");
});

test("keeps invalid manifest warnings while falling back to GitHub metadata", () => {
  const project = createProjectEntry({
    owner: "louisastori",
    repo,
    manifest: {
      title: "Broken"
    },
    release: {
      tag_name: "v0",
      assets: []
    }
  });

  assert.equal(project.title, "mini-crm");
  assert.equal(project.metadataSource, "invalid-manifest");
  assert.match(project.warnings.join("\n"), /schemaVersion must be a non-empty string/);
});

test("warns when Android is enabled but no APK matches", () => {
  const project = createProjectEntry({
    owner: "louisastori",
    repo,
    manifest: {
      ...manifest,
      android: {
        enabled: true,
        apkAssetPattern: "release-*.apk"
      }
    },
    release
  });

  assert.equal(project.apk, null);
  assert.match(project.warnings.join("\n"), /No release asset matched release-\*\.apk/);
});

test("sorts catalog projects by featured status then activity date", () => {
  const olderFeatured = createProjectEntry({
    owner: "louisastori",
    repo: {
      ...repo,
      name: "featured-old",
      pushed_at: "2026-01-01T00:00:00Z"
    },
    manifest,
    release: null
  });
  const newerNormal = createProjectEntry({
    owner: "louisastori",
    repo: {
      ...repo,
      name: "normal-new",
      pushed_at: "2026-04-01T00:00:00Z"
    },
    manifest: null,
    release: null
  });

  const catalog = createProjectCatalog({
    owner: "louisastori",
    generatedAt: "2026-04-21T00:00:00Z",
    projects: [newerNormal, olderFeatured]
  });

  assert.equal(catalog.projectCount, 2);
  assert.equal(catalog.projects[0].name, "featured-old");
  assert.equal(catalog.projects[1].name, "normal-new");
});

test("sorts projects with the same featured status by pushed or updated date", () => {
  const older = createProjectEntry({
    owner: "louisastori",
    repo: {
      ...repo,
      name: "older",
      pushed_at: "",
      updated_at: "2026-01-01T00:00:00Z"
    },
    manifest: null,
    release: null
  });
  const newer = createProjectEntry({
    owner: "louisastori",
    repo: {
      ...repo,
      name: "newer",
      pushed_at: "2026-02-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z"
    },
    manifest: null,
    release: null
  });

  const catalog = createProjectCatalog({
    owner: "louisastori",
    generatedAt: "2026-04-21T00:00:00Z",
    projects: [older, newer]
  });

  assert.equal(catalog.projects[0].name, "newer");
  assert.equal(catalog.projects[1].name, "older");
});
