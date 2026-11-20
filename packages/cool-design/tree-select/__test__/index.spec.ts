import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { beforeEach, describe, expect, test } from 'vitest';

import TreeSelect from '..';
import ConfigProvider from '../../config-provider';
import Form from '../../form';
import type { TreeSelectNode } from '../tree-select';

// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);

const data: TreeSelectNode[] = [
  { value: 'a', label: '节点A', children: [{ value: 'a1', label: '节点A1' }, { value: 'a2', label: '节点A2' }] },
  { value: 'b', label: '节点B' }
];

const checkboxes = () =>
  doc().findAll('input.i-tree__checkbox').map((item) => item.element as HTMLInputElement);

/** 直接翻转 checked 并派发一次 change，避免 jsdom 原生激活行为重复触发 */
const toggleCheck = async (index: number) => {
  const input = checkboxes()[index];
  input.checked = !input.checked;
  input.dispatchEvent(new Event('change'));
  await nextTick();
};

const openDropdown = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.find('.i-tree-select__control').trigger('click');
  await nextTick();
};

const dropdownVisible = () => doc().find('.i-tree-select__dropdown:not([aria-hidden=true])').exists();

describe('test `TreeSelect` component', () => {
  test('多选时点击叶节点文字切换模型值', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: [] } });
    await openDropdown(wrapper);
    const leaf = doc().findAll('.i-tree__label').find((label) => label.text() === '节点A1')!;
    await leaf.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a1']]]);
    await wrapper.setProps({ modelValue: ['a1'] });
    await leaf.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a1']], [[]]]);
    wrapper.unmount();
  });

  test('非 checkStrictly 时勾选父节点级联子孙，取消同理', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: [] } });
    await openDropdown(wrapper);
    await toggleCheck(0);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a1', 'a2']);

    await wrapper.setProps({ modelValue: ['a', 'a1', 'a2'] });
    await nextTick();
    await toggleCheck(2);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![1][0]).toEqual(['a1']);
    wrapper.unmount();
  });

  test('子节点勾满后父节点自动选中', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: ['a1'] } });
    await openDropdown(wrapper);
    await toggleCheck(2);
    await nextTick();
    const result = wrapper.emitted('update:modelValue')![0][0] as (string | number)[];
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining(['a1', 'a2']));
    wrapper.unmount();
  });

  test('checkStrictly 时父子勾选解耦', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, multiple: true, checkStrictly: true, modelValue: [] }
    });
    await openDropdown(wrapper);
    await toggleCheck(0);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
    wrapper.unmount();
  });

  test('部分子节点选中时父节点展示半选状态', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: ['a1'] } });
    await openDropdown(wrapper);
    expect(checkboxes()[0].indeterminate).toBe(true);
    wrapper.unmount();

    const strict = mount(TreeSelect, {
      props: { data, multiple: true, checkStrictly: true, modelValue: ['a1'] }
    });
    await openDropdown(strict);
    expect(checkboxes()[0].indeterminate).toBe(false);
    strict.unmount();
  });

  test('单选模式回显 label，选中后收起下拉并输出单值', async () => {
    const wrapper = mount(TreeSelect, { props: { data, modelValue: null } });
    expect(wrapper.find('.i-tree-select__control').text()).toContain('请选择');
    await wrapper.setProps({ modelValue: 'a1' });
    await nextTick();
    expect(wrapper.find('.i-tree-select__control').text()).toContain('节点A1');

    await openDropdown(wrapper);
    expect(dropdownVisible()).toBe(true);
    await doc().findAll('.i-tree__content')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('a1');
    await nextTick();
    expect(dropdownVisible()).toBe(false);
    wrapper.unmount();
  });

  test('多选展示标签并支持删除与折叠', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, multiple: true, modelValue: ['a1', 'a2'], collapseTags: true, maxCollapseTags: 1 }
    });
    await nextTick();
    expect(wrapper.findAll('.i-tree-select__tag')).toHaveLength(1);
    expect(wrapper.text()).toContain('节点A1');
    expect(wrapper.text()).toContain('+1');

    await wrapper.find('.i-tree-select__tag-close').trigger('click');
    expect(wrapper.emitted('remove-tag')![0][0]).toBe('a1');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a2']);
    wrapper.unmount();
  });

  test('下拉默认传送到 body，外点与 Escape 关闭', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, modelValue: null, popperClass: 'teleport-scope' },
      attachTo: document.body
    });
    await openDropdown(wrapper);
    expect(wrapper.find('.i-tree-select__dropdown').exists()).toBe(false);
    const mine = () => doc().find('.teleport-scope');
    expect(mine().exists()).toBe(true);
    expect(mine().attributes('data-placement')).toBe('bottom-start');

    (wrapper.get('.i-tree-select__control').element as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await nextTick();
    expect(mine().attributes('aria-hidden')).toBe('true');

    await openDropdown(wrapper);
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(mine().attributes('aria-hidden')).toBe('true');
    wrapper.unmount();
  });
});


test('maps node keys, children, labels and disabled fields', async () => {
  const wrapper = mount(TreeSelect, { props: {
    nodeKey: 'id', props: { label: 'name', children: 'nodes', disabled: 'locked' },
    data: [{ id: 1, name: 'Parent', nodes: [{ id: 2, name: 'Child' }, { id: 3, name: 'Disabled', locked: true }] }],
    modelValue: 2, defaultExpandAll: true
  } });
  expect(wrapper.text()).toContain('Child');
  await openDropdown(wrapper);
  await doc().findAll('.i-tree__content')[2].trigger('click');
  expect(wrapper.emitted('change')).toBeUndefined();
  await doc().findAll('.i-tree__content')[1].trigger('click');
  expect(wrapper.emitted('change')).toEqual([[2]]);
  wrapper.unmount();
});

test('loads nodes lazily and displays cached and loaded labels', async () => {
  const wrapper = mount(TreeSelect, { props: {
    lazy: true, nodeKey: 'id', props: { label: 'name', isLeaf: 'leaf' }, modelValue: 2,
    cacheData: [{ id: 2, name: 'Cached child' }],
    load: (node, resolve) => resolve(node.level === 0
      ? [{ id: 1, name: 'Parent' }]
      : [{ id: 2, name: 'Loaded child', leaf: true }])
  } });
  expect(wrapper.text()).toContain('Cached child');
  await openDropdown(wrapper);
  await flushPromises();
  await doc().find('.i-tree__expand-icon').trigger('click');
  await flushPromises();
  expect(doc().text()).toContain('Loaded child');
  expect(wrapper.text()).toContain('Loaded child');
  await doc().findAll('.i-tree__content')[1].trigger('click');
  expect(wrapper.emitted('change')).toEqual([[2]]);
  expect(wrapper.text()).toContain('Loaded child');
  wrapper.unmount();
});

test('accepts promise-based lazy loads without resolving twice', async () => {
  const wrapper = mount(TreeSelect, { props: {
    lazy: true,
    load: async () => [{ value: 1, label: 'Async node', isLeaf: true }]
  } });
  await openDropdown(wrapper);
  await flushPromises();
  expect(doc().find('.i-tree__label').text()).toBe('Async node');
  wrapper.unmount();
});

test('does not select children of disabled mapped nodes', async () => {
  const wrapper = mount(TreeSelect, { props: {
    props: { disabled: 'locked' },
    data: [{ value: 1, label: 'Parent', locked: true, children: [{ value: 2, label: 'Child' }] }]
  } });
  await openDropdown(wrapper);
  await doc().findAll('.i-tree__content')[1].trigger('click');
  expect(wrapper.emitted('change')).toBeUndefined();
  wrapper.unmount();
});

test('函数标签在树挂载前回退到数据标签，挂载后使用节点上下文', async () => {
  const wrapper = mount(TreeSelect, { props: {
    modelValue: 1,
    data: [{ value: 1, label: '初始标签' }],
    props: { label: (_data, node) => `层级${node.level}` }
  } });
  expect(wrapper.text()).toContain('初始标签');
  await openDropdown(wrapper);
  await nextTick();
  expect(wrapper.text()).toContain('层级1');
  wrapper.unmount();
});

test('TreeSelect 遵循 Provider 空值及单选清空工厂', async () => {
  let calls = 0;
  const valueOnClear = () => { calls++; return undefined; };
  const wrapper = mount(ConfigProvider, {
    props: { emptyValues: ['none'], valueOnClear: 0 },
    slots: { default: () => [
      h(TreeSelect, { modelValue: 'none', clearable: true }),
      h(TreeSelect, { modelValue: 1, clearable: true }),
      h(TreeSelect, { modelValue: 'a', clearable: true, valueOnClear }),
      h(TreeSelect, { modelValue: ['a'], multiple: true, clearable: true, valueOnClear })
    ] }
  });
  const [empty, inherited, local, multiple] = wrapper.findAllComponents(TreeSelect);
  const clear = 'button[aria-label="清空"]';
  expect(empty.find(clear).exists()).toBe(false);
  expect(calls).toBe(0);
  await inherited.get(clear).trigger('click');
  await local.get(clear).trigger('click');
  await multiple.get(clear).trigger('click');
  expect(inherited.emitted('update:modelValue')).toEqual([[0]]);
  expect(inherited.emitted('change')).toEqual([[0]]);
  expect(local.emitted('update:modelValue')).toEqual([[undefined]]);
  expect(local.emitted('change')).toEqual([[undefined]]);
  expect(local.emitted('clear')).toEqual([[]]);
  expect(multiple.emitted('update:modelValue')).toEqual([[[]]]);
  expect(calls).toBe(1);
  wrapper.unmount();
});

test('TreeSelect 的双向绑定接受布尔清空结果', async () => {
  const warnings: string[] = [];
  let value: string | boolean = 'a';
  const wrapper = mount(TreeSelect, {
    props: { modelValue: 'a', clearable: true, emptyValues: [false], valueOnClear: false,
      'onUpdate:modelValue': (next: unknown) => { if (typeof next === 'boolean') value = next; } },
    global: { config: { warnHandler: (warning) => warnings.push(warning) } }
  });
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(value).toBe(false);
  await wrapper.setProps({ modelValue: value });
  expect(wrapper.find('button[aria-label="清空"]').exists()).toBe(false);
  expect(warnings).toEqual([]);
  wrapper.unmount();
});

test('TreeSelect 单选清空默认返回 undefined，可显式保留 null', async () => {
  for (const props of [{}, { valueOnClear: null }]) {
    const wrapper = mount(TreeSelect, { props: { ...props, modelValue: 'a', clearable: true } });
    await wrapper.get('button[aria-label="清空"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[props.valueOnClear]]);
    expect(wrapper.emitted('change')).toEqual([[props.valueOnClear]]);
    wrapper.unmount();
  }
});

test('TreeSelect 继承直挂 Form 尺寸与动态禁用', async () => {
  const wrapper = mount(Form, {
    props: { model: {}, size: 'large' },
    slots: { default: () => h(TreeSelect, { data, modelValue: 'a', teleported: false }) }
  });
  const select = wrapper.getComponent(TreeSelect);
  expect(select.classes()).toContain('i-tree-select--large');
  await select.get('.i-tree-select__control').trigger('click');
  expect(select.emitted('visible-change')).toEqual([[true]]);
  await wrapper.setProps({ disabled: true });
  expect(select.emitted('visible-change')).toEqual([[true], [false]]);
  expect(select.get('.i-tree-select__control').attributes('disabled')).toBeDefined();
  wrapper.unmount();
});

test('TreeSelect 保留可调用树实例、选中标签和节点插槽', async () => {
  const wrapper = mount(TreeSelect, {
    props: { data, modelValue: 'a1', defaultExpandAll: true, teleported: false },
    slots: { default: ({ data }) => h('span', `自定义 ${data.label}`) }
  });
  await wrapper.get('.i-tree-select__control').trigger('click');
  const instance = wrapper.vm as unknown as { treeRef?: { getNode(key: string): unknown }; getNode(key: string): unknown; selectedLabel: string };
  expect(instance.selectedLabel).toBe('节点A1');
  expect(instance.getNode('a1')).toBe(instance.treeRef?.getNode('a1'));
  expect(wrapper.text()).toContain('自定义 节点A1');
  wrapper.unmount();
});

test('TreeSelect 关闭时可读取真实树状态并提交一次原生表单值', async () => {
  let instance: import('..').TreeSelectInstance | undefined;
  const wrapper = mount({ render: () => h('form', null, h(TreeSelect, {
    ref: (value: unknown) => { instance = value as typeof instance; },
    data, multiple: true, modelValue: ['a1'], name: 'tree', teleported: false
  })) });
  await nextTick();
  await nextTick();
  const control = wrapper.getComponent(TreeSelect);
  expect(instance?.getCheckedKeys(true)).toEqual(['a1']);
  expect(new FormData(wrapper.get('form').element).getAll('tree')).toEqual(['a1']);
  instance?.selectRef?.togglePopperVisible(true);
  await nextTick();
  expect(control.get('[role="combobox"]').attributes('aria-expanded')).toBe('true');
  wrapper.unmount();
});

test('TreeSelect 严格单选可从子节点切换到父节点', async () => {
  const wrapper = mount(TreeSelect, { props: { data, modelValue: 'a1', showCheckbox: true, checkStrictly: true,
    defaultExpandAll: true, teleported: false } });
  await wrapper.get('.i-tree-select__control').trigger('click');
  await wrapper.get('.i-tree-select__dropdown input[type="checkbox"]').setValue(true);
  expect(wrapper.emitted('update:modelValue')).toEqual([['a']]);
  wrapper.unmount();
});

test('uses Select control options through the public TreeSelect interface', async () => {
  const wrapper = mount(TreeSelect, {
    props: { data: [{ value: 'one', label: 'One' }], modelValue: ['one'], multiple: true,
      teleported: false, clearable: true, filterable: true, remote: true, remoteShowSuffix: true,
      suffixIcon: 'icon-clock', clearIcon: 'icon-close', autocomplete: 'name', tagEffect: 'dark' },
    slots: { label: ({ label }) => h('span', { class: 'selected-label' }, label) }
  });
  expect(wrapper.get('.selected-label').text()).toBe('One');
  expect(wrapper.get('.i-tree-select__tag').classes()).toContain('i-select__tag--dark');
  expect(wrapper.get('.i-tree-select__control .icon-clock').exists()).toBe(true);
  expect(wrapper.get('.i-tree-select__clear .icon-close').exists()).toBe(true);
  expect(wrapper.vm.selectRef?.selectedLabel).toEqual(['One']);
  await wrapper.get('.i-tree-select__control').trigger('click');
  expect(wrapper.get('.i-tree-select__filter').attributes('autocomplete')).toBe('name');
  await wrapper.get('.i-select__dropdown').trigger('scroll');
  expect(wrapper.emitted('popup-scroll')).toEqual([[{ scrollTop: 0, scrollLeft: 0 }]]);
});
