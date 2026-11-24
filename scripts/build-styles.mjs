import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { transformWithEsbuild } from 'vite';

const source = fileURLToPath(new URL('../packages/cool-design', import.meta.url));

// 每个目录默认使用自己的 index.scss，转发入口共享原组件的样式。
const owners = {
  'button-group': 'button/group', calendar: 'date-picker/index',
  'checkbox-button': 'checkbox/index', 'checkbox-group': 'checkbox/index',
  'config-provider': null, 'date-time-picker': 'date-picker/index', directives: null,
  'select-option': 'select/index', 'select-option-group': 'select/index',
  'table-column': 'table/index', 'time-picker': 'date-picker/index', 'tour-step': 'tour/index'
};

// 只登记内建渲染、具名组件及关联安装需要的样式。
const dependencies = {
  autocomplete: ['input', 'tooltip', 'icon'], avatar: ['avatar-group', 'icon'],
  'avatar-group': ['avatar', 'tooltip'], breadcrumb: ['icon'], button: ['icon', 'button-group'],
  cascader: ['cascader-panel', 'tooltip'], collapse: ['icon'],
  'color-picker': ['color-picker-panel'], 'color-picker-panel': ['color-picker', 'input'],
  dialog: ['icon'], directives: ['loading', 'popover'], dropdown: ['button', 'tooltip'],
  'input-tag': ['tooltip', 'icon'], link: ['icon'], loading: ['icon'], mention: ['tooltip'],
  menu: ['tooltip'], message: ['icon'], 'message-box': ['button', 'dialog'], 'page-header': ['icon'],
  pagination: ['select', 'icon'], popconfirm: ['tooltip', 'button'], popover: ['tooltip'],
  radio: ['radio-group'], 'radio-group': ['radio', 'radio-button'], rate: ['icon'], result: ['icon'],
  select: ['icon'], 'select-v2': ['tooltip'], slider: ['input-number'], steps: ['icon'],
  switch: ['icon'], table: ['checkbox', 'loading', 'empty', 'tooltip'], 'time-select': ['icon'],
  tour: ['button'], 'tree-select': ['select', 'tree']
};

function componentModules(entry) {
  const visited = new Set();
  const modules = new Set();
  function collect(name) {
    if (visited.has(name)) return;
    visited.add(name);
    const owner = name in owners ? owners[name] : name + '/index';
    if (owner) modules.add(owner);
    for (const dependency of dependencies[name] ?? []) collect(dependency);
  }
  collect(entry);
  return modules;
}

async function minify(css) {
  const result = await transformWithEsbuild(css, 'style.css', {
    loader: 'css', charset: 'utf8', minify: true, sourcemap: false, legalComments: 'none',
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14']
  });
  return result.code;
}

export async function buildStyles(entries, roots) {
  const options = { loadPaths: [source] };
  const full = sass.compile(join(source, 'style/published.scss'), options);
  let fullCss = full.css;
  for (const ext of ['woff2', 'woff', 'ttf']) {
    const font = await readFile(join(source, 'icon/fonts/iconfont.' + ext));
    fullCss = fullCss.replaceAll(new RegExp('url\\("\\.\\./icon/fonts/iconfont\\.' + ext + '\\?[^"]+"\\)', 'g'),
      'url(data:font/' + ext + ';base64,' + font.toString('base64') + ')');
  }
  const css = await minify(fullCss);
  for (const root of roots) {
    await mkdir(join(root, 'styles'), { recursive: true });
    await cp(join(source, 'icon/fonts'), join(root, 'icon/fonts'), { recursive: true });
    await writeFile(join(root, 'style.css'), css);
  }

  const sassRoot = join(roots[0], 'sass');
  for (const url of full.loadedUrls) {
    if (url.protocol !== 'file:') continue;
    const file = fileURLToPath(url);
    const dest = join(sassRoot, relative(source, file));
    await mkdir(dirname(dest), { recursive: true });
    await cp(file, dest);
  }
  await cp(join(source, 'icon/fonts'), join(sassRoot, 'icon/fonts'), { recursive: true });

  const order = [...(await readFile(join(source, 'style/index.scss'), 'utf8'))
    .matchAll(/@use '\.\.\/([^']+)\.scss'/g)].map((match) => match[1]);
  for (const entry of entries) {
    const modules = componentModules(entry);
    const ordered = order.filter((name) => modules.has(name));
    if (ordered.length !== modules.size) throw new Error('未登记的组件样式 ' + entry);
    const styles = ['style/tokens', 'style/palette', 'style/border', ...ordered];
    const scss = styles.map((name, i) => `@use "${name}" as sheet${i};`).join('\n');
    const css = await minify(sass.compileString(scss, options).css);
    for (const root of roots) await writeFile(join(root, 'styles', entry + '.css'), css);
  }
}
