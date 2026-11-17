import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Dropdown from '../index';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Dropdown 浮层定位', () => {
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
    expect(popper!.style.maxHeight).toBe('200px');
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
    await wrapper.find('.i-dropdown').trigger('mouseenter');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
    await wrapper.find('.i-dropdown').trigger('mouseleave');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
    vi.useRealTimers();
    wrapper.unmount();
  });
});
