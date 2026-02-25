import { createAppLifecycle, mount, signal, ui } from '../core/index.js';
import { createHashSpa } from '../core/spa/hash-spa.js';
import { createGuideMarkdownFeature } from '../core/spa/guide-markdown.js';

const strux = document.getElementById('strux');

if (typeof strux.__appDestroy === 'function') {
  strux.__appDestroy();
}

const lifecycle = createAppLifecycle();
const { onCleanup } = lifecycle;

const launches = signal(1200);
const count = signal(0);
const route = signal('index');
const snippetIndex = signal(0);

const snippets = [
  "// Hash SPA\nconst route = signal('#index')\nwindow.location.hash = '#documentation'",
  "// Counter state\nconst count = signal(0)\nui.button({ onclick: () => count.value++ }, '+')",
  "// Fetch async state\nconst data = signal(null)\nconst loading = signal(true)\nfetch('/api').then(r => r.json()).then(v => data.value = v)"
];

const posts = [
  {
    slug: 'why-strux',
    title: 'STRUX core: menos fricción, más foco',
    excerpt: 'Cómo construir interfaces con señales y funciones sin complejidad accidental.'
  },
  {
    slug: 'toolstyle-system',
    title: 'STRUX + Toolstyle: utilidades para crecer ordenado',
    excerpt: 'Un enfoque bootstrap-like para no repetir CSS y mantener consistencia visual.'
  },
  {
    slug: 'from-widget-to-spa',
    title: 'De widget a SPA simple con hash routing',
    excerpt: 'Navegación por secciones usando #index, #documentation y #aboutme sin librerías externas.'
  }
];

const routeSeo = {
  index: {
    title: 'STRUX · UI Reactiva Minimalista',
    description: 'STRUX es un runtime UI reactivo y minimalista. Conocé documentación, señales y ciclo de vida.'
  },
  documentation: {
    title: 'Documentation · STRUX first',
    description: 'Documentación STRUX centrada en API ui, signal, runtime y buenas prácticas de lifecycle.'
  },
  aboutme: {
    title: 'About me · STRUX',
    description: 'Perfil del creador de STRUX y visión del proyecto.'
  },
  test: {
    title: 'Test counter · STRUX',
    description: 'Demo reactiva STRUX con contador y manejo de estado con signal.'
  }
};


const spa = createHashSpa({
  routes: ['index', 'documentation', 'aboutme', 'test'],
  defaultRoute: 'index',
  legacy: { articles: 'documentation' },
  onRouteChange(nextRoute) {
    route.value = nextRoute;
    applySeoForRoute(nextRoute);
  }
});

const { GuideContent, loadGuide } = createGuideMarkdownFeature({
  ui,
  lifecycle,
  guideUrl: './README.md'
});

function applySeoForRoute(currentRoute) {
  const seo = routeSeo[currentRoute] || routeSeo.index;
  document.title = seo.title;

  let descriptionMeta = document.querySelector('meta[name="description"]');
  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta');
    descriptionMeta.name = 'description';
    document.head.appendChild(descriptionMeta);
  }
  descriptionMeta.setAttribute('content', seo.description);
}





lifecycle.trackInterval(() => {
  launches.value += 1;
}, 2200);

lifecycle.trackInterval(() => {
  snippetIndex.value = (snippetIndex.value + 1) % snippets.length;
}, 5000);

const stopSpa = spa.start();
onCleanup(stopSpa);

loadGuide();

function Nav() {
  return ui.nav(
    { class: 'nav' },
    ui.div(
      { class: 'container flex items-center justify-between nav-inner' },
      ui.button({ class: 'brand-link', onclick: () => spa.goTo('index') }, ui.div({ class: 'brand' }, 'Str', ui.span('ux'))),
      ui.div(
        { class: 'nav-links flex gap-3 text-muted' },
        ui.a({ href: '#index', class: `nav-link ${route.value === 'index' ? 'is-active' : ''}` }, 'Home'),
        ui.a({ href: '#documentation', class: `nav-link ${route.value === 'documentation' ? 'is-active' : ''}` }, 'Documentation'),
        ui.a({ href: '#aboutme', class: `nav-link ${route.value === 'aboutme' ? 'is-active' : ''}` }, 'About me'),
        ui.a({ href: '#test', class: `nav-link ${route.value === 'test' ? 'is-active' : ''}` }, 'Test')
      ),
      ui.button({ class: 'btn btn-soft', onclick: () => spa.goTo('documentation') }, 'Documentation')
    )
  );
}

function HomePage() {
  return ui.div(Hero(), Features(), Stats());
}

function Hero() {
  return ui.section(
    { class: 'container hero' },
    ui.div(
      ui.div({ class: 'eyebrow' }, '⚡ Runtime pequeño · API declarativa'),
      ui.h1('Construí interfaces reactivas con menos complejidad.'),
      ui.p({ class: 'text-muted' }, 'Strux es un core UI minimalista para crear apps rápidas: señales, componentes y render declarativo sin toolchain pesada.'),
      ui.div(
        { class: 'flex wrap gap-2' },
        ui.button({ class: 'btn btn-primary', onclick: () => spa.goTo('documentation') }, 'Ir a documentación'),
        ui.button({ class: 'btn btn-soft', onclick: () => spa.goTo('aboutme') }, 'Conocer al autor')
      )
    ),
    ui.div(
      { class: 'panel panel' },
      ui.p(ui.strong('Hola Strux 👋')),
      ui.pre(
        { class: 'code' },
        () => snippets[snippetIndex.value]
      )
    )
  );
}

function Features() {
  return ui.section(
    { id: 'features', class: 'container grid-3 py-4' },
    FeatureCard('Simple', 'Creá pantallas con funciones y VNodes claros.'),
    FeatureCard('Reactivo', 'Señales para actualizar solo lo necesario.'),
    FeatureCard('SPA ready', 'Podés navegar por hash y renderizar vistas por ruta.')
  );
}

function FeatureCard(title, text) {
  return ui.article({ class: 'panel card' }, ui.h3(title), ui.p({ class: 'text-muted' }, text));
}

function Stats() {
  return ui.section(
    { class: 'container grid-3 py-3', id: 'dx' },
    StatCard('Lanzamientos de demo', () => launches.value),
    StatCard('Tamaño del core', '~3kb gz'),
    StatCard('Dependencias runtime', '0')
  );
}

function StatCard(label, value) {
  return ui.div({ class: 'panel card' }, ui.div({ class: 'stat-number' }, value), ui.p({ class: 'text-muted' }, label));
}

function DocumentationPage() {
  return ui.section(
    { class: 'container page py-6' },
    ui.h2('Documentation · STRUX first'),
    ui.p({ class: 'text-muted' }, 'Documentación centrada en STRUX: API ui, señales, runtime y patrones para construir apps reales.'),
    GuideContent(),
    ui.div(
      { class: 'grid-3 py-3' },
      posts.map((post) =>
        ui.article(
          { class: 'panel card article-card' },
          ui.h3(post.title),
          ui.p({ class: 'text-muted' }, post.excerpt),
          ui.button({ class: 'btn btn-soft' }, 'Abrir ejemplo STRUX')
        )
      )
    )
  );
}

function AboutPage() {
  return ui.section(
    { class: 'container page py-6' },
    ui.h2('About me'),
    ui.p({ class: 'text-muted' }, 'Soy el creador de Strux. Busco una DX simple para crear interfaces rápidas, mantenibles y modulares.'),
    ui.div(
      { class: 'panel card about' },
      ui.p(ui.strong('Stack favorito:'), ' JavaScript, arquitectura modular, diseño de APIs pequeñas.'),
      ui.p(ui.strong('Objetivo de Strux:'), ' ayudarte a iterar UI sin overhead innecesario.')
    )
  );
}

function TestPage() {
  return ui.section(
    { class: 'container page py-6 test-page' },
    ui.h2('Test counter (estilo React)'),
    ui.p({ class: 'text-muted' }, 'Tres botones: incrementar, decrementar y resetear; contador centrado.'),
    ui.div(
      { class: 'panel card counter-box' },
      ui.p({ class: 'counter-value' }, () => count.value),
      ui.div(
        { class: 'flex gap-2 wrap counter-actions' },
        ui.button({ class: 'btn btn-soft', onclick: () => count.value-- }, 'Decrementar'),
        ui.button({ class: 'btn btn-primary', onclick: () => count.value = 0 }, 'Resetear'),
        ui.button({ class: 'btn btn-soft', onclick: () => count.value++ }, 'Incrementar')
      )
    )
  );
}

function RouterView() {
  return () => {
    if (route.value === 'documentation') return DocumentationPage();
    if (route.value === 'aboutme') return AboutPage();
    if (route.value === 'test') return TestPage();
    return HomePage();
  };
}

function Footer() {
  return ui.footer({ class: 'footer' }, ui.div({ class: 'container text-muted' }, 'Hecho con Strux · SPA hash demo · 2026'));
}

function App() {
  return ui.main(() => Nav(), RouterView(), Footer());
}

const unmount = mount(App(), strux);
onCleanup(unmount);

strux.__appDestroy = lifecycle.destroy;

