import { flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../index';
import Dialog from '../../dialog';
import Drawer from '../../drawer';

test.each([
  ['Dialog', Dialog, '.i-dialog__mask'],
  ['Drawer', Drawer, '.i-drawer__mask']
] as const)('%s 继承全局基础层级且允许局部覆盖', async (_, Component, selector) => {
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    props: { zIndex: 8000 },
    slots: { default: () => h(Component, { modelValue: true }) }
  });
  try {
    await flushPromises();
    expect(Number((document.querySelector(selector) as HTMLElement).style.zIndex)).toBeGreaterThan(8000);
  } finally {
    wrapper.unmount();
  }
  const local = mount(ConfigProvider, {
    attachTo: document.body,
    props: { zIndex: 8000 },
    slots: { default: () => h(Component, { modelValue: true, zIndex: 10000 }) }
  });
  try {
    await flushPromises();
    expect((document.querySelector(selector) as HTMLElement).style.zIndex).toBe('10000');
  } finally {
    local.unmount();
  }
});
