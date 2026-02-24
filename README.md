# STRUX

> Minimal reactive UI core.
> Signals. Declarative nodes. Zero runtime dependencies.

STRUX is a lightweight UI runtime for building reactive interfaces using **signals** and **pure functions**, without virtual DOM overhead or complex tooling.

---

## ✨ Why STRUX?

* 🧠 Explicit state model
* ⚡ Granular reactivity
* 📦 Tiny runtime
* 🚫 No dependencies
* 🧩 Components are just functions

STRUX focuses on clarity and control rather than abstraction layers.

---

# 📦 Installation

STRUX is designed to work natively with ES Modules.

```html
<div id="strux"></div>
<script type="module" src="./main.js"></script>
```

```js
import { mount, signal, ui } from './core/index.js';

const strux = document.getElementById('strux');
```

---

# 🚀 Basic Usage

## 1. Mount plain text

```js
mount('Hello world', strux);
```

---

## 2. Mount a UI node

```js
mount(ui.h1('Hello world'), strux);
```

`ui.*` functions generate declarative VNodes.

---

# 🧱 Declarative Structure

```js
mount(
  ui.div({ class: 'card' },
    ui.h1('Hello world'),
    ui.button(
      { onclick: () => alert('CLICK') },
      'Alert'
    )
  ),
  strux
);
```

### Pattern

```js
ui.tagName(props?, ...children)
```

Children can be:

* strings
* other `ui.*` nodes
* reactive functions

---

# 🔁 Reactive State with `signal`

```js
const count = signal(0);

const Card = ui.div({ class: 'card' },
  ui.p(() => count.value),
  ui.button({ onclick: () => count.value-- }, 'Decrease'),
  ui.button({ onclick: () => count.value = 0 }, 'Reset'),
  ui.button({ onclick: () => count.value++ }, 'Increase')
);

mount(Card, strux);
```

### How it works

* `signal(initialValue)` creates reactive state.
* Reading `count.value` subscribes the node.
* Writing `count.value = x` triggers a selective re-render.

Only dependent nodes update.

---

# 🧩 Components

In STRUX, a component is just a function:

```js
function Card() {
  const counter = signal(0);

  return ui.div({ class: 'card' },
    ui.p(() => counter.value),
    ui.button({ onclick: () => counter.value-- }, 'Decrease'),
    ui.button({ onclick: () => counter.value = 0 }, 'Reset'),
    ui.button({ onclick: () => counter.value++ }, 'Increase')
  );
}

mount(Card(), strux);
```

No lifecycle hooks.
No hidden behavior.
No class-based system.

---

# 📨 Props

```js
function Profile({ name, age, email }) {
  name = name || 'Name not provided';
  age = age || '';
  email = email || 'example@email.com';

  return ui.div({ class: 'profile' },
    ui.div({ class: 'field_name' }, ui.h3(name)),
    age ? ui.div({ class: 'field_age' }, ui.h6(age)) : '',
    ui.div({ class: 'field_email' }, ui.h4(email)),
  );
}

const data = {
  name: 'Braian',
  age: 30,
  email: 'braiidev@gmail.com'
};

mount(Profile(data), strux);
```

Props are plain function arguments.

---

# ♻️ Composition

```js
function Field(label, value) {
  return ui.p(
    ui.b(label),
    `: ${value}`
  );
}

function App() {
  const user = {
    name: 'Braian',
    surname: 'Cano',
    email: 'braiidev@gmail.com',
    job: 'Trader'
  };

  return ui.div(
    ui.h2('Profile:'),
    Field('Name', user.name),
    Field('Surname', user.surname),
    Field('Email', user.email),
    Field('Job', user.job),
  );
}

mount(App(), strux);
```

Composition is direct and transparent.

---

# 🌐 Async State + Conditional Rendering

STRUX provides `ui.dynamic()` for structured conditional rendering.

```js
const user = signal(null);
const loading = signal(true);
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
```

Render logic:

```js
function App() {
  return ui.div(
    ui.dynamic(
      ui.p(() => `Loading...`),
      () => ui.div(
        ui.h2(user.value.name),
        ui.p(user.value.email),
        ui.p(user.value.phone)
      ),
      ui.p('Error fetching user')
    ).check(loading, error)
  );
}

mount(App(), strux);
```

### `.check(loading, error)`

Evaluation order:

1. If `loading` is truthy → show first node
2. If `error` is truthy → show third node
3. Otherwise → show success node

---

# 🧠 Core Philosophy

STRUX is built around three principles:

### 1. Explicit Signals

State is always accessed via `.value`.

### 2. Pure Functional Components

No classes. No decorators. No hooks.

### 3. Granular Updates

Only nodes that depend on a signal re-render.

---

# 📐 Mental Model

STRUX is not trying to replace large frameworks.

It is ideal for:

* Widgets
* Dashboards
* Small SPAs
* Embedded UI systems
* Rapid prototypes
* Educational tooling

---

# 🧪 Minimal Complete Example

```js
import { mount, signal, ui } from './core/index.js';

const strux = document.getElementById('strux');
const count = signal(0);

function App() {
  return ui.div(
    ui.h1('Counter'),
    ui.p(() => count.value),
    ui.button({ onclick: () => count.value++ }, 'Increase')
  );
}

mount(App(), strux);
```

---

# 📌 Roadmap Ideas

* Router helper
* Devtools panel
* SSR adapter
* TypeScript definitions
* Testing utilities

---

# 📄 License

MIT

---