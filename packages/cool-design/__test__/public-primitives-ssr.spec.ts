import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const render = `
const view = () => h(C.ConfigProvider, { namespace: 'acme' }, () => h('main', [
  h(C.Overlay, { mask: false, zIndex: 2200 }, () => h('span', 'overlay')),
  h(C.CollapseTransition, null, () => h('div', 'collapse')),
  h(C.Popper, { role: 'tooltip' }, () => [
    h(C.PopperTrigger, { id: 'ssr-tip', open: false }, () => h('button', 'trigger')),
    h(C.PopperContent, { id: 'ssr-tip', visible: false }, () => [h('span', 'content'), h(C.PopperArrow)])
  ])
]));
`;

test('新公共组件在无 DOM 环境渲染，并能保留节点完成客户端接管', () => {
  const html = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import { createSSRApp, h } from 'vue';
    import * as C from './es/packages/cool-design/index.js';
    assert.equal(typeof window, 'undefined');
    assert.equal(typeof document, 'undefined');
    const require = createRequire(import.meta.url);
    const { renderToString } = createRequire(require.resolve('vue'))('@vue/server-renderer');
    ${render}
    process.stdout.write(await renderToString(createSSRApp({ render: view })));
  `], { cwd: root, encoding: 'utf8' });
  expect(html).toContain('acme-popper');
  const result = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import { JSDOM } from 'jsdom';
    const dom = new JSDOM('<!doctype html><body><div id="app">' + fs.readFileSync(0, 'utf8') + '</div></body>');
    for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'SVGElement', 'Node', 'MutationObserver', 'Event', 'MouseEvent']) {
      Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    globalThis.getComputedStyle = dom.window.getComputedStyle;
    const { createSSRApp, h, nextTick } = await import('vue');
    const C = await import('./es/packages/cool-design/index.js');
    ${render}
    const warnings = [];
    console.warn = (...args) => warnings.push(args.join(' '));
    const host = document.getElementById('app');
    const button = host.querySelector('button');
    const app = createSSRApp({ render: view });
    app.mount(host);
    await nextTick(); await nextTick();
    assert.equal(host.querySelector('button'), button);
    assert.deepEqual(warnings, []);
    app.unmount();
    console.log('hydration passed');
  `], { cwd: root, input: html, encoding: 'utf8' });
  expect(result).toContain('hydration passed');
});
