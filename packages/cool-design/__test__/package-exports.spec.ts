import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
