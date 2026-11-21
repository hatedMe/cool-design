import { describe, expect, test } from 'vitest';
import { useNamespace } from '../use-namespace';

describe('useNamespace', () => {
  test('生成 BEM 和状态类名', () => {
    const ns = useNamespace('button');
    expect(ns.b()).toBe('i-button');
    expect(ns.e('icon')).toBe('i-button__icon');
    expect(ns.m('primary')).toBe('i-button--primary');
    expect(ns.is('disabled')).toBe('is-disabled');
    expect(ns.is('disabled', false)).toBe('');
  });
});
