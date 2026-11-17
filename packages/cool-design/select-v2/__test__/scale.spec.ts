import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, test } from 'vitest';
import SelectV2 from '..';

describe('SelectV2 虚拟化规模回归', () => {
  test('万级选项仅渲染窗口行', async () => {
    const options = Array.from({ length: 10000 }, (_, index) => ({ value: index, label: `选项${index}` }));
    const wrapper = mount(SelectV2, {
      props: { options, filterable: true, height: 340, itemHeight: 34 }
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await nextTick();
    const rendered = wrapper.findAll('[role="option"]');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(30);
    expect(wrapper.find('.i-select-v2__list').attributes('style')).toContain('340000px');
    wrapper.unmount();
  });

  test('滚动后窗口随偏移移动', async () => {
    const options = Array.from({ length: 1000 }, (_, index) => ({ value: index, label: `选项${index}` }));
    const wrapper = mount(SelectV2, {
      props: { options, filterable: true, height: 340, itemHeight: 34 }
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    const list = wrapper.find('.i-select-v2__dropdown').element as HTMLElement;
    Object.defineProperty(list, 'scrollTop', { value: 3400, writable: true, configurable: true });
    list.dispatchEvent(new Event('scroll'));
    await nextTick();
    // 窗口含 2 行前置缓冲，首个渲染行为 选项98
    expect(wrapper.find('.i-select-v2__option').text()).toBe('选项98');
    wrapper.unmount();
  });
});
