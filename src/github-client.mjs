import { execFileSync } from "node:child_process";

const githubApiBaseUrl = "https://api.github.com";

function resolveTokenFromGitHubCli() {
  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

export function resolveGitHubToken(env = process.env) {
  return env.GITHUB_TOKEN || env.GH_TOKEN || resolveTokenFromGitHubCli();
}

function encodePath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export class GitHubClient {
  constructor({ token = "", fetchImpl = globalThis.fetch, baseUrl = githubApiBaseUrl } = {}) {
    if (!fetchImpl) {
      throw new Error("A fetch implementation is required");
    }

    this.token = token;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
  }

  async requestJson(path) {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "RepoShow"
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await this.fetchImpl(url, { headers });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub request failed (${response.status}) for ${url}: ${body}`);
    }

    return response.json();
  }

  async requestAllPages(path) {
    const items = [];
    let page = 1;

    while (true) {
      const separator = path.includes("?") ? "&" : "?";
      const pageItems = await this.requestJson(`${path}${separator}per_page=100&page=${page}`);

      if (!Array.isArray(pageItems) || pageItems.length === 0) {
        break;
      }

      items.push(...pageItems);
      page += 1;
    }

    return items;
  }

  async listRepositories({ owner, ownerType }) {
    const path =
      ownerType === "organization"
        ? `/orgs/${encodeURIComponent(owner)}/repos?type=public&sort=updated`
        : `/users/${encodeURIComponent(owner)}/repos?type=owner&sort=updated`;

    return this.requestAllPages(path);
  }

  async readRepositoryJsonFile({ owner, repo, path, ref }) {
    const encodedPath = encodePath(path);
    const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    const file = await this.requestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}${query}`
    );

    if (!file || file.type !== "file" || file.encoding !== "base64" || typeof file.content !== "string") {
      return null;
    }

    const raw = Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8");
    return JSON.parse(raw);
  }

  async getLatestRelease({ owner, repo }) {
    return this.requestJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`);
  }
}
