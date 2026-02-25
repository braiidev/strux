import { createUI } from './ui/factory.js';

export { signal } from './reactivity/signal.js';
export { mount } from './runtime/render.js';
export { createAppLifecycle } from './lifecycle/app-lifecycle.js';

export const ui = createUI();

