import { createApp } from 'vue';
import { describe, expect, test } from 'vitest';
import { version as packageVersion } from '../../../package.json';
import UI, * as components from '../index';

describe('公开入口', () => {
  test('全量安装和单独安装使用相同组件', () => {
    const app = createApp({});
    app.use(UI);
    expect(components.Button).toBeDefined();
    expect(app.component('i-button')).toBe(components.Button);
    expect(app.component('i-row')).toBe(components.Row);
    expect(app.component('i-col')).toBe(components.Col);
    expect(UI.version).toBe(packageVersion);
  });
});
