import { expect, test } from 'vitest';
import { useId } from '../use-id';

test('生成确定性 ID，并递增默认 ID', () => {
  expect(useId('field-email').value).toBe('field-email');
  const first = useId().value;
  const second = useId().value;
  expect(first).toMatch(/^i-id-\d+-\d+$/);
  expect(second).not.toBe(first);
});
