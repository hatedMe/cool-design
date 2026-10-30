import { expect, test } from 'vitest';
import { useSize } from '../use-size';

test('默认返回 default 尺寸', () => {
  expect(useSize().value).toBe('default');
});
