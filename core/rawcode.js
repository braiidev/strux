const VNODE_TYPES = { ELEMENT: 'element', TEXT: 'text', SIGNAL: 'signal' };

const TAGS = [
    'header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'strong', 'em', 'small', 'mark', 'b',
    'code', 'pre', 'blockquote', 'cite', 'br', 'hr',
    'button', 'a',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'form', 'fieldset', 'legend', 'label',
    'input', 'textarea', 'select', 'option', 'optgroup',
    'img', 'figure', 'figcaption', 'picture', 'source',
    'video', 'audio', 'track',
    'table', 'caption', 'thead', 'tbody', 'tfoot',
    'tr', 'th', 'td', 'colgroup', 'col'
];

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

function createActiveNode(vnode) {
    return { type: VNODE_TYPES.SIGNAL, compute: vnode };
}

function createTextVNode(value) {
    return { type: VNODE_TYPES.TEXT, value: String(value) };
}

function normalizeChildren(children, out = []) {
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

function createElement(tag, props, ...children) {
    if (typeof tag !== 'string') throw new Error('Tag must be string type');

    let _props = {};
    if (props != null) {
        if (typeof props !== 'object' || Array.isArray(props)) throw new Error('Props must be an object');
        _props = props;
    }

    return {
        type: VNODE_TYPES.ELEMENT,
        tag,
        props: _props,
        children: normalizeChildren(children)
    };
}

function setProps(dom, props) {
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('on') && typeof value === 'function') {
            const event = key.slice(2).toLowerCase();
            dom.addEventListener(event, value);
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

function renderEffect(vnode) {
    const marker = document.createComment('signal');
    let currentNode = document.createTextNode('');

    const effect = () => {
        activeSignal.current = effect;
        const value = vnode.compute();
        activeSignal.current = null;

        const nextNode = render(value ?? '');
        if (currentNode.parentNode) {
            currentNode.parentNode.replaceChild(nextNode, currentNode);
        } else if (marker.parentNode) {
            marker.parentNode.insertBefore(nextNode, marker.nextSibling);
        }
        currentNode = nextNode;
    };

    queueMicrotask(effect);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(marker);
    fragment.appendChild(currentNode);
    return fragment;
}

function render(vnode) {
    if (vnode?.type === undefined && ['string', 'number'].includes(typeof vnode)) {
        return document.createTextNode(String(vnode));
    }

    if (vnode?.type === VNODE_TYPES.TEXT) return document.createTextNode(vnode.value);

    if (vnode?.type === VNODE_TYPES.SIGNAL) return renderEffect(vnode);

    if (Array.isArray(vnode)) {
        const fragment = document.createDocumentFragment();
        vnode.forEach((child) => fragment.appendChild(render(child)));
        return fragment;
    }

    if (vnode?.type === VNODE_TYPES.ELEMENT) {
        const $el = document.createElement(vnode.tag);
        setProps($el, vnode.props || {});
        vnode.children.forEach((child) => {
            $el.appendChild(render(child));
        });
        return $el;
    }

    throw new Error(`VNode has not been created: ${vnode}`);
}

function mount(vnode, container) {
    if (!(container instanceof Element)) throw new Error('The container must be an HTMLElement');
    container.innerHTML = '';
    const dom = render(vnode);
    container.appendChild(dom);
    container.__vnode = vnode;
}

const activeSignal = {};
function signal(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    return {
        get value() {
            if (activeSignal.current) subscribers.add(activeSignal.current);
            return value;
        },
        set value(newValue) {
            if (value === newValue) return;
            value = newValue;
            subscribers.forEach((sub) => sub());
        }
    };
}

const strux = document.getElementById('strux');

// 1- mount('Hola mundo', strux)
// 2- mount(ui.h1('Hola mundo'), strux)
/* 3-
mount(ui.div({ class: 'card' },
    ui.h1('Hola mundo'),
    ui.button({ onclick: () => alert('CLICK') }, 'Alert')
), strux);
*/
// 4-
/*
const count = signal(0);
const Card = ui.div({ class: 'card' },
    ui.p(() => count.value),
    ui.button({ onclick: () => count.value-- }, 'Restar'),
    ui.button({ onclick: () => count.value = 0 }, 'Resetear'),
    ui.button({ onclick: () => count.value++ }, 'Sumar')
)
mount(Card, strux);
*/
// 5-
/* function Card() {
    const counter = signal(0);
    return ui.div({ class: 'card' },
        ui.p(() => counter.value),
        ui.button({ onclick: () => counter.value-- }, 'Restar'),
        ui.button({ onclick: () => counter.value = 0 }, 'Resetear'),
        ui.button({ onclick: () => counter.value++ }, 'Sumar')
    )
}
mount(Card(), strux);
*/
// 6- 
/*
function Profile({ name, age, email }) {
    name = name || 'You are not provided name';
    age = age || '';
    email = email || 'example@email.com';

    return ui.div({ class: 'profile' },
        ui.div({ class: 'field_name' }, ui.h3(name)),
        age ? ui.div({ class: 'field_age' }, ui.h6(age)) : '',
        ui.div({ class: 'field_email' }, ui.h4(email)),
    )
}
// mount(Profile({}), strux);
const data = { name: 'braian', age: 30, email: 'braiidev@gmail.com' };
mount(Profile(data), strux);
*/
// 7-
/*function Field(label, signalValue) {
    return ui.p(ui.b(label), `: ${signalValue}`)
}
function App() {
    const user = { name: 'Braian', surname: 'Cano', email: 'braiidev@gmail.com', job: 'Trader' }//fetch
    return ui.div({ style: { margin: 0, padding: 0 } },
        ui.h2('Perfil:'),
        ui.span({ style: { width: '150px', height: '2px', display: 'block', background: 'red' } }),
        Field('Nombre', user.name),
        Field('Apellido', user.surname),
        Field('Email', user.email),
        Field('Oficio', user.job),
    )
}
mount(App(), strux);
*/
// 8- IF
const user = signal(null);
const loading = signal(5);
const error = signal(false);

async function fetchUser() {
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
        if (!res.ok) throw new Error();
        user.value = await res.json();
    } catch {
        error.value = true;
    } finally {
        loading.value = false;
    }
}

const int = setInterval(() => {
    if (loading.value == 0) {
        fetchUser();
        clearTimeout(int);
    }
    else {
        loading.value = loading.value - 1;
    }
}, 1000);

function App() {
    return ui.div(
        { class: 'app' },
        ui.dynamic(
            ui.p(()=>`Loading user... wait ${loading.value}`),
            () => ui.div({ class: 'user-card' }, ui.h2(user.value.name), ui.p(user.value.email), ui.p(user.value.phone)),
            ui.p('Error when fetch user...')
        ).check(loading, error)
    );
}

mount(App(), strux);
