import { VNODE_TYPES } from '../vnode/types.js';

export function createActiveNode(compute) {
  return { type: VNODE_TYPES.SIGNAL, compute };
}

export function createTextVNode(value) {
  return { type: VNODE_TYPES.TEXT, value: String(value) };
}

export function normalizeChildren(children, out = []) {
  for (const child of children) {
    if (child === null || child === undefined || child === true || child === false) continue;

    if (Array.isArray(child)) {
      normalizeChildren(child, out);
      continue;
    }

    if (typeof child === 'object' && child.type) {
      out.push(child);
      continue;
    }

    if (typeof child === 'string' || typeof child === 'number') {
      out.push(createTextVNode(child));
      continue;
    }

    if (typeof child === 'function') {
      out.push(createActiveNode(child));
      continue;
    }

    throw new Error(`Child type is not supported: ${typeof child}`);
  }

  return out;
}

export function createElement(tag, props, ...children) {
  if (typeof tag !== 'string') throw new Error('Tag must be string type');

  let nextProps = {};
  if (props != null) {
    if (typeof props !== 'object' || Array.isArray(props)) throw new Error('Props must be an object');
    nextProps = props;
  }

  return {
    type: VNODE_TYPES.ELEMENT,
    tag,
    props: nextProps,
    children: normalizeChildren(children)
  };
}
