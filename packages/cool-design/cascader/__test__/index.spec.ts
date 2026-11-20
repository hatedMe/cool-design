import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { describe, expect, test } from 'vitest';

import Cascader from '..';
import type { CascaderModelValue, CascaderNode, CascaderOption } from '../types';
import Form from '../../form';
import type { FormInstance, FormRule } from '../../form';
import FormItem from '../../form-item';

const options: CascaderOption[] = [
  {
    value: 'zhinan',
    label: '指南',
    children: [
      {
        value: 'sheji',
        label: '设计',
        children: [
          { value: 'yizhi', label: '一致' },
          { value: 'fankui', label: '反馈' }
        ]
      },
      { value: 'kaifa', label: '开发' }
    ]
  },
  {
    value: 'zujian',
    label: '组件',
    children: [
      { value: 'form', label: 'Form表单' },
      { value: 'select', label: 'Select 选择器' }
    ]
  }
];

type Wrapper = ReturnType<typeof mount>;

const open = async (wrapper: Wrapper) => {
  if (!wrapper.find('.i-cascader__dropdown').exists()) {
    await wrapper.find('[role="combobox"]').trigger('click');
  }
};

const findNode = (wrapper: Wrapper, label: string) => {
  const node = wrapper.findAll('.i-cascader__node').find((item) => item.text().includes(label));
  expect(node).toBeTruthy();
  return node!;
};

const clickNode = async (wrapper: Wrapper, label: string) => {
  await findNode(wrapper, label).find('.i-cascader__label').trigger('click');
};

const checkNode = async (wrapper: Wrapper, label: string) => {
  await findNode(wrapper, label).find('input[type="checkbox"]').trigger('change');
};

describe('test `Cascader` component', () => {
  test('单选点击展开父节点，点击叶子选中收起并输出路径', async () => {
    const wrapper = mount(Cascader, { props: { options, teleported: false } });
    await open(wrapper);
    expect(wrapper.findAll('.i-cascader__menu')).toHaveLength(1);
    await clickNode(wrapper, '指南');
    expect(wrapper.findAll('.i-cascader__menu')).toHaveLength(2);
    await clickNode(wrapper, '设计');
    expect(wrapper.findAll('.i-cascader__menu')).toHaveLength(3);
    await clickNode(wrapper, '一致');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['zhinan', 'sheji', 'yizhi']);
    expect(wrapper.emitted('change')![0][0]).toEqual(['zhinan', 'sheji', 'yizhi']);
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(false);
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
  });

  test('emitPath=false 时只输出选中节点值', async () => {
    const wrapper = mount(Cascader, { props: { options, emitPath: false, teleported: false } });
    await open(wrapper);
    await clickNode(wrapper, '指南');
    await clickNode(wrapper, '开发');
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('kaifa');
    expect(wrapper.emitted('change')![0][0]).toBe('kaifa');
  });

  test('showAllLevels 与 separator 控制输入框回显', async () => {
    const full = mount(Cascader, { props: { options, modelValue: ['zhinan', 'sheji', 'yizhi'] } });
    expect(full.find('[role="combobox"]').text()).toContain('指南 / 设计 / 一致');

    const last = mount(Cascader, {
      props: { options, modelValue: ['zhinan', 'sheji', 'yizhi'], showAllLevels: false }
    });
    expect(last.find('[role="combobox"]').text()).toContain('一致');
    expect(last.find('[role="combobox"]').text()).not.toContain('指南');

    const sep = mount(Cascader, {
      props: { options, modelValue: ['zhinan', 'sheji', 'yizhi'], separator: ' > ' }
    });
    expect(sep.find('[role="combobox"]').text()).toContain('指南 > 设计 > 一致');
  });

  test('多选勾选父节点级联勾选子孙叶子，面板不自动收起', async () => {
    const wrapper = mount(Cascader, { props: { options, multiple: true, modelValue: [], teleported: false } });
    await open(wrapper);
    await checkNode(wrapper, '指南');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([
      ['zhinan', 'sheji', 'yizhi'],
      ['zhinan', 'sheji', 'fankui'],
      ['zhinan', 'kaifa']
    ]);
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(true);
  });

  test('子节点勾满后父节点自动选中，部分选中为半选', async () => {
    const wrapper = mount(Cascader, {
      props: { options, multiple: true, modelValue: [['zhinan', 'sheji', 'yizhi']], teleported: false }
    });
    await open(wrapper);
    await checkNode(wrapper, '反馈');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([
      ['zhinan', 'sheji', 'yizhi'],
      ['zhinan', 'sheji', 'fankui']
    ]);
    await wrapper.setProps({
      modelValue: [
        ['zhinan', 'sheji', 'yizhi'],
        ['zhinan', 'sheji', 'fankui']
      ]
    });
    expect((findNode(wrapper, '设计').find('input').element as HTMLInputElement).checked).toBe(true);
    expect((findNode(wrapper, '指南').find('input').element as HTMLInputElement).indeterminate).toBe(true);
  });

  test('checkStrictly 多选父子勾选解耦', async () => {
    const wrapper = mount(Cascader, {
      props: { options, multiple: true, checkStrictly: true, modelValue: [], teleported: false }
    });
    await open(wrapper);
    await checkNode(wrapper, '指南');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([['zhinan']]);
  });

  test('checkStrictly 单选可选任意层级节点', async () => {
    const wrapper = mount(Cascader, { props: { options, checkStrictly: true, teleported: false } });
    await open(wrapper);
    await clickNode(wrapper, '指南');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['zhinan']);
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(false);
  });

  test('clearable 清空并触发 change(null) / change([])', async () => {
    const single = mount(Cascader, {
      props: { options, modelValue: ['zhinan', 'sheji', 'yizhi'], clearable: true, teleported: false }
    });
    await single.find('.i-cascader__clear').trigger('click');
    expect(single.emitted('update:modelValue')![0][0]).toBeNull();
    expect(single.emitted('change')![0][0]).toBeNull();

    const multiple = mount(Cascader, {
      props: { options, multiple: true, modelValue: [['zhinan', 'kaifa']], clearable: true, teleported: false }
    });
    await multiple.find('.i-cascader__clear').trigger('click');
    expect(multiple.emitted('update:modelValue')![0][0]).toEqual([]);
    expect(multiple.emitted('change')![0][0]).toEqual([]);
  });

  test('多选删除 tag 触发 remove-tag 并更新值', async () => {
    const wrapper = mount(Cascader, {
      props: {
        options,
        multiple: true,
        modelValue: [
          ['zhinan', 'sheji', 'yizhi'],
          ['zhinan', 'sheji', 'fankui']
        ],
        teleported: false
      }
    });
    expect(wrapper.find('.i-cascader__tag').text()).toContain('指南 / 设计 / 一致');
    await wrapper.findAll('.i-cascader__tag')[0].find('button').trigger('click');
    expect(wrapper.emitted('remove-tag')![0][0]).toEqual(['zhinan', 'sheji', 'yizhi']);
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([['zhinan', 'sheji', 'fankui']]);
  });

  test('collapseTags 折叠标签，collapseTagsTooltip 显示原生悬浮提示', async () => {
    const wrapper = mount(Cascader, {
      props: {
        options,
        multiple: true,
        collapseTags: true,
        collapseTagsTooltip: true,
        maxCollapseTags: 1,
        modelValue: [
          ['zhinan', 'sheji', 'yizhi'],
          ['zhinan', 'sheji', 'fankui'],
          ['zhinan', 'kaifa']
        ],
        teleported: false
      }
    });
    expect(wrapper.findAll('.i-cascader__tag')).toHaveLength(1);
    const more = wrapper.find('.i-cascader__more');
    expect(more.text()).toBe('+2');
    expect(more.attributes('title')).toBe('指南 / 设计 / 一致、指南 / 设计 / 反馈、指南 / 开发');
  });

  test('filterable 过滤叶子完整路径并点击选中', async () => {
    // debounce 0 便于断言；默认 300ms 的防抖行为由专项用例覆盖。
    const wrapper = mount(Cascader, { props: { options, filterable: true, debounce: 0, teleported: false } });
    await open(wrapper);
    await wrapper.find('.i-cascader__input').setValue('反馈');
    expect(wrapper.findAll('.i-cascader__suggestion')).toHaveLength(1);
    expect(wrapper.find('.i-cascader__suggestion').text()).toBe('指南 / 设计 / 反馈');
    await wrapper.find('.i-cascader__suggestion').trigger('click');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['zhinan', 'sheji', 'fankui']);
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(false);
  });

  test('filterMethod 自定义过滤，无匹配时展示 empty 插槽', async () => {
    const wrapper = mount(Cascader, {
      props: {
        options,
        filterable: true,
        debounce: 0,
        teleported: false,
        filterMethod: (query: string, option: CascaderOption) => String(option.label ?? '').includes(query)
      },
      slots: { empty: () => '没有匹配项' }
    });
    await open(wrapper);
    await wrapper.find('.i-cascader__input').setValue('开发');
    expect(wrapper.findAll('.i-cascader__suggestion')).toHaveLength(1);
    expect(wrapper.find('.i-cascader__suggestion').text()).toBe('指南 / 开发');

    await wrapper.find('.i-cascader__input').setValue('不存在');
    expect(wrapper.find('.i-cascader__suggestion').exists()).toBe(false);
    expect(wrapper.find('.i-cascader__empty').text()).toBe('没有匹配项');
  });

  test('expand-change 与 visible-change 事件', async () => {
    const wrapper = mount(Cascader, { props: { options, teleported: false } });
    await open(wrapper);
    expect(wrapper.emitted('visible-change')![0][0]).toBe(true);
    await clickNode(wrapper, '指南');
    expect(wrapper.emitted('expand-change')![0][0]).toEqual(['zhinan']);
    await clickNode(wrapper, '设计');
    expect(wrapper.emitted('expand-change')![1][0]).toEqual(['zhinan', 'sheji']);
  });

  test('Esc 关闭面板', async () => {
    const wrapper = mount(Cascader, { props: { options, teleported: false } });
    await open(wrapper);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(false);
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
  });

  test('disabled 时不响应交互', async () => {
    const wrapper = mount(Cascader, { props: { options, disabled: true, teleported: false } });
    await wrapper.find('[role="combobox"]').trigger('click');
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(false);
    expect(wrapper.emitted('visible-change')).toBeUndefined();
  });

  test('popperClass 与默认 teleported 弹层', async () => {
    const wrapper = mount(Cascader, {
      props: { options, popperClass: 'my-cascader', teleported: false },
      attachTo: document.body
    });
    await open(wrapper);
    expect(wrapper.find('.i-cascader__dropdown').classes()).toContain('my-cascader');
    wrapper.unmount();

    const teleported = mount(Cascader, { props: { options }, attachTo: document.body });
    await teleported.find('[role="combobox"]').trigger('click');
    expect(document.body.querySelector('.i-cascader__dropdown')).toBeTruthy();
    teleported.unmount();
  });

  test('暴露 focus / blur / togglePopperVisibility / getCheckedNodes', async () => {
    const wrapper = mount(Cascader, {
      props: {
        options,
        multiple: true,
        modelValue: [
          ['zhinan', 'sheji', 'yizhi'],
          ['zhinan', 'sheji', 'fankui'],
          ['zhinan', 'kaifa']
        ],
        teleported: false
      },
      attachTo: document.body
    });
    const exposed = wrapper.vm as unknown as {
      focus: () => void;
      blur: () => void;
      togglePopperVisibility: (visible?: boolean) => void;
      getCheckedNodes: (leafOnly?: boolean) => CascaderNode[];
    };
    exposed.togglePopperVisibility(true);
    await nextTick();
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(true);
    exposed.togglePopperVisibility(false);
    await nextTick();
    expect(wrapper.find('.i-cascader__dropdown').exists()).toBe(false);

    expect(exposed.getCheckedNodes().map((node) => node.value)).toEqual([
      'zhinan',
      'sheji',
      'yizhi',
      'fankui',
      'kaifa'
    ]);
    expect(exposed.getCheckedNodes(true).map((node) => node.value)).toEqual(['yizhi', 'fankui', 'kaifa']);

    exposed.focus();
    expect(document.activeElement).toBe(wrapper.find('[role="combobox"]').element);
    exposed.blur();
    expect(document.activeElement).not.toBe(wrapper.find('[role="combobox"]').element);
    wrapper.unmount();
  });

  function createForm(rules: FormRule[], cascaderProps: Record<string, unknown> = {}) {
    const formRef = ref<FormInstance>();
    const model = reactive<{ region: CascaderModelValue }>({ region: null });
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Form,
            { ref: formRef, model, rules: { region: rules } },
            {
              default: () =>
                h(
                  FormItem,
                  { prop: 'region', label: '地区' },
                  {
                    default: () =>
                      h(Cascader, {
                        options,
                        teleported: false,
                        modelValue: model.region,
                        'onUpdate:modelValue': (value: CascaderModelValue) => (model.region = value),
                        ...cascaderProps
                      })
                  }
                )
            }
          )
      }),
      { attachTo: document.body }
    );
    return { wrapper, model, form: formRef.value! };
  }

  test('表单集成：选择后触发 change 校验并清除错误', async () => {
    const { wrapper, model, form } = createForm([
      { required: true, type: 'array', message: '请选择地区', trigger: 'change' }
    ]);
    await expect(form.validate()).rejects.toMatchObject({ region: [{ message: '请选择地区', field: 'region' }] });
    await flushPromises();
    expect(wrapper.text()).toContain('请选择地区');
    await open(wrapper);
    await clickNode(wrapper, '指南');
    await clickNode(wrapper, '开发');
    await flushPromises();
    expect(model.region).toEqual(['zhinan', 'kaifa']);
    expect(wrapper.text()).not.toContain('请选择地区');
    wrapper.unmount();
  });

  test('validateEvent=false 时不触发校验', async () => {
    let calls = 0;
    const rules: FormRule[] = [
      {
        trigger: 'change',
        validator: () => {
          calls += 1;
          return Promise.resolve();
        }
      }
    ];
    const skip = createForm(rules, { validateEvent: false });
    await open(skip.wrapper);
    await clickNode(skip.wrapper, '指南');
    await clickNode(skip.wrapper, '开发');
    await flushPromises();
    expect(calls).toBe(0);
    skip.wrapper.unmount();

    const run = createForm(rules);
    await open(run.wrapper);
    await clickNode(run.wrapper, '指南');
    await clickNode(run.wrapper, '开发');
    await flushPromises();
    expect(calls).toBeGreaterThan(0);
    run.wrapper.unmount();
  });

  test('lazy 懒加载子级并支持选中', async () => {
    const lazyLoad = vi.fn((node: { value: string }, resolve: (children: Array<{ value: string; label: string; leaf: boolean }>) => void) => {
      resolve([{ value: `${node.value}-lazy`, label: '懒子级', leaf: true }]);
    });
    const wrapper = mount(Cascader, {
      props: { options: [{ value: 'x', label: '加载' }], lazy: true, lazyLoad, teleported: false }
    });
    await open(wrapper);
    await clickNode(wrapper, '加载');
    expect(lazyLoad).toHaveBeenCalledTimes(1);
    await flushPromises();
    const menus = wrapper.findAll('.i-cascader__menu');
    expect(menus).toHaveLength(2);
    expect(menus[1].text()).toContain('懒子级');
    // 展开箭头加载完成后恢复，且不重复加载。
    await clickNode(wrapper, '加载');
    expect(lazyLoad).toHaveBeenCalledTimes(1);
    await clickNode(wrapper, '懒子级');
    expect(wrapper.emitted('update:modelValue')?.at(-1)![0]).toEqual(['x', 'x-lazy']);
  });

  test('expandTrigger=hover 悬停展开', async () => {
    const wrapper = mount(Cascader, {
      props: { options, expandTrigger: 'hover', teleported: false }
    });
    await open(wrapper);
    const first = wrapper.findAll('.i-cascader__node')[0];
    await first.trigger('mouseenter');
    expect(wrapper.findAll('.i-cascader__menu')).toHaveLength(2);
    expect(wrapper.emitted('expand-change')?.[0]).toEqual([['zhinan']]);
  });

  test('debounce 过滤防抖，仅应用最后一次输入', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const wrapper = mount(Cascader, {
      props: { options, filterable: true, debounce: 200, teleported: false }
    });
    await open(wrapper);
    const input = wrapper.get('.i-cascader__input');
    await input.setValue('反');
    vi.advanceTimersByTime(199);
    expect(wrapper.findAll('.i-cascader__suggestion')).toHaveLength(0);
    vi.advanceTimersByTime(1);
    await flushPromises();
    expect(wrapper.findAll('.i-cascader__suggestion')).toHaveLength(1);
    vi.useRealTimers();
    wrapper.unmount();
  });

  test('beforeFilter 拦截不通过的关键词', async () => {
    const beforeFilter = vi.fn((query: string) => query.length >= 2);
    const wrapper = mount(Cascader, {
      props: { options, filterable: true, debounce: 0, beforeFilter, teleported: false }
    });
    await open(wrapper);
    await wrapper.get('.i-cascader__input').setValue('反');
    // 单字被拦截：不进入过滤态，仍展示菜单。
    expect(wrapper.findAll('.i-cascader__suggestion')).toHaveLength(0);
    expect(wrapper.findAll('.i-cascader__menu')).toHaveLength(1);
    await wrapper.get('.i-cascader__input').setValue('反馈');
    await flushPromises();
    expect(wrapper.findAll('.i-cascader__suggestion')).toHaveLength(1);
    expect(beforeFilter).toHaveBeenCalledTimes(2);
  });
});
