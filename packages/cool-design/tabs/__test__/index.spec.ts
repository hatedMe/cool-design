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

  test('tabPosition 为 bottom/right 时内容在 DOM 前面（与 Element Plus 一致）', () => {
    const order = (position: 'top' | 'right' | 'bottom' | 'left') => {
      const wrapper = mount(Tabs, {
        props: {
          panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二' }],
          tabPosition: position
        }
      });
      const children = wrapper.element.children;
      const firstClass = children[0]?.className ?? '';
      return firstClass.includes('i-tabs__header') ? 'header' : 'content';
    };
    expect(order('top')).toBe('header');
    expect(order('left')).toBe('header');
    expect(order('bottom')).toBe('content');
    expect(order('right')).toBe('content');
  });

  test('键盘导航只在当前 Tabs 实例内聚焦页签', async () => {
    const makePanes = () => [{ name: 'first', label: '一' }, { name: 'second', label: '二' }];
    const wrapper = mount(
      {
        components: { Tabs },
        template: `<div>
          <Tabs id="tabs-a" ref="a" :panes="panes" modelValue="first" />
          <Tabs id="tabs-b" ref="b" :panes="panes" modelValue="first" />
        </div>`,
        setup: () => ({ panes: makePanes() })
      },
      { attachTo: document.body }
    );
    const tab = wrapper.findAll('#tabs-b [role="tab"]')[0];
    await tab.trigger('keydown', { key: 'ArrowRight' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(wrapper.findAll('#tabs-b [role="tab"]')[1].element);
    // tabs-a 的页签没有被聚焦或切换
    expect(wrapper.findAll('#tabs-a [role="tab"]')[1].attributes('aria-selected')).not.toBe('true');
    wrapper.unmount();
  });
});
