import { VNODE_TYPES } from '../vnode/types.js';
import { setProps } from './props.js';
import { disposeReactiveEffect, withActiveSignal } from '../reactivity/signal.js';

function renderEffect(vnode, render, registerCleanup) {
  const marker = document.createComment('signal');
  let currentNode = document.createTextNode('');

  const effect = () => {
    if (effect.disposed) return;

    const value = withActiveSignal(effect, vnode.compute);
    const nextNode = render(value ?? '');

    if (currentNode.parentNode) {
      currentNode.parentNode.replaceChild(nextNode, currentNode);
    } else if (marker.parentNode) {
      marker.parentNode.insertBefore(nextNode, marker.nextSibling);
    }

    currentNode = nextNode;
  };
  effect.deps = new Set();
  effect.disposed = false;

  queueMicrotask(effect);

  registerCleanup(() => {
    disposeReactiveEffect(effect);
  });

  const fragment = document.createDocumentFragment();
  fragment.appendChild(marker);
  fragment.appendChild(currentNode);
  return fragment;
}

export function createRenderer() {
  const cleanups = [];
  const registerCleanup = (fn) => cleanups.push(fn);

  function render(vnode) {
    if (vnode?.type === undefined && ['string', 'number'].includes(typeof vnode)) {
      return document.createTextNode(String(vnode));
    }

    if (vnode?.type === VNODE_TYPES.TEXT) return document.createTextNode(vnode.value);

    if (vnode?.type === VNODE_TYPES.SIGNAL) return renderEffect(vnode, render, registerCleanup);

    if (Array.isArray(vnode)) {
      const fragment = document.createDocumentFragment();
      vnode.forEach((child) => fragment.appendChild(render(child)));
      return fragment;
    }

    if (vnode?.type === VNODE_TYPES.ELEMENT) {
      const $el = document.createElement(vnode.tag);
      setProps($el, vnode.props || {}, registerCleanup);
      vnode.children.forEach((child) => $el.appendChild(render(child)));
      return $el;
    }

    throw new Error(`VNode has not been created: ${vnode}`);
  }

  function cleanup() {
    while (cleanups.length) {
      const fn = cleanups.pop();
      try {
        fn();
      } catch {
        // no-op cleanup failures
      }
    }
  }

  return { render, cleanup };
}

export function mount(vnode, container) {
  if (!(container instanceof Element)) throw new Error('The container must be an HTMLElement');

  if (typeof container.__cleanup === 'function') {
    container.__cleanup();
  }

  const runtime = createRenderer();
  container.innerHTML = '';
  container.appendChild(runtime.render(vnode));
  container.__vnode = vnode;

  const unmount = () => {
    runtime.cleanup();
    container.innerHTML = '';
    container.__vnode = null;
    container.__cleanup = null;
  };

  container.__cleanup = unmount;
  return unmount;
}
