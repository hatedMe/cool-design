import { Fragment, h, ref } from 'vue';
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { beforeEach, expect, test, vi } from 'vitest';
import Select from '..';
import SelectOption from '../../select-option';
import ConfigProvider, { en, zhCn } from '../../config-provider';

beforeEach(() => { document.body.innerHTML = ''; });
const doc = () => new DOMWrapper(document.body);

test.each([
  [false, '清空', 'Enter'],
  [false, '清空', ' '],
  [true, '移除 二十', 'Enter'],
  [true, '移除 二十', ' ']
])('原生按钮保留键盘默认动作（multiple=%s，%s，%s）', (multiple, label, key) => {
  const wrapper = mount(Select, {
    props: { multiple, clearable: !multiple, modelValue: multiple ? [20] : 20, options: [{ value: 20, label: '二十' }] }
  });
  const button = wrapper.get(`button[aria-label="${label}"]`);
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  expect(button.element.dispatchEvent(event)).toBe(true);
  expect(wrapper.emitted('visible-change')).toBeUndefined();
  wrapper.unmount();
});

test('原版远程回调返回 void 时使用外部响应式插槽选项', async () => {
  const options = ref<string[]>([]);
  const wrapper = mount(Select, {
    props: { remote: true, filterable: true, debounce: 0, remoteMethod: (query: string) => { options.value = [query]; } },
    slots: { default: () => h(Fragment, options.value.map((value) => h(SelectOption, { value, label: `结果${value}` }))) }
  });
  await wrapper.get('input').setValue('hello');
  await flushPromises();
  expect(doc().get('[role="option"]').text()).toBe('结果hello');
  await doc().get('[role="option"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['hello']);
  wrapper.unmount();
});

test('options 支持自定义字段与分组，保留布尔值类型', async () => {
  const wrapper = mount(Select, {
    props: {
      options: [{ title: '分组', items: [{ key: false, title: '否' }, { key: true, title: '是', blocked: true }] }],
      props: { value: 'key', label: 'title', disabled: 'blocked', options: 'items' }
    }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().get('.i-select__group').text()).toBe('分组');
  expect(doc().get('[data-value="true"]').attributes('aria-disabled')).toBe('true');
  await doc().get('[data-value="false"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  wrapper.unmount();
});

test('persistent 默认保留关闭的面板，false 时销毁', async () => {
  const wrapper = mount(Select);
  const trigger = wrapper.get('[role="combobox"]');
  await trigger.trigger('click');
  await trigger.trigger('keydown', { key: 'Escape' });
  expect(doc().get('[role="listbox"]').attributes('aria-hidden')).toBe('true');
  await wrapper.setProps({ persistent: false });
  expect(doc().find('[role="listbox"]').exists()).toBe(false);
  wrapper.unmount();
});

test('append-to 将面板传送到指定宿主', async () => {
  const host = document.createElement('div');
  host.id = 'select-host';
  document.body.append(host);
  const wrapper = mount(Select, { props: { appendTo: '#select-host' } });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(host.querySelector('[role="listbox"]')).not.toBeNull();
  wrapper.unmount();
});

test('布尔值选项支持回显及原生表单变更', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: false },
    slots: { default: () => [h(SelectOption, { value: false, label: '否' }), h(SelectOption, { value: true, label: '是' })] }
  });
  expect(wrapper.get('[role="combobox"]').text()).toBe('否');
  await wrapper.get('select').setValue('true');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);
  wrapper.unmount();
});

test('继承全局空值、清空函数和动态语言配置', async () => {
  const valueOnClear = vi.fn(() => null);
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    props: { locale: en, emptyValues: ['', null], valueOnClear },
    slots: { default: () => h(Select, { modelValue: 'a', clearable: true, options: [] }) }
  });
  const select = wrapper.findComponent(Select);
  await select.get('[role="combobox"]').trigger('click');
  expect(doc().get('.i-select__empty').text()).toBe('No data');
  await wrapper.setProps({ locale: zhCn });
  expect(doc().get('.i-select__empty').text()).toBe('暂无数据');
  await select.get('button[aria-label="清空"]').trigger('click');
  expect(select.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  expect(valueOnClear).toHaveBeenCalledTimes(1);
  wrapper.unmount();
});

test('未提供布尔模型时保持未选择状态', () => {
  const wrapper = mount(Select, { props: { clearable: true } });
  expect(wrapper.find('button[aria-label="清空"]').exists()).toBe(false);
  wrapper.unmount();
});

test('原生表单不会混淆布尔值与同名字符串', async () => {
  const wrapper = mount(Select, {
    props: { options: [{ value: true, label: '布尔值' }, { value: 'true', label: '字符串' }] }
  });
  const values = wrapper.findAll('option').map((option) => option.attributes('value'));
  expect(new Set(values).size).toBe(2);
  await wrapper.get('select').setValue(values[0]);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);
  await wrapper.get('select').setValue(values[1]);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['true']);
  wrapper.unmount();
});

test('数字 label 在筛选时按文本处理', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: { default: () => h(SelectOption, { value: 'a', label: 123 }) }
  });
  await wrapper.get('input').setValue('12');
  expect(doc().get('[role="option"]').text()).toBe('123');
  wrapper.unmount();
});
