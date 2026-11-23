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

test.each([
  ['dialog', Dialog],
  ['drawer', Drawer]
] as const)('%s 外置浮层跟随最近配置切换前缀和主题', async (block, Component) => {
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    props: { namespace: 'acme', theme: 'dark', size: 'small' },
    slots: { default: () => h(Component, { modelValue: true, appendToBody: true }) }
  });
  try {
    await flushPromises();
    const mask = document.querySelector<HTMLElement>(`.acme-${block}__mask`)!;
    expect(mask).toBeTruthy();
    expect(mask.classList.contains('acme-theme-scope')).toBe(true);
    expect(mask.dataset.theme).toBe('dark');
    expect(mask.style.getPropertyValue('--acme-control-height')).toBe('28px');
    await wrapper.setProps({ namespace: 'next', theme: 'light' });
    expect(document.querySelector(`.next-${block}__mask`)).toBe(mask);
    expect(mask.querySelector(`.next-${block}`)).toBeTruthy();
    expect(mask.dataset.theme).toBe('light');
  } finally {
    wrapper.unmount();
  }
});
