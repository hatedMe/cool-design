import { mount } from '@vue/test-utils';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, expect, test } from 'vitest';
import { idKey } from '../../hooks/use-id';
import { Cascader, ConfigProvider, DatePicker, DatePickerPanel, DateTimePicker, Form, FormItem, TimePicker, TimeSelect } from '..';

const namespace = 'picker';
const mounts: Array<{ unmount: () => void }> = [];

afterEach(() => {
  mounts.splice(0).forEach((wrapper) => wrapper.unmount());
});

test('日期时间输入在并发 SSR 中使用各自的初始 ID 种子', async () => {
  const render = (prefix: number) => {
    const app = createSSRApp(() => h(ConfigProvider, { namespace }, () => [
      h(DatePicker, { type: 'daterange' }),
      h(DateTimePicker),
      h(TimePicker, { isRange: true })
    ]));
    app.provide(idKey, { prefix, current: 4 });
    return renderToString(app);
  };
  const [first, other, repeat] = await Promise.all([render(21), render(22), render(21)]);
  expect(first).toBe(repeat);
  expect(first).toContain('id="picker-id-21-4-start"');
  expect(first).toContain('id="picker-id-21-4-end"');
  expect(other).toContain('id="picker-id-22-4-start"');
  expect(first).not.toContain('aria-controls=');
});

test('日期面板每次打开都通过同一个有效 ID 关联范围输入', async () => {
  const seed = { prefix: 7, current: 3 };
  const wrapper = mount(DatePicker, {
    props: { type: 'daterange', id: ['start', 'end'], teleported: false },
    global: { provide: { [idKey as symbol]: seed } }
  });
  mounts.push(wrapper);
  const inputs = wrapper.findAll('input');
  expect(inputs.map((input) => input.attributes('id'))).toEqual(['start', 'end']);
  expect(inputs[0].attributes('aria-controls')).toBeUndefined();
  await inputs[0].trigger('click');
  const panel = wrapper.get('.i-date-picker__dropdown');
  expect(panel.attributes('id')).toMatch(/^i-id-7-\d+$/);
  expect(inputs.map((input) => input.attributes('aria-controls'))).toEqual([panel.attributes('id'), panel.attributes('id')]);
  const panelId = panel.attributes('id');
  await inputs[0].trigger('keydown', { key: 'Escape' });
  expect(inputs[1].attributes('aria-controls')).toBeUndefined();
  await inputs[1].trigger('click');
  expect(wrapper.get('.i-date-picker__dropdown').attributes('id')).toBe(panelId);
  const current = seed.current;
  await wrapper.setProps({ id: 'start-only' });
  expect(inputs[0].attributes('id')).toBe('start-only');
  expect(inputs[1].attributes('id')).toMatch(/^i-id-7-\d+-end$/);
  await wrapper.setProps({ id: undefined });
  const fallback = inputs[0].attributes('id');
  expect(fallback).toMatch(/^i-id-7-\d+-start$/);
  await wrapper.setProps({ id: ['new-start', 'new-end'] });
  await wrapper.setProps({ id: undefined });
  expect(inputs[0].attributes('id')).toBe(fallback);
  expect(seed.current).toBe(current);
});

test('时间选择器把范围 ID 逐个写入输入框并关联打开的面板', async () => {
  const wrapper = mount(TimePicker, { props: { isRange: true, id: ['from', 'to'], teleported: false } });
  mounts.push(wrapper);
  const inputs = wrapper.findAll('input');
  expect(inputs.map((input) => input.attributes('id'))).toEqual(['from', 'to']);
  await inputs[1].trigger('keydown', { key: 'Enter' });
  const panel = wrapper.get('.i-time-picker__dropdown');
  expect(panel.attributes('id')).toBeTruthy();
  expect(inputs.map((input) => input.attributes('aria-controls'))).toEqual([panel.attributes('id'), panel.attributes('id')]);
  await inputs[1].trigger('keydown', { key: 'Escape' });
  expect(inputs[1].attributes('aria-controls')).toBeUndefined();
});

test('独立日期面板将调用方 ID 保留在面板元素', async () => {
  const wrapper = mount(DatePickerPanel, { attrs: { id: 'inline-calendar' } });
  mounts.push(wrapper);
  expect(wrapper.element.id).toBe('inline-calendar');
  await wrapper.setProps({ id: 'changed-calendar' });
  expect(wrapper.element.id).toBe('changed-calendar');
});

test.each([
  ['TimePicker', TimePicker, {}],
  ['TimeSelect', TimeSelect, {}],
  ['Cascader', Cascader, { filterable: true }]
] as const)('%s 的原生输入保留显式 ID 并回退到 FormItem 标签', async (_, component, props) => {
  const wrapper = mount(Form, { props: { model: {} }, slots: { default: () => h(FormItem, { label: '时间或地区' }, () => h(component, { ...props, id: 'explicit-input' })) } });
  mounts.push(wrapper);
  const input = wrapper.get('input[type="text"]');
  expect(input.attributes('id')).toBe('explicit-input');
  expect(wrapper.findAll('#explicit-input')).toHaveLength(1);
  const fallback = mount(Form, { props: { model: {} }, slots: { default: () => h(FormItem, { label: '时间或地区' }, () => h(component, props)) } });
  mounts.push(fallback);
  await nextTick();
  expect(fallback.get('input[type="text"]').attributes('id')).toBe(fallback.get('label').attributes('for'));
});

test('级联选择的持久面板保留已分配的 ID 与 DOM 节点', async () => {
  const wrapper = mount(Cascader, {
    props: { teleported: false, persistent: true },
    global: { provide: { [idKey as symbol]: { prefix: 12, current: 9 } } }
  });
  mounts.push(wrapper);
  const input = wrapper.get('[role="combobox"]');
  await input.trigger('click');
  const panel = wrapper.get('.i-cascader__dropdown');
  expect(panel.attributes('id')).toMatch(/^i-id-12-\d+$/);
  expect(input.attributes('aria-controls')).toBe(panel.attributes('id'));
  await input.trigger('click');
  expect(input.attributes('aria-controls')).toBeUndefined();
  expect(panel.attributes('aria-hidden')).toBe('true');
  await input.trigger('click');
  expect(wrapper.get('.i-cascader__dropdown').element).toBe(panel.element);
  expect(input.attributes('aria-controls')).toBe(panel.attributes('id'));
});

const conflictBase = 'i-id-17-4';

test.each([
  ['DatePicker', DatePicker, { type: 'daterange' }],
  ['TimePicker', TimePicker, { isRange: true }]
] as const)('%s 的范围回退 ID 避开实际使用的显式 ID', async (_, component, props) => {
  const seed = { prefix: 17, current: 4 };
  const wrapper = mount(component, {
    props: { ...props, id: conflictBase + '-end', teleported: false },
    global: { provide: { [idKey as symbol]: seed } }
  });
  mounts.push(wrapper);
  const [start, end] = wrapper.findAll('input');
  expect(start.element.id).toBe(conflictBase + '-end');
  expect(end.element.id).not.toBe(start.element.id);
  await wrapper.setProps({ id: ['', conflictBase + '-start'] });
  expect(end.element.id).toBe(conflictBase + '-start');
  expect(start.element.id).not.toBe(end.element.id);
  await wrapper.setProps({ id: [conflictBase, conflictBase + '-panel'] });
  await start.trigger('click');
  expect(start.attributes('aria-controls')).not.toBe(start.element.id);
  expect(start.attributes('aria-controls')).not.toBe(end.element.id);
  await wrapper.setProps({ id: undefined });
  expect([start.element.id, end.element.id]).toEqual([conflictBase + '-start', conflictBase + '-end']);
  expect(start.attributes('aria-controls')).toBe(conflictBase);
  expect(seed.current).toBe(5);
});

test.each([
  ['DatePicker', DatePicker, '.i-date-picker__dropdown', 'Enter'],
  ['TimePicker', TimePicker, '.i-time-picker__dropdown', 'Enter'],
  ['Cascader', Cascader, '.i-cascader__dropdown', 'Enter'],
  ['TimeSelect', TimeSelect, '.i-time-select__dropdown', 'ArrowDown']
] as const)('%s 的显式 ID 动态变化时，展开引用始终指向面板', async (_, component, panelSelector, key) => {
  const seed = { prefix: 17, current: 4 };
  const wrapper = mount(component, {
    attrs: { id: 'explicit' },
    props: { teleported: false },
    global: { provide: { [idKey as symbol]: seed } },
    attachTo: document.body
  });
  mounts.push(wrapper);
  const control = wrapper.get('[role="combobox"]');
  await control.trigger('keydown', { key });
  const panel = wrapper.get(panelSelector);
  expect(panel.element.id).toBe(conflictBase);
  await wrapper.setProps({ id: conflictBase });
  expect(control.element.id).toBe(conflictBase);
  expect(document.getElementById(control.attributes('aria-controls'))).toBe(panel.element);
  expect(panel.element.id).not.toBe(control.element.id);
  await wrapper.setProps({ id: undefined });
  expect(panel.element.id).toBe(conflictBase);
  expect(control.attributes('aria-controls')).toBe(conflictBase);
  expect(seed.current).toBe(5);
});

test('TimeSelect 活动选项 ID 避开输入框 ID', async () => {
  const wrapper = mount(TimeSelect, {
    attrs: { id: conflictBase + '-540' },
    props: { teleported: false },
    global: { provide: { [idKey as symbol]: { prefix: 17, current: 4 } } },
    attachTo: document.body
  });
  mounts.push(wrapper);
  const control = wrapper.get('input[role="combobox"]');
  await control.trigger('keydown', { key: 'ArrowDown' });
  const option = wrapper.get('[role="option"]');
  expect(control.element.id).toBe(conflictBase + '-540');
  expect(document.getElementById(control.attributes('aria-activedescendant'))).toBe(option.element);
  expect(option.element.id).not.toBe(control.element.id);
  await wrapper.setProps({ id: undefined });
  expect(option.element.id).toBe(conflictBase + '-540');
  expect(control.attributes('aria-activedescendant')).toBe(option.element.id);
});
