import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Divider from '..';

test('支持方向、虚线样式和横向内容位置', () => {
  const w = mount(Divider, {
    props: { direction: 'horizontal', borderStyle: 'dashed', contentPosition: 'left' },
    slots: { default: () => '分组' }
  });
  expect(w.attributes('aria-orientation')).toBe('horizontal');
  expect(w.classes()).toContain('i-divider--left');
  expect(w.attributes('style')).toContain('--i-divider-border-style: dashed');
  expect(w.text()).toBe('分组');
});

test('兼容 vertical 属性并隐藏竖线文字', () => {
  const w = mount(Divider, { props: { vertical: true }, slots: { default: () => '忽略' } });
  expect(w.attributes('aria-orientation')).toBe('vertical');
  expect(w.classes()).toContain('i-divider--vertical');
  expect(w.text()).toBe('');
});
