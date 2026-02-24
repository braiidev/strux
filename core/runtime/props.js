export function setProps(dom, props, registerCleanup) {
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      dom.addEventListener(event, value);
      if (registerCleanup) {
        registerCleanup(() => dom.removeEventListener(event, value));
      }
      continue;
    }

    if (key === 'style' && typeof value === 'object') {
      Object.assign(dom.style, value);
      continue;
    }

    if (typeof value === 'boolean') {
      if (value) dom.setAttribute(key, '');
      continue;
    }

    dom.setAttribute(key, value);
  }
}
