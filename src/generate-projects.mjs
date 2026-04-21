import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { readRepoShowConfig } from "./config.mjs";
import { GitHubClient, resolveGitHubToken } from "./github-client.mjs";
import { createProjectCatalog, createProjectEntry } from "./project-catalog.mjs";

function parseArgs(argv) {
  const args = {
    configPath: "reposhow.config.json"
  };

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--config") {
      args.configPath = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

async function readManifest(client, { owner, repo, manifestPath }) {
  try {
    return await client.readRepositoryJsonFile({
      owner,
      repo: repo.name,
      path: manifestPath,
      ref: repo.default_branch
    });
  } catch (error) {
    return {
      error
    };
  }
}

async function main() {
  const { configPath } = parseArgs(process.argv.slice(2));
  const config = await readRepoShowConfig(configPath);
  const token = resolveGitHubToken();
  const client = new GitHubClient({ token });
  const { owner, ownerType, manifestPath, includeArchived, includeForks } = config.github;

  console.log(`Scanning GitHub ${ownerType} ${owner}`);

  const repositories = (await client.listRepositories({ owner, ownerType })).filter((repo) => {
    if (!includeArchived && repo.archived) {
      return false;
    }

    if (!includeForks && repo.fork) {
      return false;
    }

    return true;
  });

  const projects = [];

  for (const repo of repositories) {
    console.log(`Reading ${owner}/${repo.name}`);

    const manifestResult = await readManifest(client, { owner, repo, manifestPath });
    const manifest = manifestResult && !manifestResult.error ? manifestResult : null;
    const release = await client.getLatestRelease({ owner, repo: repo.name });
    const project = createProjectEntry({ owner, repo, manifest, release, manifestPath });

    if (manifestResult && manifestResult.error) {
      project.warnings.push(`${manifestPath}: ${manifestResult.error.message}`);
    }

    projects.push(project);
  }

  const catalog = createProjectCatalog({
    owner,
    projects
  });

  await mkdir(dirname(config.output.projectsPath), { recursive: true });
  await writeFile(config.output.projectsPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(`Generated ${catalog.projectCount} projects in ${config.output.projectsPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
