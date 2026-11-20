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
