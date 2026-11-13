import { expect, test } from 'vitest';
import { useEmptyValues } from '../use-empty-values';
test('识别默认和自定义空值', () => {
  const defaults = useEmptyValues();
  expect(defaults.isEmptyValue(null)).toBe(true);
  const custom = useEmptyValues({ emptyValues: ['none'] });
  expect(custom.isEmptyValue('none')).toBe(true);
  expect(custom.isEmptyValue('')).toBe(false);
});
