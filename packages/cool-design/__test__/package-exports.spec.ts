import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

describe('发布入口', () => {
  it('所有声明的组件子路径都应包含 ESM 和 CJS 入口', () => {
    const componentDirs = ['calendar', 'date-time-picker', 'time-picker', 'directives'];

    for (const directory of componentDirs) {
      expect(existsSync(resolve(root, 'es/packages/cool-design', directory, 'index.js'))).toBe(true);
      expect(existsSync(resolve(root, 'lib/packages/cool-design', directory, 'index.cjs'))).toBe(true);
    }

    expect(existsSync(resolve(root, 'es/packages/cool-design/hooks.js'))).toBe(true);
    expect(existsSync(resolve(root, 'lib/packages/cool-design/hooks.cjs'))).toBe(true);
  });

  it('hooks 子路径应指向独立的 hooks 入口', () => {
    expect(packageJson.exports['./hooks'].import.default).toBe('./es/packages/cool-design/hooks.js');
    expect(packageJson.exports['./hooks'].require.default).toBe('./lib/packages/cool-design/hooks.cjs');
  });
});
