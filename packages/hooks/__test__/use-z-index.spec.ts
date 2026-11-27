import { expect, test } from 'vitest';
import { useZIndex } from '../use-z-index';

test('z-index 递增且可读取当前值', () => {
  const z = useZIndex();
  const first = z.nextZIndex();
  const second = z.nextZIndex();
  expect(second).toBe(first + 1);
  expect(z.currentZIndex()).toBe(second);
});
