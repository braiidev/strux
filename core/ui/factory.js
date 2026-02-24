import { VNODE_TYPES } from '../vnode/types.js';
import { TAGS } from './tags.js';
import { createElement } from '../runtime/normalize.js';

export function createUI() {
  const ui = {
    if(condition, thenVNode, elseVNode = null) {
      return {
        type: VNODE_TYPES.SIGNAL,
        compute() {
          return condition() ? thenVNode : elseVNode;
        }
      };
    },

    for(list, render) {
      return {
        type: VNODE_TYPES.SIGNAL,
        compute() {
          return list().map((item, index) => render(item, index));
        }
      };
    },

    dynamic(first, loaded, error) {
      return {
        check(loadingSignal, errorSignal) {
          return {
            type: VNODE_TYPES.SIGNAL,
            compute() {
              if (loadingSignal.value) return first;
              if (errorSignal.value) return error;
              return typeof loaded === 'function' ? loaded() : loaded;
            }
          };
        }
      };
    }
  };

  TAGS.forEach((tag) => {
    ui[tag] = (propsOrChild, ...children) => {
      if (
        typeof propsOrChild === 'object' &&
        propsOrChild !== null &&
        !Array.isArray(propsOrChild) &&
        !propsOrChild.type
      ) {
        return createElement(tag, propsOrChild, ...children);
      }

      return createElement(tag, null, propsOrChild, ...children);
    };
  });

  return ui;
}
