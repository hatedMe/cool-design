import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import Row from '..';

describe('test `Row` component', () => {
  test('renders a component', async () => {
    const wrapper = mount(Row);
    expect(wrapper.exists()).toBeTruthy();
  });

  test('supports Element Plus middle alignment and preserves stretch by default', () => {
    const middle = mount(Row, { props: { align: 'middle' } });
    expect(middle.attributes('style')).toContain('align-items: center');

    const defaultRow = mount(Row);
    expect(defaultRow.attributes('style')).not.toContain('align-items');
  });

  test('maps logical justify values to flex-compatible values', () => {
    expect(mount(Row, { props: { justify: 'start' } }).attributes('style')).toContain('justify-content: flex-start');
    expect(mount(Row, { props: { justify: 'end' } }).attributes('style')).toContain('justify-content: flex-end');
  });

  test('keeps center as a compatibility alias', () => {
    expect(mount(Row, { props: { align: 'center' } }).attributes('style')).toContain('align-items: center');
  });

  test('normalizes invalid gutter values', () => {
    for (const gutter of [Number.NaN, Number.POSITIVE_INFINITY, -16]) {
      const wrapper = mount(Row, { props: { gutter } });
      expect(wrapper.attributes('style')).not.toMatch(/NaN|Infinity|-8px/);
    }
  });
});
