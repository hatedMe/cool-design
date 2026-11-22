import { flushPromises, mount } from '@vue/test-utils';
import { h, ref, Teleport, withDirectives } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../../config-provider';
import { VPopover } from '..';

test('插槽中的指令继承最近的配置，触发元素传送到 body 后仍保持逻辑宿主', async () => {
  const namespace = ref('acme');
  const wrapper = mount({
    render: () => h(ConfigProvider, { namespace: 'outer' }, () =>
      h(ConfigProvider, { namespace: namespace.value, theme: 'dark', zIndex: 7100 }, () =>
        h(Teleport, { to: 'body' }, [
          withDirectives(h('button', { id: 'directive-anchor' }), [[VPopover, '浮层']])
        ])))
  }, { attachTo: document.body, global: { stubs: { transition: false } } });
  try {
    await flushPromises();
    document.querySelector('#directive-anchor')!.dispatchEvent(new MouseEvent('mouseenter'));
    await flushPromises();
    const panel = document.querySelector<HTMLElement>('[role=tooltip]')!;
    expect(panel.parentElement).toBe(wrapper.get('.acme-overlay-host').element);
    expect(panel.classList.contains('acme-popover')).toBe(true);
    expect(Number(panel.style.zIndex)).toBeGreaterThanOrEqual(7100);
    namespace.value = 'next';
    await flushPromises();
    expect(panel.parentElement).toBe(wrapper.get('.next-overlay-host').element);
    expect(panel.querySelector('.next-popover__arrow')).toBeTruthy();
  } finally {
    wrapper.unmount();
  }
  expect(document.querySelector('[role=tooltip]')).toBeNull();
});

test.each(['初始值', ''])('函数式组件的绑定从“%s”更新时继承局部配置', async (initial) => {
  const value = ref(initial);
  const namespace = ref('inner');
  const Child = () => withDirectives(h('button'), [[VPopover, value.value]]);
  const wrapper = mount({
    render: () => h(ConfigProvider, { namespace: 'outer' }, () =>
      h(ConfigProvider, { namespace: namespace.value }, () => h(Child)))
  }, { attachTo: document.body, global: { stubs: { transition: false } } });
  try {
    if (!initial) value.value = '初始值';
    await flushPromises();
    const panel = wrapper.get('.inner-overlay-host .inner-popover');
    await wrapper.get('button').trigger('mouseenter');
    await flushPromises();
    expect(panel.isVisible()).toBe(true);
    namespace.value = 'updated';
    await flushPromises();
    expect(wrapper.get('.updated-overlay-host .updated-popover').element).toBe(panel.element);
    value.value = '替换值';
    await flushPromises();
    expect(wrapper.get('.updated-overlay-host .updated-popover').text()).toBe('替换值');
    value.value = '';
    await flushPromises();
    expect(document.querySelector('[role=tooltip]')).toBeNull();
  } finally {
    wrapper.unmount();
  }
});
