import { mount, flushPromises } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../../config-provider';
import Tooltip from '..';

test('显式 body 面板跟随最近 Provider 及动态命名空间', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'acme', size: 'large', themeVars: { '--brand': 'root' } },
    slots: { default: () => h(ConfigProvider, { theme: 'dark', themeVars: { '--brand': 'local' } }, () =>
      h(Tooltip, { visible: true, content: '帮助', appendTo: 'body', popperStyle: { '--override': 'user' } }, () => h('button', '帮助'))) },
    global: { stubs: { transition: false } },
    attachTo: document.body
  });
  try {
    await flushPromises();
    const panel = document.body.querySelector<HTMLElement>('[role=tooltip]')!;
    expect(panel.style.getPropertyValue('--brand')).toBe('local');
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.getPropertyValue('--override')).toBe('user');
    expect(panel.dataset.theme).toBe('dark');
    expect(panel.style.getPropertyValue('--acme-control-height')).toBe('40px');
    expect(panel.classList.contains('acme-tooltip')).toBe(true);
    await wrapper.setProps({ namespace: 'other', size: 'small' });
    expect(panel.querySelector('.other-tooltip__arrow')).toBeTruthy();
    expect(panel.style.getPropertyValue('--other-control-height')).toBe('28px');
    expect(panel.style.getPropertyValue('--acme-control-height')).toBe('');
    expect(document.body.style.getPropertyValue('--brand')).toBe('');
  } finally {
    wrapper.unmount();
  }
});

test('初始就地渲染与禁用期间切换目标后，复用面板并传送到最新宿主', async () => {
  const teleported = ref(false);
  const target = ref<string | HTMLElement>('body');
  const external = document.createElement('div');
  external.id = 'tooltip-host';
  document.body.appendChild(external);
  const wrapper = mount(ConfigProvider, {
    slots: {
      default: () => h(Tooltip, {
        visible: true, persistent: true, content: '帮助', teleported: teleported.value, appendTo: target.value
      }, () => h('button', '触发'))
    },
    global: { stubs: { transition: false } },
    attachTo: document.body
  });
  try {
    await flushPromises();
    const panel = wrapper.get('[role=tooltip]').element;
    expect(panel.parentElement).toBe(wrapper.element);
    teleported.value = true;
    await nextTick();
    expect(panel.parentElement).toBe(document.body);
    teleported.value = false;
    target.value = '#tooltip-host';
    await nextTick();
    expect(panel.parentElement).toBe(wrapper.element);
    target.value = external;
    await nextTick();
    teleported.value = true;
    await nextTick();
    expect(panel.parentElement).toBe(external);
    expect(wrapper.get('button').attributes('aria-describedby')).toBe(panel.id);
  } finally {
    wrapper.unmount();
    external.remove();
  }
});
