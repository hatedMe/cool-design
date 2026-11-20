import { mount, DOMWrapper } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import SelectV2 from '..';
import ConfigProvider from '../../config-provider';
import Form from '../../form';
import type { SelectV2Option } from '../types';

// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);

const mountSelect = (props: Record<string, unknown>, initial?: unknown) => {
  const value = ref<unknown>(initial);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(SelectV2, { ...props, modelValue: value.value, 'onUpdate:modelValue': (v: unknown) => (value.value = v) })
    }),
    { attachTo: document.body }
  );
  return { wrapper, value, select: wrapper.findComponent(SelectV2) };
};

const openSelect = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.get('[role="combobox"]').trigger('click');
};

const manyOptions = (count: number): SelectV2Option[] =>
  Array.from({ length: count }, (_, index) => ({ value: index, label: `选项${index}` }));

describe('test `SelectV2` component', () => {
  test('单选对象值与 value-key 识别', async () => {
    const options = [
      { value: { id: 1 }, label: '一' },
      { value: { id: 2 }, label: '二' }
    ];
    const { wrapper, value, select } = mountSelect({ options, valueKey: 'id' }, { id: 1 });
    expect(wrapper.get('[role="combobox"]').text()).toContain('一');
    await openSelect(wrapper);
    await doc().findAll('[role="option"]')[1].trigger('click');
    expect(value.value).toEqual({ id: 2 });
    expect(select.emitted('change')).toHaveLength(1);
  });

  test('分组 options 渲染组头', async () => {
    const { wrapper } = mountSelect({
      options: [
        { label: '组一', options: [{ value: 'a', label: 'A' }] },
        { label: '组二', options: [{ value: 'b', label: 'B' }] }
      ]
    });
    await openSelect(wrapper);
    expect(doc().findAll('.i-select-v2__group').map((item) => item.text())).toEqual(['组一', '组二']);
  });

  test('filterable 过滤保留有命中子项的分组头', async () => {
    const { wrapper } = mountSelect({
      filterable: true,
      options: [
        { label: '热门城市', options: [{ value: 'sh', label: '上海' }, { value: 'su', label: '苏州' }] },
        { label: '其他城市', options: [{ value: 'gz', label: '广州' }, { value: 'hz', label: '杭州' }] }
      ]
    });
    await openSelect(wrapper);
    const input = wrapper.get('input[aria-label="筛选选项"]');
    await input.setValue('广州');
    expect(doc().findAll('.i-select-v2__group').map((item) => item.text())).toEqual(['其他城市']);
    expect(doc().findAll('[role="option"]')).toHaveLength(1);
    await input.setValue('州');
    expect(doc().findAll('.i-select-v2__group').map((item) => item.text())).toEqual(['热门城市', '其他城市']);
    expect(doc().findAll('[role="option"]')).toHaveLength(3);
    await input.setValue('不存在');
    expect(doc().findAll('.i-select-v2__group')).toHaveLength(0);
    expect(doc().text()).toContain('无匹配数据');
  });

  test('多选标签、折叠与删除', async () => {
    const { wrapper, value, select } = mountSelect(
      {
        options: manyOptions(3),
        multiple: true,
        collapseTags: true,
        maxCollapseTags: 1
      },
      [0, 1, 2]
    );
    expect(wrapper.findAll('.i-select-v2__tag')).toHaveLength(1);
    expect(wrapper.text()).toContain('+2');
    await wrapper.find('.i-select-v2__tag button').trigger('click');
    expect(select.emitted('remove-tag')).toEqual([[0]]);
    expect(value.value).toEqual([1, 2]);
  });

  test('filterable 过滤与无匹配文案', async () => {
    const { wrapper } = mountSelect({ options: manyOptions(5), filterable: true });
    await openSelect(wrapper);
    await wrapper.get('.i-select-v2__input').setValue('选项3');
    expect(doc().findAll('[role="option"]')).toHaveLength(1);
    await wrapper.get('.i-select-v2__input').setValue('zzz');
    expect(doc().find('.i-select-v2__empty').text()).toBe('无匹配数据');
  });

  test('虚拟滚动只渲染窗口行', async () => {
    const { wrapper } = mountSelect({ options: manyOptions(500), height: 340, itemHeight: 34, filterable: true });
    await openSelect(wrapper);
    const rendered = doc().findAll('[role="option"]');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(30);
    expect(doc().find('.i-select-v2__list').attributes('style')).toContain('17000px');
  });

  test('clearable 清空与键盘导航选中', async () => {
    const { wrapper, value, select } = mountSelect({ options: manyOptions(3), clearable: true, filterable: true }, 1);
    await wrapper.find('button[aria-label="清空"]').trigger('click');
    expect(value.value).toBeUndefined();
    expect(select.emitted('clear')).toHaveLength(1);

    await openSelect(wrapper);
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'Enter' });
    expect(value.value).toBe(1);
  });

  test('单选读取 Provider 空值和清空工厂，多选保持数组', async () => {
    const factory = vi.fn(() => undefined);
    const wrapper = mount(ConfigProvider, {
      props: { emptyValues: ['none'], valueOnClear: 0 },
      slots: { default: () => [
        h(SelectV2, { modelValue: 'none', clearable: true }),
        h(SelectV2, { modelValue: 1, clearable: true }),
        h(SelectV2, { modelValue: false, clearable: true, valueOnClear: factory }),
        h(SelectV2, { modelValue: [1], multiple: true, clearable: true, valueOnClear: factory })
      ] }
    });
    const [empty, inherited, local, multiple] = wrapper.findAllComponents(SelectV2);
    const clear = 'button[aria-label="清空"]';
    expect(empty.find(clear).exists()).toBe(false);
    expect(factory).not.toHaveBeenCalled();
    await inherited.get(clear).trigger('click');
    await local.get(clear).trigger('click');
    await multiple.get(clear).trigger('click');
    expect(inherited.emitted('update:modelValue')).toEqual([[0]]);
    expect(inherited.emitted('change')).toEqual([[0]]);
    expect(local.emitted('update:modelValue')).toEqual([[undefined]]);
    expect(local.emitted('change')).toEqual([[undefined]]);
    expect(local.emitted('clear')).toEqual([[]]);
    expect(multiple.emitted('update:modelValue')).toEqual([[[]]]);
    expect(factory).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  test('下拉默认传送到 body，属性族透传到面板', async () => {
    const { wrapper } = mountSelect({
      options: manyOptions(3),
      popperClass: 'custom-popper',
      placement: 'bottom-start'
    });
    await openSelect(wrapper);
    expect(wrapper.find('.i-select-v2__dropdown').exists()).toBe(false);
    const panel = doc().get('.i-select-v2__dropdown');
    expect(panel.classes()).toContain('custom-popper');
    expect(panel.classes()).toContain('i-select-v2__dropdown--light');
    expect(panel.attributes('data-placement')).toBe('bottom-start');

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(doc().find('.i-select-v2__dropdown').exists()).toBe(false);
  });

  test('name 渲染隐藏输入，多选时序列化为数组', async () => {
    const single = mountSelect({ options: manyOptions(3), name: 'single' }, 1);
    const hidden = single.wrapper.find('input[type="hidden"]');
    expect(hidden.attributes('name')).toBe('single');
    expect((hidden.element as HTMLInputElement).value).toBe('1');
    expect(hidden.attributes('value')).toBe('1');

    const multi = mountSelect({ options: manyOptions(3), name: 'multi', multiple: true }, [0, 2]);
    const multiHidden = multi.wrapper.find('input[type="hidden"]');
    expect((multiHidden.element as HTMLInputElement).value).toBe('[0,2]');
  });

  test('打开时高亮选中项，键盘导航滚动跟随', async () => {
    const { wrapper } = mountSelect({ options: manyOptions(50), height: 100, itemHeight: 20 }, 30);
    await openSelect(wrapper);
    expect(doc().get('.i-select-v2__option.is-highlighted').text()).toBe('选项30');
    // 高亮项超出可视窗口时滚动跟随
    const dropdown = doc().get('.i-select-v2__dropdown');
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    expect((dropdown.element as HTMLElement).scrollTop).toBeGreaterThan(0);
  });
});

test('SelectV2 直挂 Form 时继承尺寸并在禁用后关闭下拉', async () => {
  const wrapper = mount(Form, {
    props: { model: {}, size: 'large' },
    slots: { default: () => h(SelectV2, { options: manyOptions(3), teleported: false, persistent: true }) }
  });
  const select = wrapper.getComponent(SelectV2);
  await select.get('[role="combobox"]').trigger('click');
  await wrapper.setProps({ disabled: true });
  expect(select.emitted('visible-change')).toEqual([[true], [false]]);
  expect(select.classes()).toContain('i-control--large');
  expect(select.get('input.i-select-v2__input').attributes('disabled')).toBeDefined();
  expect(select.get('[role="combobox"]').attributes('aria-disabled')).toBe('true');
  wrapper.unmount();
});

test('SelectV2 远程查询防抖，过时的返回选项不会覆盖新查询', async () => {
  vi.useFakeTimers();
  const callbacks = new Map<string, (items: SelectV2Option[]) => void>();
  const remoteMethod = vi.fn((query: string) => new Promise<SelectV2Option[]>((resolve) => {
    callbacks.set(query, resolve);
  }));
  const { wrapper } = mountSelect({ filterable: true, remote: true, remoteMethod, debounce: 20, teleported: false });
  try {
    await openSelect(wrapper);
    const input = wrapper.get('input.i-select-v2__input');
    await input.setValue('旧');
    await vi.advanceTimersByTimeAsync(20);
    await input.setValue('新');
    await vi.advanceTimersByTimeAsync(20);
    expect(remoteMethod.mock.calls).toEqual([['旧'], ['新']]);
    callbacks.get('新')?.([{ label: '最新结果', value: 2 }]);
    await vi.advanceTimersByTimeAsync(0);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('最新结果');
    callbacks.get('旧')?.([{ label: '过时结果', value: 1 }]);
    await vi.advanceTimersByTimeAsync(0);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('过时结果');
  } finally {
    wrapper.unmount();
    vi.useRealTimers();
  }
});

test('SelectV2 创建首项并保留多选标签', async () => {
  const { wrapper, value } = mountSelect({ multiple: true, filterable: true, allowCreate: true,
    defaultFirstOption: true, teleported: false }, []);
  await openSelect(wrapper);
  const input = wrapper.get('input.i-select-v2__input');
  await input.setValue('新选项');
  await input.trigger('keydown', { key: 'Enter' });
  expect(value.value).toEqual(['新选项']);
  expect(wrapper.text()).toContain('新选项');
  expect(input.element.value).toBe('');
  wrapper.unmount();
});

test('SelectV2 查询回调和逐选项过滤保持独立', async () => {
  const query = vi.fn<(value: string) => void>();
  const { wrapper } = mountSelect({ filterable: true, filterMethod: query,
    options: [{ label: '外部结果', value: true }], teleported: false });
  await openSelect(wrapper);
  await wrapper.get('input.i-select-v2__input').setValue('查询');
  expect(query.mock.calls).toEqual([['查询']]);
  expect(wrapper.text()).toContain('外部结果');
  wrapper.unmount();

  const filter = vi.fn((value: string, option: SelectV2Option) => option.label === value);
  const local = mountSelect({ filterable: true, optionFilterMethod: filter,
    options: [{ label: '匹配', value: true }, { label: '其他', value: false }], teleported: false });
  await openSelect(local.wrapper);
  await local.wrapper.get('input.i-select-v2__input').setValue('匹配');
  expect(local.wrapper.text()).toContain('匹配');
  expect(local.wrapper.text()).not.toContain('其他');
  local.wrapper.unmount();
});

test('SelectV2 组合输入结束前不查询或选择', async () => {
  const remoteMethod = vi.fn();
  const { wrapper, value } = mountSelect({ filterable: true, remote: true, remoteMethod, debounce: 0,
    defaultFirstOption: true, options: [{ label: '候选', value: 'a' }], teleported: false });
  await openSelect(wrapper);
  const input = wrapper.get('input.i-select-v2__input');
  await input.trigger('compositionstart');
  await input.setValue('拼');
  await input.trigger('keydown', { key: 'Enter', isComposing: true });
  expect(remoteMethod).not.toHaveBeenCalled();
  expect(value.value).toBeUndefined();
  await input.trigger('compositionend');
  expect(remoteMethod.mock.calls).toEqual([['拼']]);
  input.element.dispatchEvent(new Event('input', { bubbles: true }));
  expect(remoteMethod.mock.calls).toEqual([['拼']]);
  wrapper.unmount();
});

test('SelectV2 可重新创建刚移除的选项', async () => {
  const { wrapper, value } = mountSelect({ multiple: true, filterable: true, allowCreate: true,
    defaultFirstOption: true, teleported: false }, []);
  await openSelect(wrapper);
  const input = wrapper.get('input.i-select-v2__input');
  await input.setValue('重复创建');
  await input.trigger('keydown', { key: 'Enter' });
  await wrapper.get('[aria-label="移除 重复创建"]').trigger('click');
  expect(value.value).toEqual([]);
  await input.setValue('重复创建');
  await input.trigger('keydown', { key: 'Enter' });
  expect(value.value).toEqual(['重复创建']);
  wrapper.unmount();
});

test('SelectV2 外部远程结果更新后重新高亮并缓存已选标签', async () => {
  const options = ref<SelectV2Option[]>([]);
  const value = ref<unknown[]>([]);
  const wrapper = mount(defineComponent({
    setup: () => () => h(SelectV2, { options: options.value, remote: true, filterable: true, multiple: true,
      defaultFirstOption: true, teleported: false, modelValue: value.value, 'onUpdate:modelValue': (next: unknown[]) => { value.value = next; } })
  }));
  await openSelect(wrapper);
  const input = wrapper.get('input.i-select-v2__input');
  await input.setValue('查询');
  options.value = [{ label: '外部结果', value: 7 }];
  await wrapper.vm.$nextTick();
  await input.trigger('keydown', { key: 'Enter' });
  expect(value.value).toEqual([7]);
  options.value = [];
  await wrapper.vm.$nextTick();
  expect(wrapper.find('[aria-label="移除 外部结果"]').exists()).toBe(true);
  wrapper.unmount();
});
