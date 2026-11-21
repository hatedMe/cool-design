import { DOMWrapper, mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Dropdown from '../index';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('Dropdown 浮层定位', () => {
  test('默认保留节点并消费真实定位选项与箭头配置', async () => {
    const host = document.createElement('section');
    document.body.append(host);
    const effect = vi.fn(() => cleanup);
    const cleanup = vi.fn();
    const wrapper = mount(Dropdown, {
      props: {
        trigger: 'click', appendTo: host, items: [{ command: 'a', label: 'A' }],
        popperStyle: { color: 'red' },
        popperOptions: { modifiers: [{ name: 'test', enabled: true, phase: 'write', effect }] }
      },
      attachTo: document.body
    });
    const panel = host.querySelector<HTMLElement>('.i-dropdown__popper');
    expect(panel?.style.display).toBe('none');
    wrapper.vm.handleOpen();
    await wrapper.vm.$nextTick();
    expect(panel?.style.display).toBe('');
    expect(panel?.style.color).toBe('red');
    expect(panel?.querySelector('.i-tooltip__arrow')).not.toBeNull();
    expect(effect).toHaveBeenCalled();
    await wrapper.setProps({ showArrow: false });
    expect(panel?.querySelector('.i-tooltip__arrow')).toBeNull();
    wrapper.vm.handleClose();
    await wrapper.vm.$nextTick();
    expect(host.querySelector('.i-dropdown__popper')).toBe(panel);
    expect(panel?.style.display).toBe('none');
    wrapper.unmount();
    expect(host.children).toHaveLength(0);
    expect(cleanup.mock.calls).toHaveLength(effect.mock.calls.length);
  });

  test('虚拟参考替换后旧锚点事件失效，新锚点可用 code 即时打开', async () => {
    const first = document.createElement('button');
    const second = document.createElement('button');
    document.body.append(first, second);
    const wrapper = mount(Dropdown, {
      props: {
        trigger: 'click', virtualTriggering: true, virtualRef: first,
        triggerKeys: ['KeyK'], showTimeout: 1000, persistent: false, teleported: false
      },
      global: { stubs: { transition: false } },
      attachTo: document.body
    });
    await new DOMWrapper(first).trigger('keydown', { code: 'KeyK', key: 'x' });
    expect(wrapper.find('.i-dropdown__popper').exists()).toBe(true);
    wrapper.vm.handleClose();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.find('.i-dropdown__popper').exists()).toBe(false));
    await wrapper.setProps({ virtualRef: second });
    await new DOMWrapper(first).trigger('click');
    expect(wrapper.find('.i-dropdown__popper').exists()).toBe(false);
    await new DOMWrapper(second).trigger('click');
    expect(wrapper.find('.i-dropdown__popper').exists()).toBe(true);
    wrapper.unmount();
  });
  test('teleported 模式菜单挂载到 body 并应用 popperClass 与 maxHeight', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        trigger: 'click',
        items: [{ command: 'a', label: 'A' }],
        popperClass: 'my-popper',
        maxHeight: 200,
        placement: 'bottom-start'
      },
      slots: { default: () => '触发器' },
      attachTo: document.body
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    const popper = document.querySelector<HTMLElement>('.i-dropdown__popper');
    expect(popper).not.toBeNull();
    expect(popper!.classList.contains('my-popper')).toBe(true);
    expect(popper!.getAttribute('data-placement')).toBe('bottom-start');
    expect(popper!.querySelector<HTMLElement>('.i-dropdown__scroll')?.style.maxHeight).toBe('200px');
    // 菜单不在触发器容器内（已传送）
    expect(wrapper.find('.i-dropdown__popper').exists()).toBe(false);
    wrapper.unmount();
  });

  test('hover 触发支持 showTimeout / hideTimeout 延时', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Dropdown, {
      props: {
        items: [{ command: 'a', label: 'A' }],
        teleported: false,
        showTimeout: 100,
        hideTimeout: 100
      },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-tooltip__trigger').trigger('mouseenter');
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBeUndefined();
    await wrapper.find('.i-tooltip__trigger').trigger('mouseleave');
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBeUndefined();
    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
    vi.useRealTimers();
    wrapper.unmount();
  });
});
