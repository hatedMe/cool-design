import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const designRoot = resolve(root, 'packages/cool-design');
const esRoot = resolve(root, 'es/packages/cool-design');
const libRoot = resolve(root, 'lib/packages/cool-design');

// 所有带 index.ts 的目录都是可经 “包名/目录” 子路径导入的入口。
const componentDirs = readdirSync(designRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => entry.name !== '__test__')
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(designRoot, name, 'index.ts')));

describe('发布入口', () => {
  it('构建后的 ESM 与 CJS 主入口可由 Node 直接加载', () => {
    const script = `
      import { createRequire } from 'node:module';
      const esm = await import('./es/packages/cool-design/index.js');
      const cjs = createRequire(import.meta.url)('./lib/packages/cool-design/index.cjs');
      if (!esm.Button || !cjs.Button) throw new Error('主入口缺少 Button');
      const subpath = await import('./es/packages/cool-design/message-box/index.js');
      const cjsSubpath = createRequire(import.meta.url)('./lib/packages/cool-design/message-box/index.cjs');
      for (const service of [esm.MessageBox, cjs.MessageBox, subpath.default, cjsSubpath.default]) {
        for (const method of ['confirm', 'alert', 'prompt', 'msgbox', 'close']) {
          if (typeof service?.[method] !== 'function') throw new Error('消息确认框缺少方法 ' + method);
        }
      }
      for (const service of [esm.ElMessageBox, cjs.ElMessageBox, subpath.default, cjsSubpath.default]) {
        if (typeof service !== 'function') throw new Error('消息确认框服务导出丢失');
      }
    `;
    expect(() => execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, stdio: 'pipe' })).not.toThrow();
  });

  it('发布 CSS 引用的本地资源均随包输出', () => {
    for (const format of ['es', 'lib']) {
      const cssPath = resolve(root, format, 'style.css');
      const css = readFileSync(cssPath, 'utf8');
      for (const match of css.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
        const url = match[2];
        if (/^(data:|https?:|#)/.test(url)) continue;
        expect(existsSync(resolve(dirname(cssPath), url.split(/[?#]/)[0])), `${format} 缺少资源 ${url}`).toBe(true);
      }
    }
  });

  it('每个组件子路径都应有 ESM 与 CJS 入口及类型声明', () => {
    expect(componentDirs.length).toBeGreaterThan(50);

    for (const directory of componentDirs) {
      expect(existsSync(join(esRoot, directory, 'index.js')), `${directory} 缺少 es 入口`).toBe(true);
      expect(existsSync(join(esRoot, directory, 'index.d.ts')), `${directory} 缺少 es 类型声明`).toBe(true);
      expect(existsSync(join(libRoot, directory, 'index.cjs')), `${directory} 缺少 lib 入口`).toBe(true);
      expect(existsSync(join(libRoot, directory, 'index.d.cts')), `${directory} 缺少 lib 类型声明`).toBe(true);
    }
  });

  it('主入口与 hooks 子路径应包含声明文件', () => {
    expect(existsSync(join(esRoot, 'index.d.ts'))).toBe(true);
    expect(existsSync(join(esRoot, 'hooks.d.ts'))).toBe(true);
    expect(existsSync(join(libRoot, 'index.d.cts'))).toBe(true);
    expect(existsSync(join(libRoot, 'hooks.d.cts'))).toBe(true);
    expect(packageJson.exports['./hooks'].import.types).toBe('./es/packages/cool-design/hooks.d.ts');
    expect(packageJson.exports['./hooks'].import.default).toBe('./es/packages/cool-design/hooks.js');
    expect(packageJson.exports['./hooks'].require.default).toBe('./lib/packages/cool-design/hooks.cjs');
  });

  it('样式入口应存在且不打包任何依赖', () => {
    expect(existsSync(resolve(root, 'es/style.css'))).toBe(true);
    expect(existsSync(resolve(root, 'es/node_modules')), 'es 产物不应包含 node_modules').toBe(false);
    expect(existsSync(resolve(root, 'es/package.json.js')), 'es 不应产生 package.json.js 副产物').toBe(false);
    expect(existsSync(resolve(root, 'es/_virtual')), 'es 不应产生 _virtual 目录').toBe(false);
  });
});
