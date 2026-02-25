export function createHashSpa({
  routes = [],
  defaultRoute = 'index',
  legacy = {},
  onRouteChange
} = {}) {
  const allowed = new Set(routes);
  let currentRoute = defaultRoute;
  let started = false;

  function normalizeHash(hashValue) {
    const raw = (hashValue || `#${defaultRoute}`).replace('#', '');
    const mapped = legacy[raw] || raw;
    return allowed.has(mapped) ? mapped : defaultRoute;
  }

  function updateRoute(nextRoute) {
    currentRoute = nextRoute;
    if (typeof onRouteChange === 'function') {
      onRouteChange(nextRoute);
    }
    return nextRoute;
  }

  function handleHashChange() {
    return updateRoute(normalizeHash(window.location.hash));
  }

  function start() {
    if (started) return stop;
    started = true;
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return stop;
  }

  function stop() {
    if (!started) return;
    started = false;
    window.removeEventListener('hashchange', handleHashChange);
  }

  function goTo(routeName) {
    window.location.hash = `#${routeName}`;
  }

  function getRoute() {
    return currentRoute;
  }

  return {
    normalizeHash,
    start,
    stop,
    goTo,
    getRoute,
    get currentRoute() {
      return currentRoute;
    }
  };
}

