import { DOMWrapper, mount } from '@vue/test-utils';
import { h, isVNode } from 'vue';
import { expect, test } from 'vitest';
import Pagination from '..';

const combobox = '[role="combobox"]';
const listbox = '[role="listbox"]';
const activePage = 'button[aria-current="page"]';

test('默认前后页图标保留组件身份并渲染箭头', () => {
  const wrapper = mount(Pagination, { props: { total: 30 } });
  const other = mount(Pagination, { props: { total: 30 } });
  for (const prop of ['prevIcon', 'nextIcon'] as const) {
    const icon = wrapper.props(prop);
    expect(isVNode(icon)).toBe(false);
    expect(typeof icon).toBe('function');
    expect(icon).toBe(other.props(prop));
  }
  const previous = wrapper.get('.i-pagination__prev svg path').attributes('d');
  const next = wrapper.get('.i-pagination__next svg path').attributes('d');
  expect(previous).toBeTruthy();
  expect(next).toBeTruthy();
  expect(previous).not.toBe(next);
});

test('自定义图标支持组件及名称，文字优先，插槽只在指定位置执行', async () => {
  let slotCalls = 0;
  const previous = () => h('span', { class: 'custom-previous' });
  const wrapper = mount(Pagination, {
    global: { components: { CustomPrevious: previous } },
    props: { total: 30, prevIcon: 'CustomPrevious', nextIcon: previous, size: 'large' },
    slots: { default: () => { slotCalls++; return h('span', { class: 'custom-slot' }, '附加内容'); } }
  });
  expect(wrapper.classes()).toContain('i-pagination--large');
  expect(wrapper.get('.i-pagination__prev .custom-previous').exists()).toBe(true);
  expect(wrapper.get('.i-pagination__next .custom-previous').exists()).toBe(true);
  expect(slotCalls).toBe(0);
  await wrapper.setProps({ layout: 'prev, slot, next', prevText: '返回' });
  expect(wrapper.get('.i-pagination__prev').text()).toBe('返回');
  expect(wrapper.find('.i-pagination__prev .custom-previous').exists()).toBe(false);
  expect(wrapper.get('nav > span:nth-child(2) .custom-slot').text()).toBe('附加内容');
  expect(slotCalls).toBe(1);
});

test('分页下拉传送至指定宿主并支持切换宿主、内联和卸载', async () => {
  const hostA = document.createElement('div');
  const hostB = document.createElement('div');
  hostA.id = 'pagination-host-a';
  hostB.id = 'pagination-host-b';
  document.body.append(hostA, hostB);
  const wrapper = mount(Pagination, {
    props: { total: 100, layout: 'sizes', appendSizeTo: '#pagination-host-a', popperClass: ['page-options'], popperStyle: [{ color: 'red' }] }
  });
  try {
    await wrapper.get(combobox).trigger('click');
    const panel = new DOMWrapper(hostA).get<HTMLElement>(listbox);
    expect(panel.classes()).toContain('page-options');
    expect(panel.element.style.color).toBe('red');
    await wrapper.setProps({ appendSizeTo: '#pagination-host-b' });
    expect(hostA.querySelector(listbox)).toBeNull();
    expect(hostB.querySelector(listbox)).toBe(panel.element);
    await wrapper.setProps({ teleported: false });
    expect(hostB.querySelector(listbox)).toBeNull();
    expect(wrapper.find(listbox).exists()).toBe(true);
    await wrapper.setProps({ teleported: true });
    expect(hostB.querySelector(listbox)).not.toBeNull();
  } finally {
    wrapper.unmount();
    expect(hostB.querySelector(listbox)).toBeNull();
    hostA.remove();
    hostB.remove();
  }
});

test('内部尺寸变化同步裁剪页码，随后批量发出 change 两参数', async () => {
  const events: Array<[string, ...number[]]> = [];
  const wrapper = mount(Pagination, {
    props: {
      total: 100, defaultCurrentPage: 10, layout: 'sizes, pager', teleported: false,
      'onUpdate:pageSize': (size: number) => events.push(['update:size', size]),
      'onSizeChange': (size: number) => events.push(['size', size]),
      'onPageSizeChange': (size: number) => events.push(['legacy:size', size]),
      'onUpdate:currentPage': (page: number) => events.push(['update:page', page]),
      'onCurrentChange': (page: number) => events.push(['page', page]),
      'onChange': (page: number, size: number) => events.push(['change', page, size])
    }
  });
  await wrapper.get(combobox).trigger('click');
  const size = wrapper.get('[role="option"][data-value="20"]');
  const changed = size.trigger('click');
  expect(events).toEqual([
    ['update:size', 20], ['legacy:size', 20], ['size', 20], ['update:page', 5], ['page', 5]
  ]);
  await changed;
  expect(events.at(-1)).toEqual(['change', 5, 20]);
  expect(wrapper.get(activePage).text()).toBe('5');
  expect(wrapper.get(combobox).text()).toBe('20 条/页');
});

test('受控绑定拒绝请求时保留选中值且不发 change，接纳时仅汇总一次', async () => {
  const wrapper = mount(Pagination, {
    props: { total: 100, currentPage: 8, pageSize: 10, layout: 'sizes, prev, pager, next', teleported: false }
  });
  await wrapper.get('.i-pagination__next').trigger('click');
  expect(wrapper.emitted('update:currentPage')).toEqual([[9]]);
  expect(wrapper.emitted('current-change')).toEqual([[9]]);
  expect(wrapper.emitted('next-click')).toEqual([[8]]);
  expect(wrapper.emitted('change')).toBeUndefined();
  await wrapper.get(combobox).trigger('click');
  await wrapper.get('[role="option"][data-value="20"]').trigger('click');
  expect(wrapper.emitted('update:pageSize')).toEqual([[20]]);
  expect(wrapper.emitted('update:currentPage')).toEqual([[9]]);
  expect(wrapper.get(activePage).text()).toBe('8');
  expect(wrapper.get(combobox).text()).toBe('10 条/页');
  expect(wrapper.emitted('change')).toBeUndefined();
  await wrapper.setProps({ pageSize: 20, currentPage: 5 });
  expect(wrapper.emitted('change')).toEqual([[5, 20]]);
});

test('接纳受控尺寸后只请求一次裁剪，page-count 始终优先', async () => {
  const wrapper = mount(Pagination, {
    props: { total: 100, currentPage: 8, pageSize: 10, layout: 'sizes, pager', teleported: false }
  });
  await wrapper.setProps({ pageSize: 20 });
  expect(wrapper.emitted('update:currentPage')).toEqual([[5]]);
  expect(wrapper.emitted('current-change')).toEqual([[5]]);
  expect(wrapper.emitted('change')).toEqual([[8, 20]]);
  await wrapper.setProps({ currentPage: 5, pageCount: 12 });
  expect(wrapper.emitted('change')).toEqual([[8, 20], [5, 20]]);
  await wrapper.setProps({ pageSize: 30, total: 3 });
  expect(wrapper.emitted('update:currentPage')).toEqual([[5]]);
  expect(wrapper.emitted('change')?.at(-1)).toEqual([5, 30]);
  expect(wrapper.get(activePage).text()).toBe('5');
});

test('变更 page-sizes 时保留当前条数，total 为零时维持一页', async () => {
  const wrapper = mount(Pagination, {
    props: { total: 0, defaultPageSize: 35, pageSizes: [50, 20, 20], layout: 'total, sizes, pager, next', teleported: false }
  });
  await wrapper.get(combobox).trigger('click');
  expect(wrapper.findAll('[role="option"]').map((option) => option.attributes('data-value'))).toEqual(['20', '35', '50']);
  await wrapper.setProps({ pageSizes: [100, 10] });
  expect(wrapper.findAll('[role="option"]').map((option) => option.attributes('data-value'))).toEqual(['10', '35', '100']);
  expect(wrapper.get(combobox).text()).toBe('35 条/页');
  expect(wrapper.get(activePage).text()).toBe('1');
  expect(wrapper.get('.i-pagination__next').attributes('disabled')).toBeDefined();
  expect(wrapper.emitted('change')).toBeUndefined();
});

test('禁用时关闭当前下拉并忽略鼠标和按键', async () => {
  const wrapper = mount(Pagination, { props: { total: 100, layout: 'sizes', teleported: false } });
  const trigger = wrapper.get(combobox);
  await trigger.trigger('keydown', { key: ' ' });
  expect(trigger.attributes('aria-expanded')).toBe('true');
  await wrapper.setProps({ disabled: true });
  expect(trigger.attributes('aria-expanded')).toBe('false');
  expect(wrapper.get(listbox).attributes('aria-hidden')).toBe('true');
  await trigger.trigger('keydown', { key: 'Enter' });
  await trigger.trigger('click');
  expect(trigger.attributes('aria-expanded')).toBe('false');
  expect(wrapper.emitted('update:pageSize')).toBeUndefined();
});
