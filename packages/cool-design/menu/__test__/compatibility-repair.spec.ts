import Menu from '..';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Menu 只在开启外部点击配置时收起，内部子菜单点击不误判', async () => {
  const wrapper = mount(Menu, { attachTo: document.body, props: {
    defaultOpeneds: ['parent'], items: [{ index: 'parent', label: 'parent', children: [{ index: 'child', label: 'child' }] }]
  } });
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  await nextTick();
  expect(wrapper.get('[aria-expanded]').attributes('aria-expanded')).toBe('true');
  await wrapper.setProps({ closeOnClickOutside: true });
  wrapper.get('[aria-expanded]').element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  await nextTick();
  expect(wrapper.get('[aria-expanded]').attributes('aria-expanded')).toBe('true');
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  await nextTick();
  expect(wrapper.get('[aria-expanded]').attributes('aria-expanded')).toBe('false');
  expect(wrapper.emitted('close')?.[0]?.[0]).toBe('parent');
  wrapper.unmount();
});
