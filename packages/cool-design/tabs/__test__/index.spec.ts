import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import Tabs from '../index';
import TabPane from '../tab-pane';

describe('Tabs', () => {
  test('受控切换触发事件', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'first', panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二' }] }
    });
    const items = wrapper.findAll('[role="tab"]');
    expect(items[0].attributes('aria-selected')).toBe('true');
    await items[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['second']);
    expect(wrapper.emitted('tab-click')?.[0]?.[0]).toMatchObject({ name: 'second' });
    expect(wrapper.emitted('tab-change')?.[0]).toEqual(['second']);
  });

  test('禁用页签不可切换', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'first', panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二', disabled: true }] }
    });
    await wrapper.findAll('[role="tab"]')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  test('beforeLeave 异步拦截', async () => {
    const beforeLeave = vi.fn(async () => false);
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'first',
        panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二' }],
        beforeLeave
      }
    });
    await wrapper.findAll('[role="tab"]')[1].trigger('click');
    // 等待异步 beforeLeave
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(beforeLeave).toHaveBeenCalledWith('second', 'first');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  test('插槽 TabPane 支持懒渲染与关闭', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', closable: true },
      slots: {
        default: () => [
          h(TabPane, { name: 'a', label: 'A' }, () => '内容A'),
          h(TabPane, { name: 'b', label: 'B', lazy: true }, () => '内容B')
        ]
      }
    });
    // 懒加载未访问时不渲染
    expect(wrapper.text()).toContain('内容A');
    expect(wrapper.text()).not.toContain('内容B');
    await wrapper.findAll('.i-tabs__close')[0].trigger('click');
    expect(wrapper.emitted('tab-remove')?.[0]).toEqual(['a']);
    expect(wrapper.emitted('edit')?.[0]).toEqual(['a', 'remove']);
  });

  test('addable 触发新增', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', panes: [{ name: 'a', label: 'A' }], addable: true }
    });
    await wrapper.find('.i-tabs__add').trigger('click');
    expect(wrapper.emitted('tab-add')).toHaveLength(1);
    expect(wrapper.emitted('edit')?.[0]).toEqual([null, 'add']);
  });

  test('未提供 modelValue 时默认首个可用', () => {
    const wrapper = mount(Tabs, {
      props: { panes: [{ name: 'x', label: 'X', disabled: true }, { name: 'y', label: 'Y' }] }
    });
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true');
  });
});
