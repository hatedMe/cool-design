import { expect, test } from 'vitest';
import { useEmptyValues } from '../use-empty-values';
test('识别默认和自定义空值', () => {
  const defaults = useEmptyValues();
  expect(defaults.isEmptyValue(null)).toBe(true);
  const custom = useEmptyValues({ emptyValues: ['none'] });
  expect(custom.isEmptyValue('none')).toBe(true);
  expect(custom.isEmptyValue('')).toBe(false);
});

test('读取配置和判断空值时不执行工厂，每次清空重新执行一次', () => {
  let calls = 0;
  const factory = () => {
    calls++;
    return calls === 1 ? undefined : false;
  };
  const empty = useEmptyValues({ valueOnClear: factory });
  expect(empty.valueOnClear.value).toBe(factory);
  expect(empty.isEmptyValue('')).toBe(true);
  expect(empty.isEmptyValue(0)).toBe(false);
  expect(empty.isEmptyValue(false)).toBe(false);
  expect(calls).toBe(0);
  expect(empty.getValueOnClear('fallback')).toBeUndefined();
  expect(empty.getValueOnClear('fallback')).toBe(false);
  expect(calls).toBe(2);
});

test('组件默认清空值只在局部和全局均未配置时生效', () => {
  expect(useEmptyValues().getValueOnClear(null)).toBeNull();
  expect(useEmptyValues({ valueOnClear: null }).getValueOnClear('fallback')).toBeNull();
  expect(useEmptyValues({ valueOnClear: 0 }).getValueOnClear('fallback')).toBe(0);
  expect(useEmptyValues({ valueOnClear: false }).getValueOnClear('fallback')).toBe(false);
  expect(useEmptyValues({ valueOnClear: '' }).getValueOnClear('fallback')).toBe('');
});

test('空值数组按内容匹配并区分不同的标量', () => {
  const { isEmptyValue } = useEmptyValues({ emptyValues: [[0, [false, '', undefined]]] });
  expect(isEmptyValue([0, [false, '', undefined]])).toBe(true);
  expect(isEmptyValue([0, [false, '', null]])).toBe(false);
  expect(isEmptyValue([false, [false, '', undefined]])).toBe(false);
});
