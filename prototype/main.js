const catalogUrl = "../public/projects.json";
const views = [...document.querySelectorAll("[data-view]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];
const knownRoutes = new Set(views.map((view) => view.dataset.view));

const state = {
  catalog: null,
  projects: [],
  selectedProjectId: "",
  search: ""
};

const icons = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>',
  external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19c-3 1-3-1-4-2M16 22v-4a3 3 0 0 0-1-2.3c3-.3 6-1.5 6-6A4.7 4.7 0 0 0 20 6a4.4 4.4 0 0 0-.1-3s-1-.3-3 1.2A10.4 10.4 0 0 0 12 3c-1.7 0-3.3.4-4.9 1.2C5.2 2.7 4.2 3 4.2 3A4.4 4.4 0 0 0 4 6a4.7 4.7 0 0 0-1 3.7c0 4.5 3 5.7 6 6A3 3 0 0 0 8 18v4" /></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>'
};

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

function setText(selector, value) {
  const element = qs(selector);
  if (element) {
    element.textContent = value;
  }
}

function getHashState() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const [route = "home", projectId = ""] = hash.split("/");
  return {
    route: knownRoutes.has(route) ? route : "home",
    projectId
  };
}

function setRoute(route, projectId = state.selectedProjectId) {
  const nextRoute = knownRoutes.has(route) ? route : "home";

  if (projectId) {
    state.selectedProjectId = projectId;
  }

  for (const view of views) {
    view.classList.toggle("is-active", view.dataset.view === nextRoute);
  }

  for (const link of routeLinks) {
    link.classList.toggle("is-active", link.dataset.route === nextRoute);
  }

  if (nextRoute === "project") {
    renderSelectedProject();
  }

  const nextHash = nextRoute === "project" && state.selectedProjectId ? `#project/${state.selectedProjectId}` : `#${nextRoute}`;
  if (location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function formatStatus(status) {
  const labels = {
    active: "Actif",
    maintenance: "Maintenance",
    experimental: "Experimental",
    archived: "Archive"
  };

  return labels[status] || status || "Inconnu";
}

function formatDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getProjectTags(project, limit = 4) {
  const values = project.stack?.length ? project.stack : project.tags?.length ? project.tags : [project.defaultBranch || "GitHub"];
  return values.slice(0, limit);
}

function getVisualClass(project, index) {
  const classes = ["visual-nebula", "visual-chip", "visual-wave"];
  const seed = project.id ? project.id.charCodeAt(0) : index;
  return classes[seed % classes.length];
}

function getActiveProjects() {
  return state.projects.filter((project) => project.status === "active");
}

function getRecentlyUpdatedProjects() {
  const now = Date.now();
  const maxAge = 1000 * 60 * 60 * 24 * 30;

  return state.projects.filter((project) => {
    const updatedAt = new Date(project.pushedAt || project.updatedAt).getTime();
    return Number.isFinite(updatedAt) && now - updatedAt <= maxAge;
  });
}

function getSelectedProject() {
  return state.projects.find((project) => project.id === state.selectedProjectId) || state.projects[0] || null;
}

function renderHome() {
  const topProjects = state.projects.slice(0, 3);
  const activeCount = getActiveProjects().length;
  const apkCount = state.projects.filter((project) => project.apk).length;

  setText("[data-preview-count]", `${state.projects.length} projets`);
  setText(
    "[data-preview-summary]",
    `${activeCount} actifs, ${apkCount} APK detectees, catalogue genere le ${formatDate(state.catalog?.generatedAt)}.`
  );
  setText("[data-meta-repo]", `${state.catalog?.owner || "github"}/${state.projects[0]?.name || "RepoShow"}`);
  setText("[data-meta-release]", state.projects.find((project) => project.release)?.release?.name || "Aucune release detectee");
  setText("[data-meta-stack]", getProjectTags(state.projects[0] || {}, 3).join(", "));
  setText("[data-meta-status]", state.projects[0]?.status || "active");

  const previewGrid = qs("[data-preview-grid]");
  if (!previewGrid) {
    return;
  }

  previewGrid.replaceChildren(
    ...topProjects.map((project, index) => {
      const article = document.createElement("article");
      article.className = `mini-project ${getVisualClass(project, index)}`;

      const status = document.createElement("span");
      status.textContent = formatStatus(project.status);

      const title = document.createElement("strong");
      title.textContent = project.title;

      article.append(status, title);
      return article;
    })
  );
}

function renderStats() {
  const total = state.projects.length;
  const active = getActiveProjects().length;
  const recent = getRecentlyUpdatedProjects().length;
  const apk = state.projects.filter((project) => project.apk).length;

  setText("[data-stat-total]", String(total).padStart(2, "0"));
  setText("[data-stat-active]", String(active).padStart(2, "0"));
  setText("[data-stat-recent]", String(recent).padStart(2, "0"));
  setText("[data-stat-apk]", String(apk).padStart(2, "0"));

  const totalMeter = qs("[data-stat-total-meter]");
  const activeMeter = qs("[data-stat-active-meter]");
  if (totalMeter) {
    totalMeter.style.width = total ? "100%" : "0%";
  }
  if (activeMeter) {
    activeMeter.style.width = total ? `${Math.round((active / total) * 100)}%` : "0%";
  }
}

function matchesSearch(project) {
  if (!state.search) {
    return true;
  }

  const haystack = [project.title, project.summary, project.name, ...(project.tags || []), ...(project.stack || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(state.search.toLowerCase());
}

function renderTagRow(tags) {
  const row = document.createElement("div");
  row.className = "tag-row";

  for (const tag of tags) {
    const span = document.createElement("span");
    span.textContent = tag;
    row.append(span);
  }

  return row;
}

function renderProjectCard(project, index) {
  const card = document.createElement("article");
  card.className = "project-card";

  const visual = document.createElement("div");
  visual.className = `project-visual ${getVisualClass(project, index)}`;
  const badge = document.createElement("span");
  badge.textContent = formatStatus(project.status);
  visual.append(badge);

  const title = document.createElement("h2");
  title.textContent = project.title;

  const summary = document.createElement("p");
  summary.textContent = project.summary;

  const footer = document.createElement("footer");
  const updated = document.createElement("small");
  updated.textContent = `Mis a jour le ${formatDate(project.pushedAt || project.updatedAt)}`;
  const link = document.createElement("a");
  link.href = `#project/${project.id}`;
  link.dataset.route = "project";
  link.dataset.projectId = project.id;
  link.setAttribute("aria-label", `Ouvrir ${project.title}`);
  link.innerHTML = icons.arrow;
  footer.append(updated, link);

  card.append(visual, title, summary, renderTagRow(getProjectTags(project, 3)), footer);
  return card;
}

function renderProjectGrid() {
  const grid = qs("[data-project-grid]");
  if (!grid) {
    return;
  }

  const projects = state.projects.filter(matchesSearch);

  if (projects.length === 0) {
    const empty = document.createElement("article");
    empty.className = "empty-state";
    empty.textContent = "Aucun projet ne correspond a cette recherche.";
    grid.replaceChildren(empty);
    return;
  }

  grid.replaceChildren(...projects.map(renderProjectCard));
}

function renderActions(project) {
  const actions = qs("[data-project-actions]");
  if (!actions) {
    return;
  }

  const links = [];

  if (project.demoUrl) {
    links.push({ href: project.demoUrl, label: "Demo en direct", icon: icons.external, primary: true });
  }
  links.push({ href: project.repoUrl, label: "Depot GitHub", icon: icons.code, primary: !project.demoUrl });
  if (project.apk) {
    links.push({ href: project.apk.downloadUrl, label: "Telecharger l'APK", icon: icons.download, primary: false });
  }

  actions.replaceChildren(
    ...links.map((item) => {
      const anchor = document.createElement("a");
      anchor.className = `button ${item.primary ? "button-primary" : "button-secondary"}`;
      anchor.href = item.href;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.innerHTML = item.icon;
      anchor.append(document.createTextNode(item.label));
      return anchor;
    })
  );
}

function renderProjectAside(project) {
  const aside = qs("[data-project-aside]");
  if (!aside) {
    return;
  }

  const heading = document.createElement("p");
  heading.className = "eyebrow";
  heading.textContent = "Historique des versions";

  const release = document.createElement("article");
  release.className = "release-card";
  const releaseTitle = document.createElement("strong");
  releaseTitle.textContent = project.release?.name || project.release?.tagName || "Aucune release";
  const releaseDate = document.createElement("span");
  releaseDate.textContent = project.release ? formatDate(project.release.publishedAt) : "GitHub release non detectee";
  const releaseText = document.createElement("p");
  releaseText.textContent = project.apk
    ? `APK disponible: ${project.apk.name}`
    : "Le projet reste visible avec ses metadonnees GitHub.";
  release.append(releaseTitle, releaseDate, releaseText);

  const info = document.createElement("article");
  info.className = "content-panel compact";
  const title = document.createElement("h2");
  title.textContent = "Informations du projet";
  const dl = document.createElement("dl");
  const rows = [
    ["Branche", project.defaultBranch || "-"],
    ["Source", project.metadataSource],
    ["Donnees", project.dataMode],
    ["Warnings", String(project.warnings?.length || 0)]
  ];

  for (const [name, value] of rows) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = name;
    dd.textContent = value;
    row.append(dt, dd);
    dl.append(row);
  }

  const meter = document.createElement("div");
  meter.className = "meter";
  const meterValue = document.createElement("i");
  meterValue.style.width = project.metadataSource === "manifest" ? "100%" : "45%";
  meter.append(meterValue);
  const small = document.createElement("small");
  small.textContent = project.metadataSource === "manifest" ? "Manifeste complet" : "Metadonnees inferees";

  info.append(title, dl, meter, small);
  aside.replaceChildren(heading, release, info);
}

function renderSelectedProject() {
  const project = getSelectedProject();
  if (!project) {
    return;
  }

  state.selectedProjectId = project.id;
  setText("[data-project-status]", formatStatus(project.status));
  setText("[data-project-updated]", `Mis a jour : ${formatDate(project.pushedAt || project.updatedAt)}`);
  setText("[data-project-title]", project.title);
  setText("[data-project-summary]", project.summary);
  setText("[data-phone-owner]", `${project.owner}/${project.name}`);
  setText("[data-phone-title]", project.title);
  setText("[data-project-description]", project.description || project.summary);
  setText(
    "[data-project-install]",
    `$ git clone ${project.repoUrl}\n$ cd ${project.name}\n$ npm install\n$ npm run dev`
  );

  const tagRow = qs("[data-project-tags]");
  if (tagRow) {
    tagRow.replaceChildren(...Array.from(renderTagRow(getProjectTags(project, 6)).children));
  }

  renderActions(project);
  renderProjectAside(project);
}

function renderCatalog() {
  renderHome();
  renderStats();
  renderProjectGrid();
  renderSelectedProject();
}

async function loadCatalog() {
  try {
    const response = await fetch(catalogUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.catalog = await response.json();
    state.projects = Array.isArray(state.catalog.projects) ? state.catalog.projects : [];
    state.selectedProjectId = getHashState().projectId || state.projects[0]?.id || "";
    renderCatalog();
    setRoute(getHashState().route, state.selectedProjectId);
  } catch (error) {
    setText("[data-preview-count]", "Catalogue indisponible");
    setText("[data-preview-summary]", `Lance npm run prototype:serve pour charger ${catalogUrl}.`);
    const grid = qs("[data-project-grid]");
    if (grid) {
      const empty = document.createElement("article");
      empty.className = "empty-state";
      empty.textContent = `Impossible de charger ${catalogUrl}: ${error.message}`;
      grid.replaceChildren(empty);
    }
  }
}

window.addEventListener("hashchange", () => {
  const { route, projectId } = getHashState();
  setRoute(route, projectId);
});

for (const link of routeLinks) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setRoute(link.dataset.route);
  });
}

document.addEventListener("click", (event) => {
  const projectLink = event.target.closest("[data-project-id]");
  if (!projectLink) {
    return;
  }

  event.preventDefault();
  setRoute("project", projectLink.dataset.projectId);
});

qs("[data-project-search]")?.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProjectGrid();
});

setRoute(getHashState().route, getHashState().projectId);
loadCatalog();
