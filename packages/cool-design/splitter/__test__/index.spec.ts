import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, describe, expect, test } from 'vitest';
import Splitter from '..';
import SplitterPanel from '../splitter-panel';

const panels = (propsList: Array<Record<string, unknown>> = [{ size: 100 }, { size: 200 }]) =>
  propsList.map((props) => h(SplitterPanel, props, { default: () => '内容' }));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('test `Splitter` component', () => {
  test('渲染面板与分隔条，layout 控制分隔条方向', () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels() }
    });
    expect(wrapper.findAll('.i-splitter__panel')).toHaveLength(2);
    expect(wrapper.find('.i-splitter__divider').attributes('aria-orientation')).toBe('vertical');

    const vertical = mount(Splitter, {
      props: { layout: 'vertical' },
      slots: { default: () => panels() }
    });
    expect(vertical.find('.i-splitter__divider').attributes('aria-orientation')).toBe('horizontal');
  });

  test('拖拽调整面板大小并触发 resize 事件与 update:size', async () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels() },
      attachTo: document.body
    });
    const divider = wrapper.find('.i-splitter__divider');
    await divider.trigger('mousedown', { clientX: 0 });
    expect(wrapper.emitted('resize-start')).toEqual([[0, [100, 200]]]);

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    await nextTick();
    expect(wrapper.emitted('resize')).toEqual([[0, [150, 150]]]);
    expect(wrapper.findAll('.i-splitter__panel')[0].attributes('style')).toContain('0 0 150px');

    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(wrapper.emitted('resize-end')).toEqual([[0, [150, 150]]]);
    const first = wrapper.findAllComponents(SplitterPanel)[0];
    expect(first.emitted('update:size')).toEqual([[150]]);
    wrapper.unmount();
  });

  test('min/max 钳制拖拽结果，resizable=false 禁止拖拽', async () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels([{ size: 100, max: 120 }, { size: 200, min: 190 }]) },
      attachTo: document.body
    });
    await wrapper.find('.i-splitter__divider').trigger('mousedown', { clientX: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    // 右面板 min=190 会把结果回拉：[110, 190]
    expect(wrapper.emitted('resize')!.at(-1)).toEqual([0, [110, 190]]);

    const fixed = mount(Splitter, {
      slots: { default: () => panels([{ size: 100 }, { size: 200, resizable: false }]) },
      attachTo: document.body
    });
    await fixed.find('.i-splitter__divider').trigger('mousedown', { clientX: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(fixed.emitted('resize-start')).toBeUndefined();
    fixed.unmount();
    wrapper.unmount();
  });

  test('collapsible 折叠与恢复并触发 collapse', async () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels([{ size: 100, collapsible: true }, { size: 200, collapsible: true, min: 40 }]) },
      attachTo: document.body
    });
    await nextTick();
    expect(wrapper.findAll('.i-splitter__collapse')).toHaveLength(2);

    await wrapper.find('.i-splitter__collapse.is-end').trigger('click');
    await nextTick();
    expect(wrapper.emitted('collapse')).toEqual([[0]]);
    expect(wrapper.findAllComponents(SplitterPanel)[1].emitted('update:size')).toEqual([[40]]);

    await wrapper.find('.i-splitter__collapse.is-end').trigger('click');
    await nextTick();
    expect(wrapper.findAllComponents(SplitterPanel)[1].emitted('update:size')).toEqual([[40], [200]]);
    wrapper.unmount();
  });
});
