import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Alert from '..';

test('支持 primary 类型与 dark 效果及居中', () => {
  const w = mount(Alert, { props: { title: '提示', type: 'primary', effect: 'dark', center: true } });
  expect(w.classes()).toContain('i-alert--primary');
  expect(w.classes()).toContain('is-dark');
  expect(w.classes()).toContain('is-center');
  expect(w.attributes('role')).toBe('alert');
  w.unmount();
});

test('关闭按钮触发 close 并隐藏，支持 closeText', async () => {
  const w = mount(Alert, { props: { title: '提示', closable: true, closeText: '关闭' } });
  expect(w.text()).toContain('关闭');
  await w.get('.i-alert__close').trigger('click');
  expect(w.emitted('close')).toHaveLength(1);
  expect(w.find('.i-alert').exists()).toBe(false);
  w.unmount();
});

test('支持标题描述插槽与图标插槽', () => {
  const w = mount(Alert, {
    props: { title: '标题属性', description: '描述属性', showIcon: true },
    slots: { title: () => '插槽标题', default: () => '插槽描述', icon: () => '图标' }
  });
  expect(w.text()).toContain('插槽标题');
  expect(w.text()).toContain('插槽描述');
  expect(w.text()).toContain('图标');
  expect(w.find('.i-alert__icon').exists()).toBe(true);
  w.unmount();
});

test('不可关闭时不渲染关闭按钮', () => {
  const w = mount(Alert, { props: { title: '提示', closable: false } });
  expect(w.find('.i-alert__close').exists()).toBe(false);
  w.unmount();
});
