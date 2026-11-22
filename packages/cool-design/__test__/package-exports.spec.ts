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
      const esmDirect = await import('./es/packages/cool-design/avatar-group/avatar-group.js');
      const cjsDirect = createRequire(import.meta.url)('./lib/packages/cool-design/avatar-group/avatar-group.cjs');
      for (const item of [esmDirect, cjsDirect]) {
        if (typeof item.default.install !== 'function') throw new Error('AvatarGroup 直接模块无法独立安装');
      }
      const esm = await import('./es/packages/cool-design/index.js');
      const cjs = createRequire(import.meta.url)('./lib/packages/cool-design/index.cjs');
      const esmPublic = await import('cool-design');
      const cjsPublic = createRequire(import.meta.url)('cool-design');
      for (const item of [esmPublic, cjsPublic]) {
        if (item.ElButton !== item.Button || item.ElNotification !== item.Notify) throw new Error('兼容入口丢失');
        if (typeof item.ElInfiniteScroll.install !== 'function') throw new Error('指令不可安装');
      }
      if (Object.keys(esmPublic).sort().join() !== Object.keys(cjsPublic).sort().join()) throw new Error('发布格式导出不一致');
      if (!esm.Button || !cjs.Button) throw new Error('主入口缺少 Button');
      for (const [entry, sub, direct] of [
        [esmPublic, await import('cool-design/avatar-group'), esmDirect],
        [cjsPublic, createRequire(import.meta.url)('cool-design/avatar-group'), cjsDirect]
      ]) {
        const component = entry.AvatarGroup;
        if (!component || component !== entry.ElAvatarGroup || component !== sub.AvatarGroup ||
          component !== sub.default || component !== direct.default || typeof component.install !== 'function') {
          throw new Error('AvatarGroup 发布入口不一致');
        }
      }
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

  it('Avatar 与 AvatarGroup 可按任意顺序导入并关联安装', () => {
    const script = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      const [format, first] = process.argv.slice(1);
      const load = format === 'esm' ? (name) => import(name) : createRequire(import.meta.url);
      const second = first === 'avatar' ? 'avatar-group' : 'avatar';
      const subpaths = { [first]: await load('cool-design/' + first), [second]: await load('cool-design/' + second) };
      const { default: Avatar } = subpaths.avatar;
      const { default: AvatarGroup } = subpaths['avatar-group'];
      const { createApp } = await load('vue');
      assert.equal(Avatar.AvatarGroup, AvatarGroup);
      const app = createApp({});
      app.use(Avatar);
      assert.equal(app.component('IAvatar'), Avatar);
      assert.equal(app.component('i-avatar-group'), AvatarGroup);
      assert.equal(app.component('IAvatarGroup'), AvatarGroup);
      assert.equal(app.component('ElAvatarGroup'), AvatarGroup);
      assert.equal(createApp({}).use(AvatarGroup).component('ElAvatarGroup'), AvatarGroup);
      const library = await load('cool-design');
      assert.equal(library.Avatar, Avatar);
      assert.equal(library.AvatarGroup, AvatarGroup);
      assert.equal(library.ElAvatar.AvatarGroup, library.ElAvatarGroup);
      assert.equal(createApp({}).use(library.default).component('ElAvatarGroup'), AvatarGroup);
    `;
    for (const format of ['esm', 'cjs']) {
      for (const first of ['avatar', 'avatar-group']) {
        expect(() => execFileSync(process.execPath, ['--input-type=module', '-e', script, format, first], {
          cwd: root, stdio: 'pipe'
        }), `${format} ${first}`).not.toThrow();
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
    expect(readFileSync(resolve(root, 'es/style.css'), 'utf8')).toContain('.i-avatar-group__collapse-avatars');
    expect(existsSync(resolve(root, 'es/node_modules')), 'es 产物不应包含 node_modules').toBe(false);
    expect(existsSync(resolve(root, 'es/package.json.js')), 'es 不应产生 package.json.js 副产物').toBe(false);
    expect(existsSync(resolve(root, 'es/_virtual')), 'es 不应产生 _virtual 目录').toBe(false);
  });
});
