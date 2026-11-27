import { expect, test } from 'vitest';
import { useAria } from '../use-aria';
test('生成 ARIA 属性并过滤 undefined', () => {
  expect(useAria({ 'aria-label': '搜索', 'aria-invalid': undefined }).value).toEqual({ 'aria-label': '搜索' });
});
