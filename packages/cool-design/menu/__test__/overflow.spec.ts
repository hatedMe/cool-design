import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import Menu from '../menu';

test('水平空间不足时可经更多选择原菜单项并恢复宽布局', async () => {
  let width = 150;
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { width: this.matches('[role="menubar"]') ? width : 60 } as DOMRect;
  });
  const wrapper = mount(Menu, {
    attachTo: document.body,
    props: { mode: 'horizontal', items: ['a', 'b', 'c'].map(index => ({ index, label: index })) }
  });
  try {
    wrapper.vm.handleResize();
    await nextTick();
    await nextTick();
    width = 300;
    wrapper.vm.handleResize();
    await nextTick();
    expect(wrapper.find('button[aria-label="更多"]').exists()).toBe(false);
    width = 150;
    wrapper.vm.handleResize();
    await nextTick();
    const more = wrapper.get('button[aria-label="更多"]');
    await more.trigger('click');
    await nextTick();
    const item = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menu"] button')).find(el => el.textContent === 'c');
    expect(item).toBeDefined();
    item!.click();
    expect(wrapper.emitted('select')?.[0]?.slice(0, 2)).toEqual(['c', ['c']]);
    width = 300;
    wrapper.vm.handleResize();
    await nextTick();
    expect(wrapper.get('[role="menubar"]').findAll('.i-menu-item')).toHaveLength(3);
  } finally {
    wrapper.unmount();
    rect.mockRestore();
  }
});
