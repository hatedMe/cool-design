import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, reactive } from 'vue';
import { describe, expect, test } from 'vitest';
import Transfer from '..';
import * as CoolDesign from '../../index';
import ConfigProvider from '../../config-provider';
import type { TransferItem } from '../types';

const basicData = (): TransferItem[] => [
  { key: 1, label: '选项一' },
  { key: 2, label: '选项二' },
  { key: 3, label: '选项三' },
  { key: 4, label: '选项四', disabled: true }
];

const panels = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.i-transfer__panel');
const itemsOf = (wrapper: ReturnType<typeof mount>, side: number) => panels(wrapper)[side].findAll('.i-transfer__item');
const itemLabels = (wrapper: ReturnType<typeof mount>, side: number) => itemsOf(wrapper, side).map((item) => item.text());
const buttons = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.i-transfer__button');
const toRight = (wrapper: ReturnType<typeof mount>) => buttons(wrapper)[0];
const toLeft = (wrapper: ReturnType<typeof mount>) => buttons(wrapper)[1];
const selectAll = (wrapper: ReturnType<typeof mount>, side: number) => panels(wrapper)[side].get('.i-transfer__select-all');
const countText = (wrapper: ReturnType<typeof mount>, side: number) => panels(wrapper)[side].get('.i-transfer__count').text();

test('Transfer 切换命名空间后保留筛选输入并可移动键值 0', async () => {
  const model = reactive<{ value: (string | number)[] }>({ value: [] });
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'acme' },
    slots: { default: () => h(Transfer, {
      data: [{ key: 0, label: '零' }, { key: 'other', label: '其他' }],
      filterable: true,
      virtualScroll: true,
      modelValue: model.value,
      'onUpdate:modelValue': (value: (string | number)[]) => { model.value = value; }
    }) }
  });
  expect(wrapper.findAll('.acme-transfer__panel')).toHaveLength(2);
  const input = wrapper.get('.acme-transfer__filter');
  await input.setValue('零');
  await wrapper.setProps({ namespace: '3d' });
  const filter = wrapper.findAll('input[type="text"]')[0];
  expect(filter.element).toBe(input.element);
  expect(filter.classes()).toContain('3d-transfer__filter');
  expect((filter.element as HTMLInputElement).value).toBe('零');
  expect(wrapper.get('[role="option"]').classes()).toContain('3d-transfer__item');
  await wrapper.get('[role="option"] input').setValue(true);
  await wrapper.get('button[aria-label="移到右侧"]').trigger('click');
  expect(model.value).toEqual([0]);
  wrapper.unmount();
});

describe('Transfer', () => {
  test('公开导出与全局安装一致', () => {
    expect(Transfer).toBeDefined();
    expect(CoolDesign.Transfer).toBe(Transfer);
  });

  test('按 modelValue 稳定划分左右列表并跳过无 key 数据', () => {
    const wrapper = mount(Transfer, { props: { modelValue: [2], data: [...basicData(), { label: '无 key' }] } });
    expect(itemLabels(wrapper, 0)).toEqual(['选项一', '选项三', '选项四']);
    expect(itemLabels(wrapper, 1)).toEqual(['选项二']);
  });

  test('移动选中到右侧并触发 change 与 update', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData() } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await itemsOf(wrapper, 0)[1].get('input').setValue(true);
    expect(toRight(wrapper).attributes('disabled')).toBeUndefined();
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[1, 2]]]);
    expect(wrapper.emitted('change')).toEqual([[[1, 2], 'right', [1, 2]]]);
    expect(wrapper.emitted('left-check-change')?.at(-1)).toEqual([[]]);
  });

  test('移动选中到左侧', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [1, 2, 3], data: basicData() } });
    await itemsOf(wrapper, 1)[0].get('input').setValue(true);
    await toLeft(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[2, 3]]]);
    expect(wrapper.emitted('change')).toEqual([[[2, 3], 'left', [1]]]);
  });

  test('modelValue 去重且移动不产生重复', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [2, 2], data: basicData(), targetOrder: 'push' } });
    expect(itemLabels(wrapper, 1)).toEqual(['选项二']);
    await itemsOf(wrapper, 0)[1].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[2, 3]]]);
  });

  test('受控更新外部 modelValue 后同步列表并清理越界选中', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData() } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    expect(toRight(wrapper).attributes('disabled')).toBeUndefined();
    await wrapper.setProps({ modelValue: [1] });
    expect(itemLabels(wrapper, 0)).toEqual(['选项二', '选项三', '选项四']);
    expect(itemLabels(wrapper, 1)).toEqual(['选项一']);
    expect(toRight(wrapper).attributes('disabled')).toBeDefined();
  });

  test('data 变化后清理失效选中', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData() } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await wrapper.setProps({ data: basicData().slice(1) });
    expect(toRight(wrapper).attributes('disabled')).toBeDefined();
  });

  test('全局 disabled 禁用交互且不触发事件', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData(), disabled: true, filterable: true } });
    expect(wrapper.classes()).toContain('is-disabled');
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    await selectAll(wrapper, 0).trigger('change');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('left-check-change')).toBeUndefined();
    expect(panels(wrapper)[0].get('.i-transfer__filter').attributes('disabled')).toBeDefined();
  });

  test('禁用项不可选中且全选与移动自动跳过', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData() } });
    await itemsOf(wrapper, 0)[3].get('input').setValue(true);
    expect(wrapper.emitted('left-check-change')).toBeUndefined();
    await selectAll(wrapper, 0).trigger('change');
    expect(wrapper.emitted('left-check-change')).toEqual([[[1, 2, 3]]]);
    expect(countText(wrapper, 0)).toBe('3/4');
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('change')).toEqual([[[1, 2, 3], 'right', [1, 2, 3]]]);
  });

  test('leftDefaultChecked 与 rightDefaultChecked 初始选中', () => {
    const wrapper = mount(Transfer, {
      props: { modelValue: [2], data: basicData(), leftDefaultChecked: [1, 2], rightDefaultChecked: [2] }
    });
    expect(countText(wrapper, 0)).toBe('1/3');
    expect(countText(wrapper, 1)).toBe('1/1');
    expect(toRight(wrapper).attributes('disabled')).toBeUndefined();
    expect(toLeft(wrapper).attributes('disabled')).toBeUndefined();
  });

  test('全选半选状态与计数', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData() } });
    expect(countText(wrapper, 0)).toBe('4');
    const all = selectAll(wrapper, 0);
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    expect((all.element as HTMLInputElement).indeterminate).toBe(true);
    expect(countText(wrapper, 0)).toBe('1/4');
    await all.trigger('change');
    expect(countText(wrapper, 0)).toBe('3/4');
    expect((all.element as HTMLInputElement).indeterminate).toBe(false);
    expect((all.element as HTMLInputElement).checked).toBe(true);
    await all.trigger('change');
    expect(countText(wrapper, 0)).toBe('4');
  });

  test('搜索过滤与无匹配文案', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData(), filterable: true } });
    const filter = panels(wrapper)[0].get('.i-transfer__filter');
    await filter.setValue('选项一');
    expect(itemLabels(wrapper, 0)).toEqual(['选项一']);
    await filter.setValue('不存在');
    expect(panels(wrapper)[0].get('.i-transfer__empty').text()).toBe('无匹配数据');
  });

  test('无数据文案与自定义 filterMethod', async () => {
    const empty = mount(Transfer, { props: { modelValue: [], data: [] } });
    expect(panels(empty)[0].get('.i-transfer__empty').text()).toBe('无数据');
    const wrapper = mount(Transfer, {
      props: { modelValue: [], data: basicData(), filterable: true, filterMethod: (query: string, item: TransferItem) => String(item.key) === query }
    });
    await panels(wrapper)[0].get('.i-transfer__filter').setValue('2');
    expect(itemLabels(wrapper, 0)).toEqual(['选项二']);
  });

  test('clearQuery 清空单侧与全部搜索', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData(), filterable: true } });
    const exposed = wrapper.vm as unknown as { clearQuery: (which?: 'left' | 'right' | 0 | 1) => void };
    await panels(wrapper)[0].get('.i-transfer__filter').setValue('选项一');
    await panels(wrapper)[1].get('.i-transfer__filter').setValue('选项二');
    exposed.clearQuery('left');
    await wrapper.vm.$nextTick();
    expect(itemLabels(wrapper, 0)).toHaveLength(4);
    expect(itemLabels(wrapper, 1)).toHaveLength(0);
    exposed.clearQuery();
    await wrapper.vm.$nextTick();
    expect(itemLabels(wrapper, 1)).toHaveLength(0);
    await wrapper.setProps({ modelValue: [2] });
    expect(itemLabels(wrapper, 1)).toEqual(['选项二']);
  });

  test('targetOrder 为 push 时追加到末尾', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [3], data: basicData(), targetOrder: 'push' } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[3, 1]]]);
    await wrapper.setProps({ modelValue: [3, 1] });
    expect(itemLabels(wrapper, 1)).toEqual(['选项三', '选项一']);
  });

  test('targetOrder 为 unshift 时前置到开头', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [3], data: basicData(), targetOrder: 'unshift' } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[1, 3]]]);
    await wrapper.setProps({ modelValue: [1, 3] });
    expect(itemLabels(wrapper, 1)).toEqual(['选项一', '选项三']);
  });

  test('targetOrder 为 original 时按原始顺序展示', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [3], data: basicData(), targetOrder: 'original' } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[1, 3]]]);
    await wrapper.setProps({ modelValue: [3, 1] });
    expect(itemLabels(wrapper, 1)).toEqual(['选项一', '选项三']);
  });

  test('format 计数模板支持两种占位写法', async () => {
    const wrapper = mount(Transfer, {
      props: { modelValue: [], data: basicData(), format: { noChecked: '共 {total} 项', hasChecked: '已选 ${checked}/${total}' } }
    });
    expect(countText(wrapper, 0)).toBe('共 4 项');
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    expect(countText(wrapper, 0)).toBe('已选 1/4');
  });

  test('props 字段映射', async () => {
    const data = [
      { id: 1, name: '北京' },
      { id: 2, name: '上海', forbid: true }
    ];
    const wrapper = mount(Transfer, { props: { modelValue: [], data, props: { key: 'id', label: 'name', disabled: 'forbid' } } });
    expect(itemLabels(wrapper, 0)).toEqual(['北京', '上海']);
    await itemsOf(wrapper, 0)[1].get('input').setValue(true);
    expect(wrapper.emitted('left-check-change')).toBeUndefined();
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[1]]]);
  });

  test('check-change 事件参数', async () => {
    const wrapper = mount(Transfer, { props: { modelValue: [3], data: basicData() } });
    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    expect(wrapper.emitted('left-check-change')).toEqual([[[1]]]);
    await itemsOf(wrapper, 1)[0].get('input').setValue(true);
    expect(wrapper.emitted('right-check-change')).toEqual([[[3]]]);
  });

  test('空态与底部插槽', () => {
    const Host = defineComponent({
      components: { Transfer },
      setup: () => () =>
        h(Transfer, { modelValue: [], data: [] }, {
          'left-empty': () => '左空',
          'right-empty': () => '右空',
          'left-footer': () => '左底',
          'right-footer': () => '右底'
        })
    });
    const wrapper = mount(Host);
    expect(panels(wrapper)[0].text()).toContain('左空');
    expect(panels(wrapper)[1].text()).toContain('右空');
    expect(wrapper.findAll('.i-transfer__footer').map((node) => node.text())).toEqual(['左底', '右底']);
  });

  test('default 与 item 插槽自定义条目', () => {
    const DefaultHost = defineComponent({
      components: { Transfer },
      setup: () => ({ items: basicData() }),
      template: `<Transfer :model-value="[]" :data="items"><template #default="{ option }"><span class="custom">{{ option.label }}!</span></template></Transfer>`
    });
    expect(mount(DefaultHost).findAll('.custom').map((node) => node.text())).toEqual(['选项一!', '选项二!', '选项三!', '选项四!']);
    const ItemHost = defineComponent({
      components: { Transfer },
      setup: () => () => h(Transfer, { modelValue: [], data: basicData() }, { item: ({ option }: { option: TransferItem }) => `条目-${option.label}` })
    });
    expect(itemsOf(mount(ItemHost), 0).map((item) => item.text())).toEqual(['条目-选项一', '条目-选项二', '条目-选项三', '条目-选项四']);
  });

  test('无障碍属性', () => {
    const wrapper = mount(Transfer, { props: { modelValue: [], data: basicData(), titles: ['左', '右'], buttonTexts: ['到左', '到右'] } });
    const lists = wrapper.findAll('[role="listbox"]');
    expect(lists).toHaveLength(2);
    expect(lists[0].attributes('aria-multiselectable')).toBe('true');
    expect(lists[0].attributes('aria-label')).toBe('左');
    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(4);
    expect(options[0].attributes('aria-selected')).toBe('false');
    expect(options[3].attributes('aria-disabled')).toBe('true');
    expect(toRight(wrapper).attributes('aria-label')).toBe('到右');
    expect(toLeft(wrapper).attributes('aria-label')).toBe('到左');
    expect(toRight(wrapper).attributes('disabled')).toBeDefined();
  });

  test('表单禁用继承、change 触发校验与字段关联', async () => {
    const model = reactive<{ picked: number[] }>({ picked: [] });
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            CoolDesign.Form,
            {
              model,
              rules: {
                picked: [
                  {
                    trigger: 'change',
                    validator: (value: unknown) => {
                      if (Array.isArray(value) && value.length) throw new Error('不允许选择');
                    }
                  }
                ]
              }
            },
            () =>
              h(CoolDesign.FormItem, { prop: 'picked', label: '选项' }, () =>
                h(CoolDesign.Transfer, {
                  data: basicData(),
                  modelValue: model.picked,
                  'onUpdate:modelValue': (value: number[]) => (model.picked = value)
                })
              )
          )
      })
    );
    const root = wrapper.find('.i-transfer');
    const fieldId = root.attributes('id');
    expect(fieldId).toMatch(/^i-id-/);
    expect(wrapper.find('label').attributes('for')).toBeUndefined();
    expect(root.attributes('aria-labelledby')).toBe(wrapper.get('.i-form-item__label').element.id);
    expect(wrapper.text()).not.toContain('不允许选择');

    await itemsOf(wrapper, 0)[0].get('input').setValue(true);
    await toRight(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('不允许选择');
    expect(root.attributes('aria-invalid')).toBe('true');
    expect(root.attributes('aria-describedby')).toBe(wrapper.get('[role=alert]').attributes('id'));
    wrapper.unmount();

    const disabledWrapper = mount(
      defineComponent({
        setup: () => () =>
          h(CoolDesign.Form, { model, disabled: true }, () =>
            h(CoolDesign.FormItem, { prop: 'picked', label: '选项' }, () =>
              h(CoolDesign.Transfer, { modelValue: model.picked, data: basicData() })
            )
          )
      })
    );
    expect(disabledWrapper.find('.i-transfer').classes()).toContain('is-disabled');
    expect(itemsOf(disabledWrapper, 0)[0].get('input').attributes('disabled')).toBeDefined();
    expect(selectAll(disabledWrapper, 0).attributes('disabled')).toBeDefined();
    expect(toRight(disabledWrapper).attributes('disabled')).toBeDefined();
  });
});

test('Transfer 直挂禁用 Form 时不会选中项目', () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {}, disabled: true },
    slots: { default: () => h(Transfer, { data: basicData(), modelValue: [] }) }
  });
  const transfer = wrapper.getComponent(Transfer);
  expect(transfer.attributes('aria-disabled')).toBe('true');
  for (const input of transfer.findAll('input[type="checkbox"]')) {
    expect(input.attributes('disabled')).toBeDefined();
    input.element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  expect(transfer.emitted('left-check-change')).toBeUndefined();
  expect(transfer.emitted('right-check-change')).toBeUndefined();
  wrapper.unmount();
});

test('Transfer 禁用 Form 后拒绝搬移已勾选项目', async () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {} },
    slots: { default: () => h(Transfer, { data: basicData(), modelValue: [], leftDefaultChecked: [1] }) }
  });
  const transfer = wrapper.getComponent(Transfer);
  const move = transfer.get('.i-transfer__buttons button');
  await wrapper.setProps({ disabled: true });
  move.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(transfer.emitted('update:modelValue')).toBeUndefined();
  wrapper.unmount();
});

test('exposes both mounted filter panels', async () => {
  const wrapper = mount(Transfer, { props: { filterable: true } });
  await wrapper.findAll('.i-transfer__filter')[0].setValue('left');
  expect(wrapper.vm.leftPanel?.query).toBe('left');
  expect(wrapper.vm.rightPanel?.query).toBe('');
  wrapper.vm.clearQuery('left');
  await wrapper.vm.$nextTick();
  expect(wrapper.vm.leftPanel?.query).toBe('');
});

test('bounds both virtual panels while select-all uses all filtered data', async () => {
  const data = Array.from({ length: 4000 }, (_, key) => ({ key, label: String(key) }));
  const wrapper = mount(Transfer, {
    props: { data, modelValue: data.slice(2000).map((item) => item.key), virtualScroll: true, itemSize: 30 }
  });
  expect(wrapper.findAll('[role="option"]').length).toBeLessThan(60);
  await wrapper.findAll('.i-transfer__select-all')[0].setValue(true);
  expect(wrapper.findAll('.i-transfer__count')[0].text()).toBe('2000/2000');
});
