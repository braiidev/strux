const activeSignal = { current: null };

function cleanupEffectDeps(effect) {
  if (!effect?.deps) return;

  effect.deps.forEach((subscribers) => {
    subscribers.delete(effect);
  });
  effect.deps.clear();
}

export function withActiveSignal(effect, compute) {
  cleanupEffectDeps(effect);
  activeSignal.current = effect;
  const value = compute();
  activeSignal.current = null;
  return value;
}

export function disposeReactiveEffect(effect) {
  cleanupEffectDeps(effect);
  effect.disposed = true;
}

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  return {
    get value() {
      const current = activeSignal.current;
      if (current && !current.disposed) {
        subscribers.add(current);
        if (!current.deps) current.deps = new Set();
        current.deps.add(subscribers);
      }
      return value;
    },
    set value(nextValue) {
      if (Object.is(value, nextValue)) return;
      value = nextValue;
      [...subscribers].forEach((sub) => {
        if (!sub.disposed) sub();
      });
    }
  };
}
