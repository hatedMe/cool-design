import { mount } from '@vue/test-utils';
import { Fragment, h } from 'vue';
import { expect, test } from 'vitest';
import Space from '..';
import ConfigProvider from '../../config-provider';

test('prefixCls 更新实际子项类名，保留 Fragment、嵌套 Space 和分隔符', async () => {
  const wrapper = mount(Space, {
    props: { prefixCls: 'toolbar', spacer: '|' },
    attrs: { class: 'custom-root' },
    slots: {
      default: () => [
        h(Fragment, [h('button', '一'), h('button', '二')]),
        h(Space, {}, () => h('span', '三'))
      ]
    }
  });
  const root = wrapper.element;
  const firstButton = wrapper.get('button').element;
  expect(wrapper.classes()).toEqual(['i-space', 'i-space--horizontal', 'custom-root']);
  expect(Array.from(root.children, (child) => child.className)).toEqual([
    'toolbar__item',
    'i-space__spacer',
    'toolbar__item'
  ]);
  expect(wrapper.attributes('prefixcls')).toBeUndefined();
  expect(wrapper.findAll('.toolbar__item')[0].findAll('button')).toHaveLength(2);
  expect(wrapper.get('.toolbar__item .i-space__item').text()).toBe('三');

  await wrapper.setProps({ prefixCls: 'actions' });
  expect(wrapper.findAll('.actions__item')).toHaveLength(2);
  expect(wrapper.find('.toolbar__item').exists()).toBe(false);
  expect(wrapper.get('button').element).toBe(firstButton);

  await wrapper.setProps({ prefixCls: '' });
  expect(wrapper.findAll('.i-space__item')).toHaveLength(3);
  expect(wrapper.get('button').element).toBe(firstButton);
});

test('内置尺寸（8/12/16px），继承配置尺寸', () => {
  const w = mount(ConfigProvider, {
    props: { size: 'large' },
    slots: { default: () => h(Space, {}, () => [h('button', '一'), h('button', '二')]) }
  });
  expect(w.get('.i-space').attributes('style')).toContain('column-gap: 16px');
  w.unmount();

  const small = mount(Space, { props: { size: 'small' } });
  expect(small.attributes('style')).toContain('column-gap: 8px');
  const fallback = mount(Space);
  expect(fallback.attributes('style')).toContain('column-gap: 12px');
  const large = mount(Space, { props: { size: 'large' } });
  expect(large.attributes('style')).toContain('column-gap: 16px');
});

test('wrap 默认关闭，fill 时自动换行并按 fillRatio 撑开子项', async () => {
  const wrapper = mount(Space, {
    props: { fill: true, fillRatio: 30 },
    slots: { default: () => [h('button', '一'), h('button', '二')] }
  });
  expect(wrapper.attributes('style')).toContain('flex-wrap: wrap');
  const items = wrapper.findAll('.i-space__item');
  expect(items).toHaveLength(2);
  expect(items[0].attributes('style')).toContain('flex-grow: 1');
  expect(items[0].attributes('style')).toContain('min-width: 30%');

  await wrapper.setProps({ fill: false, wrap: false });
  expect(wrapper.attributes('style')).toContain('flex-wrap: nowrap');
  await wrapper.setProps({ wrap: true });
  expect(wrapper.attributes('style')).toContain('flex-wrap: wrap');
});

test('alignment 优先于兼容别名 align，方向控制行列间距', () => {
  const wrapper = mount(Space, {
    props: { size: [4, 16], direction: 'vertical', alignment: 'start', align: 'end' },
    slots: { default: () => [h('button', '一'), h('button', '二')] }
  });
  expect(wrapper.attributes('style')).toContain('column-gap: 4px');
  expect(wrapper.attributes('style')).toContain('row-gap: 16px');
  expect(wrapper.attributes('style')).toContain('flex-direction: column');
  expect(wrapper.attributes('style')).toContain('align-items: start');

  const legacy = mount(Space, { props: { align: 'end' } });
  expect(legacy.attributes('style')).toContain('align-items: end');
  const fallback = mount(Space);
  expect(fallback.attributes('style')).toContain('align-items: center');
});

test('spacer 在子项之间穿插，支持文本与 VNode', () => {
  const text = mount(Space, {
    props: { spacer: '|' },
    slots: { default: () => [h('button', '一'), h('button', '二')] }
  });
  expect(text.findAll('.i-space__item')).toHaveLength(2);
  expect(text.findAll('.i-space__spacer')).toHaveLength(1);
  expect(text.find('.i-space__spacer').text()).toBe('|');

  const vnode = mount(Space, {
    props: { spacer: h('hr', { class: 'my-divider' }) },
    slots: { default: () => [h('button', '一'), h('button', '二')] }
  });
  expect(vnode.find('hr.my-divider').exists()).toBe(true);
});
