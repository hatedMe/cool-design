import { h } from 'vue';
import { DOMWrapper, mount } from '@vue/test-utils';
import { expect, test, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import Select from '../index';
import SelectOption from '../../select-option';

// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);

test('SelectOption 默认插槽文本显示为选项内容', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: { default: () => [h(SelectOption, { value: 'a' }, { default: () => '苹果' })] }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().get('[role="option"][data-value="a"]').text()).toBe('苹果');
});

test('SelectOption 默认插槽支持嵌套元素文本', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: { default: () => [h(SelectOption, { value: 'a' }, { default: () => h('span', ['苹果']) })] }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().get('[role="option"][data-value="a"]').text()).toBe('苹果');
});

test('Select 自定义面板显示选中标签并支持单选点击', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: 'a' },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' }), h(SelectOption, { value: 'b', label: '二' })] }
  });
  expect(wrapper.get('[role="combobox"]').text()).toContain('一');
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().find('[role="listbox"]').exists()).toBe(true);
  await doc().get('[role="option"][data-value="b"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
  expect(doc().find('[role="listbox"]').exists()).toBe(false);
});

test('Select 多选显示标签且禁用选项不可点击', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['a'], multiple: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' }), h(SelectOption, { value: 'b', label: '二', disabled: true })] }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  await doc().get('[role="option"][data-value="b"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  expect(wrapper.get('[role="combobox"]').text()).toContain('一');
});

test('Select 点击外部关闭自定义面板', async () => {
  const wrapper = mount(Select, {
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().find('[role="listbox"]').exists()).toBe(true);
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  await wrapper.vm.$nextTick();
  expect(doc().find('[role="listbox"]').exists()).toBe(false);
});

test('Select 下拉默认传送到 body 并支持弹层属性族', async () => {
  const wrapper = mount(Select, {
    props: {
      popperClass: 'custom-popper',
      popperStyle: { width: '260px' },
      placement: 'bottom-start',
      teleported: false
    },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  // teleported=false 时面板保留在组件内部
  const inlineDropdown = wrapper.get('.i-select__dropdown');
  expect(inlineDropdown.classes()).toContain('custom-popper');
  expect(inlineDropdown.attributes('style')).toContain('width: 260px');
  wrapper.unmount();

  const teleported = mount(Select, {
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  await teleported.get('[role="combobox"]').trigger('click');
  expect(teleported.find('.i-select__dropdown').exists()).toBe(false);
  expect(doc().get('.i-select__dropdown').attributes('data-placement')).toBe('bottom-start');
});

test('Select 打开时优先高亮选中项并跟随键盘滚动', async () => {
  const options = Array.from({ length: 6 }, (_, index) => h(SelectOption, { value: index, label: `选项${index}` }));
  const wrapper = mount(Select, {
    props: { modelValue: 4 },
    slots: { default: () => options }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().get('.i-select__option.is-highlighted').attributes('data-value')).toBe('4');
  expect(wrapper.get('[role="combobox"]').attributes('aria-activedescendant')).toBe('i-select-option-4');
  wrapper.unmount();

  const unselected = mount(Select, {
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一', disabled: true }), h(SelectOption, { value: 'b', label: '二' })] }
  });
  await unselected.get('[role="combobox"]').trigger('click');
  // 无选中时高亮首个可用项，跳过禁用项
  expect(doc().get('.i-select__option.is-highlighted').attributes('data-value')).toBe('b');
});

test('Select 多选标签支持删除和 collapse-tags', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['a', 'b'], multiple: true, collapseTags: true, maxCollapseTags: 1 },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' }), h(SelectOption, { value: 'b', label: '二' })] }
  });
  expect(wrapper.get('.i-select__tag').text()).toContain('一');
  expect(wrapper.get('.i-select__more').text()).toBe('+1');
  await wrapper.get('button[aria-label="移除 一"]').trigger('click');
  expect(wrapper.emitted('remove-tag')?.at(-1)).toEqual(['a']);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']]);
});

test('Select 键盘方向键、Enter 和 Escape 控制面板', async () => {
  const wrapper = mount(Select, {
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' }), h(SelectOption, { value: 'b', label: '二' })] }
  });
  const trigger = wrapper.get('[role="combobox"]');
  await trigger.trigger('keydown', { key: 'ArrowDown' });
  expect(doc().find('[role="listbox"]').exists()).toBe(true);
  await trigger.trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a']);
  await trigger.trigger('keydown', { key: 'Escape' });
  expect(doc().find('[role="listbox"]').exists()).toBe(false);
});

test('Select 多选空查询时 Backspace 删除最后标签', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['a'], multiple: true, filterable: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'Backspace' });
  expect(wrapper.emitted('remove-tag')?.at(-1)).toEqual(['a']);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
});

test('Select 支持 prefix/suffix/empty 插槽和 ARIA 状态', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true, name: 'status' },
    slots: {
      prefix: () => h('span', { class: 'prefix' }, '前缀'),
      suffix: () => h('span', { class: 'suffix' }, '后缀'),
      empty: () => h('span', { class: 'custom-empty' }, '自定义空状态')
    }
  });
  expect(wrapper.find('.prefix').exists()).toBe(true);
  expect(wrapper.find('.suffix').exists()).toBe(true);
  expect(wrapper.find('select.i-select__native').attributes('name')).toBe('status');
  const trigger = wrapper.get('[role="combobox"]');
  expect(trigger.attributes('aria-expanded')).toBe('false');
  await trigger.trigger('click');
  expect(trigger.attributes('aria-expanded')).toBe('true');
});

test('Select 非筛选模式 focus 和 blur 方法作用于触发器', async () => {
  const wrapper = mount(Select);
  const exposed = wrapper.vm as unknown as { focus: () => void; blur: () => void };
  const trigger = wrapper.get('[role="combobox"]');
  const focus = vi.spyOn(trigger.element as HTMLElement, 'focus');
  const blur = vi.spyOn(trigger.element as HTMLElement, 'blur');
  exposed.focus();
  exposed.blur();
  expect(focus).toHaveBeenCalled();
  expect(blur).toHaveBeenCalled();
});

test('Select 多选删除严格区分数字和字符串', async () => {
  const wrapper = mount(Select, { props: { modelValue: [1, '1'], multiple: true }, slots: { default: () => [h(SelectOption, { value: 1, label: '数字' }), h(SelectOption, { value: '1', label: '字符串' })] } });
  await wrapper.get('button[aria-label="移除 数字"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['1']]);
});

test('Select virtualized 面板滚动后显示后续选项', async () => {
  const options = Array.from({ length: 20 }, (_, index) => h(SelectOption, { value: index, label: `选项${index}` }));
  const wrapper = mount(Select, { props: { virtualized: true, height: 40, itemHeight: 20 }, slots: { default: () => options } });
  await wrapper.get('[role="combobox"]').trigger('click');
  const dropdown = doc().get('.i-select__dropdown');
  Object.defineProperty(dropdown.element, 'scrollTop', { value: 200, configurable: true });
  await dropdown.trigger('scroll');
  expect(doc().find('[data-value="10"]').exists()).toBe(true);
});

test('Select reserve-keyword 默认保留多选查询词', async () => {
  const wrapper = mount(Select, { props: { filterable: true, multiple: true }, slots: { default: () => [h(SelectOption, { value: 'a', label: '苹果' })] } });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('苹果');
  await doc().get('[role="option"][data-value="a"]').trigger('click');
  expect((input.element as HTMLInputElement).value).toBe('苹果');
});

test('Select 支持多选数组值和禁用项', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: [1], multiple: true },
    slots: {
      default: () => [h(SelectOption, { value: 1, label: '一' }), h(SelectOption, { value: 2, label: '二' })]
    }
  });
  expect(wrapper.find('select').attributes('multiple')).toBeDefined();
  await wrapper.find('select').setValue(['1', '2']);
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[1, 2]]);
});

test('Select filterable 按选项标签筛选并显示无匹配提示', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: {
      default: () => [h(SelectOption, { value: 'a', label: '苹果' }), h(SelectOption, { value: 'b', label: '香蕉' })]
    }
  });
  await wrapper.get('input[aria-label="筛选选项"]').setValue('苹果');
  expect(wrapper.findAll('option')).toHaveLength(2);
  await wrapper.get('input[aria-label="筛选选项"]').setValue('不存在');
  expect(doc().text()).toContain('无匹配数据');
});

test('Select 自定义面板支持本地筛选和空状态', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '苹果' })] }
  });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('不存在');
  expect(doc().text()).toContain('无匹配数据');
});

test('Select 自定义面板支持远程 loading 和乱序保护', async () => {
  let resolveFirst!: (value: { value: string; label: string }[]) => void;
  let resolveSecond!: (value: { value: string; label: string }[]) => void;
  const remoteMethod = vi.fn((query: string) => query === 'a'
    ? new Promise<{ value: string; label: string }[]>((resolve) => (resolveFirst = resolve))
    : new Promise<{ value: string; label: string }[]>((resolve) => (resolveSecond = resolve)));
  const wrapper = mount(Select, { props: { remote: true, filterable: true, remoteMethod } });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('a');
  await input.setValue('ab');
  resolveSecond([{ value: 'new', label: '新结果' }]);
  await flushPromises();
  resolveFirst([{ value: 'old', label: '旧结果' }]);
  await flushPromises();
  expect(doc().get('[role="option"]').attributes('data-value')).toBe('new');
  expect(doc().find('[data-value="old"]').exists()).toBe(false);
});

test('Select allow-create 遵守 multiple-limit', async () => {
  const wrapper = mount(Select, {
    props: { multiple: true, multipleLimit: 1, filterable: true, allowCreate: true, modelValue: ['a'] },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('新选项');
  await input.trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('Select 远程刷新后保留已选项标签', async () => {
  const remoteMethod = vi.fn().mockResolvedValue([{ value: 1, label: '一' }]);
  const wrapper = mount(Select, { props: { remote: true, filterable: true, modelValue: 1, remoteMethod } });
  await wrapper.get('input[aria-label="筛选选项"]').setValue('新查询');
  await flushPromises();
  expect(wrapper.text()).toContain('一');
});

test('Select 区分数字值 1 和字符串值 1', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: 1 },
    slots: { default: () => [h(SelectOption, { value: 1, label: '数字' }), h(SelectOption, { value: '1', label: '字符串' })] }
  });
  expect(wrapper.get('[role="combobox"]').text()).toContain('数字');
  await wrapper.get('[role="combobox"]').trigger('click');
  await doc().get('[role="option"][data-value="1"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1]);
});

test('Select 自定义面板支持 allow-create 和 default-first-option', async () => {
  const wrapper = mount(Select, { props: { filterable: true, allowCreate: true, defaultFirstOption: true }, slots: { default: () => [h(SelectOption, { value: 'a', label: '苹果' })] } });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('苹果');
  await input.trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a']);
  await input.setValue('新选项');
  await input.trigger('keydown', { key: 'Enter' });
  expect(doc().find('[data-value="新选项"]').exists()).toBe(true);
});

test('Select 支持远程选项和数字值', async () => {
  const remoteMethod = vi.fn().mockResolvedValue([
    { value: 1, label: '远程一' },
    { value: 2, label: '远程二' }
  ]);
  const wrapper = mount(Select, { props: { remote: true, filterable: true, remoteMethod } });
  await wrapper.get('input[aria-label="筛选选项"]').setValue('远程');
  await flushPromises();
  expect(remoteMethod).toHaveBeenCalledWith('远程');
  await wrapper.get('select').setValue('1');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1]);
});

test('Select 多选清空后使用空数组并触发 clear', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['a'], multiple: true, clearable: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
  expect(wrapper.emitted('change')?.at(-1)).toEqual([[]]);
  expect(wrapper.emitted('clear')).toHaveLength(1);
});

test('Select 支持 filter-method 和 multiple-limit', async () => {
  const filterMethod = vi.fn((query: string, option: { label: string }) => option.label === query);
  const wrapper = mount(Select, {
    props: { modelValue: ['a'], filterable: true, multiple: true, multipleLimit: 1, filterMethod },
    slots: {
      default: () => [h(SelectOption, { value: 'a', label: '苹果' }), h(SelectOption, { value: 'b', label: '香蕉' })]
    }
  });
  await wrapper.get('input[aria-label="筛选选项"]').setValue('苹果');
  expect(wrapper.findAll('option')).toHaveLength(2);
  await wrapper.get('select').setValue(['a', 'b']);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']]);
  await wrapper.get('select').setValue([]);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
  expect(filterMethod).toHaveBeenCalled();
});

test('Select default-first-option 多选时保留 reserve-keyword 查询词', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true, multiple: true, defaultFirstOption: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '苹果' })] }
  });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('苹果');
  await input.trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']]);
  expect((input.element as HTMLInputElement).value).toBe('苹果');
});

test('Select default-first-option 按 Enter 选择第一个匹配项并清理查询词', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true, defaultFirstOption: true, reserveKeyword: false },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '苹果' })] }
  });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('苹果');
  await input.trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a']);
  expect((input.element as HTMLInputElement).value).toBe('');
});

test('Select reserve-keyword 单选始终清理查询词，多选可显式清理', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true, reserveKeyword: false },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '苹果' })] }
  });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('苹果');
  await wrapper.get('select').setValue('a');
  expect((input.element as HTMLInputElement).value).toBe('');

  await wrapper.setProps({ reserveKeyword: true, multiple: true, modelValue: [] });
  await input.setValue('苹果');
  await doc().get('[role="option"][data-value="a"]').trigger('click');
  expect((input.element as HTMLInputElement).value).toBe('苹果');
});

test('Select focus 事件携带 FocusEvent', async () => {
  const wrapper = mount(Select);
  await wrapper.get('select').trigger('focus');
  expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent);
});

test('Select 远程 allow-create 创建的选项可见', async () => {
  const wrapper = mount(Select, {
    props: { remote: true, filterable: true, allowCreate: true, remoteMethod: () => [] }
  });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('新选项');
  await input.trigger('keydown', { key: 'Enter' });
  expect(wrapper.find('option[value="新选项"]').exists()).toBe(true);
});

test('Select 远程搜索只采用最后一次请求结果', async () => {
  let resolveFirst!: (value: { value: string; label: string }[]) => void;
  let resolveSecond!: (value: { value: string; label: string }[]) => void;
  const remoteMethod = vi.fn((query: string) =>
    query === 'a'
      ? new Promise<{ value: string; label: string }[]>((resolve) => (resolveFirst = resolve))
      : new Promise<{ value: string; label: string }[]>((resolve) => (resolveSecond = resolve))
  );
  const wrapper = mount(Select, { props: { remote: true, filterable: true, remoteMethod } });
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('a');
  await input.setValue('ab');
  resolveSecond([{ value: 'new', label: '新结果' }]);
  await flushPromises();
  resolveFirst([{ value: 'old', label: '旧结果' }]);
  await flushPromises();
  expect(wrapper.find('option[value="new"]').exists()).toBe(true);
  expect(wrapper.find('option[value="old"]').exists()).toBe(false);
});

test('Select 支持 focus、blur 和 loading API', async () => {
  const wrapper = mount(Select, { props: { loading: true } });
  const select = wrapper.get('select');
  await select.trigger('focus');
  await select.trigger('blur');
  expect(wrapper.emitted('focus')).toHaveLength(1);
  expect(wrapper.emitted('blur')).toHaveLength(1);
  expect(wrapper.text()).toContain('加载中');
  expect(wrapper.get('.i-select__loading').text()).toContain('加载中');
});
