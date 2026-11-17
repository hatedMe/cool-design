import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, test } from 'vitest';
import TreeV2 from '..';

describe('TreeV2 虚拟化规模回归', () => {
  test('万级节点仅渲染窗口行', async () => {
    const groups = 100;
    const perGroup = 100;
    const data = Array.from({ length: groups }, (_, group) => ({
      id: `g${group}`,
      label: `组 ${group}`,
      children: Array.from({ length: perGroup }, (_, index) => ({
        id: `g${group}-${index}`,
        label: `节点 ${group}-${index}`
      }))
    }));
    const wrapper = mount(TreeV2, {
      props: {
        data,
        height: 400,
        itemSize: 26,
        defaultExpandedKeys: Array.from({ length: groups }, (_, index) => `g${index}`)
      }
    });
    await nextTick();
    // 100 组 + 10000 叶子全部展开，但 DOM 中只应有窗口内的行
    const rendered = wrapper.findAll('.i-tree-v2__row');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(50);
    wrapper.unmount();
  });

  test('滚动后窗口随偏移移动', async () => {
    const data = Array.from({ length: 1000 }, (_, index) => ({ id: index, label: `N${index}` }));
    const wrapper = mount(TreeV2, {
      props: { data, height: 200, itemSize: 26 }
    });
    const list = wrapper.find('.i-tree-v2__list').element as HTMLElement;
    Object.defineProperty(list, 'scrollTop', { value: 2600, writable: true, configurable: true });
    list.dispatchEvent(new Event('scroll'));
    await nextTick();
    const first = wrapper.find('.i-tree-v2__label').text();
    // 窗口含 2 行前置缓冲，首个渲染行为 N98
    expect(first).toBe('N98');
    wrapper.unmount();
  });
});
