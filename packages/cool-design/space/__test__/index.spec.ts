import { mount } from '@vue/test-utils';
import { Fragment, createCommentVNode, createTextVNode, defineComponent, h, nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import Space from '..';
import ConfigProvider from '../../config-provider';
import ForwardedSpace from './fixtures/ForwardedSpace.vue';
import ForwardingSpace from './fixtures/ForwardingSpace.vue';

test('prefixCls 更新展开的 Fragment 子项，保留嵌套 Space 和分隔符', async () => {
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
    'toolbar__item',
    'i-space__spacer',
    'toolbar__item'
  ]);
  expect(wrapper.attributes('prefixcls')).toBeUndefined();
  expect(wrapper.findAll('.toolbar__item').map((item) => item.text())).toEqual(['一', '二', '三']);
  expect(wrapper.get('.toolbar__item .i-space__item').text()).toBe('三');

  await wrapper.setProps({ prefixCls: 'actions' });
  expect(wrapper.findAll('.actions__item')).toHaveLength(3);
  expect(wrapper.find('.toolbar__item').exists()).toBe(false);
  expect(wrapper.get('button').element).toBe(firstButton);

  await wrapper.setProps({ prefixCls: '' });
  expect(wrapper.findAll('.i-space__item')).toHaveLength(4);
  expect(wrapper.get('button').element).toBe(firstButton);
});

test('递归排列原生文本和数字零，空内容不占间距或分隔符', () => {
  const wrapper = mount(Space, {
    props: { spacer: 0 },
    slots: {
      default: () => [
        '开头',
        h(Fragment, [
          ['中间', 0, h(Fragment, [createTextVNode('结尾'), createCommentVNode('注释')])],
          h(Fragment, [h(Fragment, []), createCommentVNode('空组')]),
          createTextVNode(''),
          false
        ])
      ]
    }
  });
  expect(Array.from(wrapper.element.children, (child) => [child.className, child.textContent])).toEqual([
    ['i-space__item', '开头'],
    ['i-space__spacer', '0'],
    ['i-space__item', '中间'],
    ['i-space__spacer', '0'],
    ['i-space__item', '0'],
    ['i-space__spacer', '0'],
    ['i-space__item', '结尾']
  ]);
});

test('重排与增删混合子项时按 Fragment 作用域保留包装和内容的 DOM 身份', async () => {
  const changed = ref(false);
  const replace = ref(false);
  const numericSymbol = Symbol('1');
  const otherSymbol = Symbol('1');
  const button = (id: string, key?: PropertyKey) => h('button', { id, key }, id);
  const wrapper = mount(Space, {
    props: { spacer: h('div', { key: 1 }, '|') },
    slots: {
      default: () => {
        const left = h(Fragment, { key: 'left' }, [
          changed.value && button('extra', 'extra'),
          button('left'),
          h(Fragment, { key: 'nested' }, [
            button('a', replace.value ? 2 : 1),
            button('b', '1'),
            button('c', numericSymbol),
            button('d', otherSymbol)
          ])
        ]);
        const right = h(Fragment, { key: 'right' }, [
          button('right'),
          h(Fragment, { key: 'nested' }, [button('e', 1)])
        ]);
        return changed.value ? [right, left, button('tail')] : [left, button('tail'), right];
      }
    }
  });
  const identities = () => Object.fromEntries(
    wrapper.findAll('button').map(({ element }) => [element.id, [element, element.parentElement]])
  );
  const names = () => wrapper.findAll('button').map(({ element }) => element.id);
  const initial = identities();
  expect(names()).toEqual(['left', 'a', 'b', 'c', 'd', 'tail', 'right', 'e']);
  changed.value = true;
  await nextTick();
  expect(names()).toEqual(['right', 'e', 'extra', 'left', 'a', 'b', 'c', 'd', 'tail']);
  const reordered = identities();
  for (const id of Object.keys(initial)) {
    expect(reordered[id][0], id).toBe(initial[id][0]);
    expect(reordered[id][1], id).toBe(initial[id][1]);
  }
  replace.value = true;
  changed.value = false;
  await nextTick();
  expect(names()).toEqual(['left', 'a', 'b', 'c', 'd', 'tail', 'right', 'e']);
  const updated = identities();
  for (const id of Object.keys(initial).filter((id) => id !== 'a')) {
    expect(updated[id][0], id).toBe(initial[id][0]);
    expect(updated[id][1], id).toBe(initial[id][1]);
  }
  expect(updated.a[0]).not.toBe(initial.a[0]);
  expect(updated.a[1]).not.toBe(initial.a[1]);
});

test('转发插槽展开后保留逐层 scoped 样式，前缀更新时复用原节点', async () => {
  const Action = defineComponent({
    setup: (_, { slots }) => () => h('button', { class: 'action component' }, slots.default?.())
  });
  const wrapper = mount(ForwardedSpace, {
    props: { prefixCls: 'toolbar' },
    slots: {
      default: () => [
        h('button', { class: 'action native', key: 'native' }, 'Native'),
        h(Action, { key: 'component' }, () => h('span', { class: 'action inside' }, 'Component'))
      ]
    }
  });
  const slotted = (component: unknown) => `[${(component as { __scopeId: string }).__scopeId}-s]`;
  const innerScope = slotted(ForwardingSpace);
  const outerScope = slotted(ForwardedSpace);
  const matches = (scope: string) => wrapper.findAll(`.action${scope}`).map((item) => item.text());
  expect(matches(innerScope)).toEqual(['Native', 'Component']);
  expect(matches(outerScope)).toEqual(['Native', 'Component']);
  expect(wrapper.findAll(`.toolbar__item${innerScope}, .toolbar__item${outerScope}`)).toHaveLength(0);
  const nodes = wrapper.findAll('.action').map((item) => item.element);

  await wrapper.setProps({ prefixCls: '' });
  expect(wrapper.findAll('.i-space__item')).toHaveLength(3);
  expect(matches(innerScope)).toEqual(['Native', 'Component']);
  expect(matches(outerScope)).toEqual(['Native', 'Component']);
  wrapper.findAll('.action').forEach((item, index) => expect(item.element).toBe(nodes[index]));
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
