const views = [...document.querySelectorAll("[data-view]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];
const knownRoutes = new Set(views.map((view) => view.dataset.view));

function setRoute(route) {
  const nextRoute = knownRoutes.has(route) ? route : "home";

  for (const view of views) {
    view.classList.toggle("is-active", view.dataset.view === nextRoute);
  }

  for (const link of routeLinks) {
    link.classList.toggle("is-active", link.dataset.route === nextRoute);
  }

  if (location.hash.slice(1) !== nextRoute) {
    history.replaceState(null, "", `#${nextRoute}`);
  }
}

window.addEventListener("hashchange", () => setRoute(location.hash.slice(1)));

for (const link of routeLinks) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setRoute(link.dataset.route);
  });
}

setRoute(location.hash.slice(1));
