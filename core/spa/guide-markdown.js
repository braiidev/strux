import { signal } from '../index.js';

function parseMarkdownToVNode(ui, markdown) {
  const lines = markdown.split(/\r?\n/);
  const nodes = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      nodes.push(ui.pre({ class: 'doc-code' }, code.join('\n')));
      continue;
    }

    if (line.startsWith('### ')) {
      nodes.push(ui.h3({ class: 'doc-h3' }, line.slice(4).trim()));
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      nodes.push(ui.h2({ class: 'doc-h2' }, line.slice(3).trim()));
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      nodes.push(ui.h1({ class: 'doc-h1' }, line.slice(2).trim()));
      i += 1;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i += 1;
      }
      nodes.push(ui.ol({ class: 'doc-list' }, items.map((item) => ui.li(item))));
      continue;
    }

    if (/^-\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^-\s/.test(lines[i])) {
        items.push(lines[i].replace(/^-\s/, '').trim());
        i += 1;
      }
      nodes.push(ui.ul({ class: 'doc-list' }, items.map((item) => ui.li(item))));
      continue;
    }

    const paragraph = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,3}\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^-\s/.test(lines[i])
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    nodes.push(ui.p({ class: 'doc-p' }, paragraph.join(' ')));
  }

  return nodes;
}

export function createGuideMarkdownFeature({ ui, lifecycle, guideUrl = './README.md' }) {
  const guideMarkdown = signal('');
  const guideLoading = signal(true);
  const guideError = signal(false);

  async function loadGuide() {
    const controller = lifecycle.trackAbortController();

    try {
      const res = await fetch(guideUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`Cannot load ${guideUrl}`);
      guideMarkdown.value = await res.text();
    } catch {
      if (!controller.signal.aborted) {
        guideError.value = true;
      }
    } finally {
      if (!controller.signal.aborted) {
        guideLoading.value = false;
      }
    }
  }

  function GuideContent() {
    return ui.dynamic(
      ui.p({ class: 'u-text-muted' }, 'Cargando documentación ...'),
      () => ui.div({ class: 'doc-view u-panel' }, parseMarkdownToVNode(ui, guideMarkdown.value)),
      ui.p({ class: 'u-text-muted' }, `No se pudo cargar ${guideUrl}`)
    ).check(guideLoading, guideError);
  }

  return { GuideContent, loadGuide };
}

