export function createAppLifecycle() {
  const cleanups = [];

  const onCleanup = (cleanup) => {
    if (typeof cleanup === 'function') cleanups.push(cleanup);
    return cleanup;
  };

  const trackInterval = (callback, delay) => {
    const id = setInterval(callback, delay);
    onCleanup(() => clearInterval(id));
    return id;
  };

  const trackEvent = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    onCleanup(() => target.removeEventListener(event, handler, options));
    return handler;
  };

  const trackAbortController = () => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    return controller;
  };

  const destroy = () => {
    while (cleanups.length) {
      const cleanup = cleanups.pop();
      try {
        cleanup();
      } catch {
        // ignore teardown failures to continue cleanup chain
      }
    }
  };

  return {
    onCleanup,
    trackInterval,
    trackEvent,
    trackAbortController,
    destroy
  };
}

