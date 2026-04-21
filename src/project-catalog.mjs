import { validateProjectManifest } from "./manifest-validator.mjs";

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

export function globToRegExp(pattern) {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");

  return new RegExp(`^${escaped}$`, "i");
}

export function findReleaseAsset(release, pattern) {
  if (!release || !Array.isArray(release.assets)) {
    return null;
  }

  const matcher = globToRegExp(pattern);
  return release.assets.find((asset) => matcher.test(asset.name)) || null;
}

function normalizeRelease(release) {
  if (!release) {
    return null;
  }

  return {
    tagName: release.tag_name || "",
    name: release.name || release.tag_name || "",
    url: release.html_url || "",
    publishedAt: release.published_at || "",
    assets: Array.isArray(release.assets)
      ? release.assets.map((asset) => ({
          name: asset.name || "",
          downloadUrl: asset.browser_download_url || "",
          size: asset.size || 0,
          contentType: asset.content_type || ""
        }))
      : []
  };
}

export function createProjectEntry({ owner, repo, manifest = null, release = null, manifestPath = "reposhow.json" }) {
  const warnings = [];
  const validation = manifest ? validateProjectManifest(manifest) : { valid: false, errors: [] };
  const hasValidManifest = Boolean(manifest && validation.valid);

  if (manifest && !validation.valid) {
    warnings.push(...validation.errors.map((error) => `${manifestPath}: ${error}`));
  }

  const topics = uniqueStrings(repo.topics || []);
  const repoUrl = repo.html_url || repo.url || `https://github.com/${owner}/${repo.name}`;
  const releaseSummary = normalizeRelease(release);
  const android = hasValidManifest && manifest.android ? manifest.android : { enabled: false };
  const apkPattern = android.apkAssetPattern || "*.apk";
  const apkAsset = android.enabled ? findReleaseAsset(release, apkPattern) : null;

  if (android.enabled && !apkAsset) {
    warnings.push(`No release asset matched ${apkPattern}`);
  }

  return {
    id: slugify(repo.name),
    name: repo.name,
    owner,
    title: hasValidManifest ? manifest.title : repo.name,
    summary: hasValidManifest ? manifest.summary : repo.description || "No description provided.",
    description: hasValidManifest ? manifest.description || manifest.summary : repo.description || "",
    status: hasValidManifest ? manifest.status : repo.archived ? "archived" : "active",
    featured: hasValidManifest ? manifest.featured : false,
    tags: hasValidManifest ? uniqueStrings(manifest.tags) : topics,
    stack: hasValidManifest ? uniqueStrings(manifest.stack) : [],
    dataMode: hasValidManifest ? manifest.dataMode : "none",
    screenshots: hasValidManifest ? uniqueStrings(manifest.screenshots || []) : [],
    repoUrl,
    demoUrl: hasValidManifest && isUrl(manifest.demoUrl) ? manifest.demoUrl : isUrl(repo.homepage) ? repo.homepage : "",
    defaultBranch: repo.default_branch || "",
    pushedAt: repo.pushed_at || "",
    updatedAt: repo.updated_at || "",
    archived: Boolean(repo.archived),
    fork: Boolean(repo.fork),
    metadataSource: hasValidManifest ? "manifest" : manifest ? "invalid-manifest" : "inferred",
    release: releaseSummary,
    apk: apkAsset
      ? {
          name: apkAsset.name,
          downloadUrl: apkAsset.browser_download_url,
          size: apkAsset.size || 0,
          contentType: apkAsset.content_type || ""
        }
      : null,
    warnings
  };
}

export function createProjectCatalog({ owner, projects, generatedAt = new Date().toISOString() }) {
  const sortedProjects = [...projects].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return String(right.pushedAt || right.updatedAt).localeCompare(String(left.pushedAt || left.updatedAt));
  });

  return {
    schemaVersion: "0.1.0",
    generatedAt,
    owner,
    projectCount: sortedProjects.length,
    projects: sortedProjects
  };
}
