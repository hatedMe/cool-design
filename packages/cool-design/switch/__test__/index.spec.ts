import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import Switch from '../index';
import { fieldKey } from '../../form/context';
import { configKey } from '../../config-provider/context';
import { computed } from 'vue';

test('Switch 支持自定义值、文字和尺寸', async () => {
  const wrapper = mount(Switch, {
    props: { modelValue: 'on', activeValue: 'on', inactiveValue: 'off', activeText: '开启', size: 'large' }
  });
  expect(wrapper.text()).toContain('开启');
  expect(wrapper.classes()).toContain('i-switch--large');
  await wrapper.find('input').setValue(false);
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['off']);
});

test('beforeChange 拒绝时不修改模型', async () => {
  const wrapper = mount(Switch, { props: { modelValue: false, beforeChange: () => false } });
  await wrapper.find('input').setValue(true);
  expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(0);
});

test('支持宽度、加载态和 inlinePrompt 文本', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true, width: 48, loading: true, inlinePrompt: true, activeText: '开启' }
  });
  expect(wrapper.attributes('style')).toContain('width: 48px');
  expect(wrapper.find('.i-switch__loading').exists()).toBe(true);
  expect(wrapper.find('.i-switch__track').text()).toBe('开');
});

test('validateEvent 为 false 时不触发表单校验', async () => {
  const validate = vi.fn();
  const wrapper = mount(Switch, { props: { validateEvent: false }, global: { provide: { [fieldKey as symbol]: { id: 'field', validate } } } });
  await wrapper.find('input').setValue(true);
  expect(validate).not.toHaveBeenCalled();
});

test('暴露 focus 方法并支持 active 与 inactive 插槽', async () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true },
    slots: { active: '开', inactive: '关' },
    attachTo: document.body
  });
  (wrapper.vm as { focus: () => void }).focus();
  expect(document.activeElement).toBe(wrapper.find('input').element);
  expect(wrapper.text()).toContain('开');
  await wrapper.setProps({ modelValue: false });
  expect(wrapper.text()).toContain('关');
});

test('支持状态图标、动作图标和兼容 label 属性', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true, activeIcon: 'check', activeActionIcon: 'star', label: '启用状态' }
  });
  expect(wrapper.find('.i-switch__icon.check').exists()).toBe(true);
  expect(wrapper.find('.i-switch__action-icon.star').exists()).toBe(true);
  expect(wrapper.find('input').attributes('aria-label')).toBe('启用状态');
});

test('关闭状态使用 inactive 图标并优先于 inactiveText', async () => {
  const wrapper = mount(Switch, {
    props: { modelValue: false, inactiveIcon: 'close', inactiveText: '关闭' }
  });
  expect(wrapper.find('.i-switch__icon.close').exists()).toBe(true);
  expect(wrapper.text()).not.toContain('关闭');
});

test('支持 borderColor 自定义边框颜色', () => {
  const wrapper = mount(Switch, { props: { borderColor: '#999' } });
  expect(wrapper.attributes('style')).toContain('--i-switch-border: #999');
});

test('将组件属性和原生输入属性分别透传到正确节点', () => {
  const wrapper = mount(Switch, {
    attrs: {
      class: 'custom-switch',
      style: 'margin: 4px',
      id: 'switch-id',
      name: 'switch-name',
      tabindex: '-1',
      'aria-label': '自定义标签'
    },
    props: { label: '兼容标签' }
  });
  const input = wrapper.find('input');
  expect(wrapper.classes()).toContain('custom-switch');
  expect(wrapper.attributes('style')).toContain('margin: 4px');
  expect(input.attributes()).toMatchObject({ id: 'switch-id', name: 'switch-name', tabindex: '-1', 'aria-label': '自定义标签' });
  expect(wrapper.find('label').attributes('id')).toBeUndefined();
});

test('action 插槽渲染在独立动作节点并优先于动作图标', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true, activeActionIcon: 'icon-like' },
    slots: { 'active-action': '动作' }
  });
  expect(wrapper.find('.i-switch__action').exists()).toBe(true);
  expect(wrapper.find('.i-switch__action').text()).toBe('动作');
  expect(wrapper.find('.i-switch__action-icon').exists()).toBe(false);
});

test('inlinePrompt 文本只显示首字符，图标保持完整', async () => {
  const textWrapper = mount(Switch, { props: { modelValue: true, inlinePrompt: true, activeText: '开启' } });
  expect(textWrapper.find('.i-switch__track').text()).toBe('开');
  const iconWrapper = mount(Switch, { props: { modelValue: true, inlinePrompt: true, activeIcon: 'icon-success' } });
  expect(iconWrapper.find('.i-switch__icon').exists()).toBe(true);
});

test.each([
  ['loading', { loading: true }],
  ['disabled', { disabled: true }]
])('%s 时不触发变更事件', async (_, props) => {
  const wrapper = mount(Switch, { props });
  await wrapper.find('input').setValue(true);
  expect(wrapper.emitted('change')).toBeUndefined();
});

test('表单禁用时不触发变更事件', async () => {
  const wrapper = mount(Switch, {
    global: { provide: { [fieldKey as symbol]: { id: 'field', disabled: () => true, validate: vi.fn() } } }
  });
  await wrapper.find('input').setValue(true);
  expect(wrapper.emitted('change')).toBeUndefined();
});

test('beforeChange 的异步失败不更新也不校验，成功只更新一次', async () => {
  const validate = vi.fn();
  const rejected = mount(Switch, { props: { beforeChange: () => Promise.reject(new Error('cancel')) }, global: { provide: { [fieldKey as symbol]: { id: 'field', validate } } } });
  await rejected.find('input').setValue(true);
  await Promise.resolve();
  expect(rejected.emitted('change')).toBeUndefined();
  expect(validate).not.toHaveBeenCalled();

  const allowed = mount(Switch, { props: { beforeChange: () => Promise.resolve(true) }, global: { provide: { [fieldKey as symbol]: { id: 'field', validate } } } });
  await allowed.find('input').setValue(true);
  await Promise.resolve();
  expect(allowed.emitted('change')).toEqual([[true]]);
  expect(validate).toHaveBeenCalledTimes(1);
});

test('beforeChange 拒绝或同步抛错时回滚原生输入状态', async () => {
  const rejected = mount(Switch, { props: { beforeChange: () => false } });
  const rejectedInput = rejected.find('input');
  await rejectedInput.setValue(true);
  expect((rejectedInput.element as HTMLInputElement).checked).toBe(false);

  const thrown = mount(Switch, { props: { beforeChange: () => { throw new Error('cancel'); } } });
  const thrownInput = thrown.find('input');
  await thrownInput.setValue(true);
  expect((thrownInput.element as HTMLInputElement).checked).toBe(false);
});

test('action 节点跟随开关状态移动，宽度作用于轨道和输入区', () => {
  const wrapper = mount(Switch, { props: { modelValue: true, width: 48, activeActionIcon: 'icon-like' } });
  expect(wrapper.find('.i-switch__track').attributes('class')).toContain('is-active');
  expect(wrapper.find('.i-switch__action').attributes('class')).toContain('is-active');
  expect(wrapper.find('input').attributes('style')).toContain('width: 48px');
});

test('动态 attrs 会在更新后同步到根节点和 input', async () => {
  const wrapper = mount(Switch, { attrs: { class: 'one', name: 'first' } });
  await wrapper.setProps({ modelValue: true });
  expect(wrapper.classes()).toContain('one');
  expect(wrapper.find('input').attributes('name')).toBe('first');
});

test('loading 时不同时显示 action 图标，并输出 aria-disabled 和 input 事件', async () => {
  const wrapper = mount(Switch, { props: { loading: true, activeActionIcon: 'icon-like' } });
  expect(wrapper.find('.i-switch__loading').exists()).toBe(true);
  expect(wrapper.find('.i-switch__action-icon').exists()).toBe(false);
  expect(wrapper.find('input').attributes('aria-disabled')).toBe('true');
  expect(wrapper.emitted('input')).toBeUndefined();
  const enabled = mount(Switch);
  await enabled.find('input').setValue(true);
  expect(enabled.emitted('input')).toEqual([[true]]);
});

test('继承 Form 和 ConfigProvider 的尺寸', () => {
  const fieldSize = mount(Switch, { global: { provide: { [fieldKey as symbol]: { id: 'field', size: () => 'small' } } } });
  expect(fieldSize.classes()).toContain('i-switch--small');
  const configSize = mount(Switch, { global: { provide: { [configKey as symbol]: computed(() => ({ size: 'large', theme: 'light', themeVars: {} })) } } });
  expect(configSize.classes()).toContain('i-switch--large');
});

test('非 inlinePrompt 模式将 inactive、track、active 按顺序布局', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true, activeText: '开启', inactiveText: '关闭' },
    slots: { active: 'A', inactive: 'I' }
  });
  const children = wrapper.find('label').element.children;
  expect(children[1].className).toContain('i-switch__inactive');
  expect(children[2].className).toContain('i-switch__track');
  expect(children[3].className).toContain('i-switch__active');
  expect(wrapper.text()).toContain('A');
  expect(wrapper.text()).toContain('I');
});

test('large 尺寸使用对应的轨道圆角变量', () => {
  const wrapper = mount(Switch, { props: { size: 'large' } });
  expect(wrapper.find('.i-switch__track').attributes('class')).toContain('i-switch__track');
  expect(wrapper.classes()).toContain('i-switch--large');
});

test('modelValue 不匹配 activeValue 和 inactiveValue 时告警并同步为关闭值', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const wrapper = mount(Switch, { props: { modelValue: 'unknown', activeValue: 'on', inactiveValue: 'off' } });
  expect(warn).toHaveBeenCalledTimes(1);
  expect(wrapper.find('input').element.checked).toBe(false);
  expect(wrapper.emitted('update:modelValue')).toEqual([['off']]);
  expect(wrapper.emitted('input')).toEqual([['off']]);
  expect(wrapper.emitted('change')).toEqual([['off']]);
  await wrapper.setProps({ modelValue: 'off' });
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

test('状态 CSS 依赖 input 与 track 的通用兄弟结构', () => {
  const wrapper = mount(Switch, { props: { modelValue: true, inactiveText: '关闭', activeText: '开启' } });
  const input = wrapper.find('input').element;
  const track = wrapper.find('.i-switch__track').element;
  expect(input.nextElementSibling?.classList.contains('i-switch__inactive')).toBe(true);
  expect(track.previousElementSibling?.classList.contains('i-switch__inactive')).toBe(true);
  expect(input.compareDocumentPosition(track) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('没有状态内容时不渲染空的 active/inactive 节点', () => {
  const wrapper = mount(Switch);
  expect(wrapper.find('.i-switch__active').exists()).toBe(false);
  expect(wrapper.find('.i-switch__inactive').exists()).toBe(false);
});

test('只有 activeText 时只渲染 active 节点', () => {
  const wrapper = mount(Switch, { props: { activeText: '开启' } });
  expect(wrapper.find('.i-switch__active').exists()).toBe(true);
  expect(wrapper.find('.i-switch__inactive').exists()).toBe(false);
});

test('只有 inactiveText 时只渲染 inactive 节点', () => {
  const wrapper = mount(Switch, { props: { inactiveText: '关闭' } });
  expect(wrapper.find('.i-switch__active').exists()).toBe(false);
  expect(wrapper.find('.i-switch__inactive').exists()).toBe(true);
});

test('非当前状态内容设置 aria-hidden', async () => {
  const wrapper = mount(Switch, { props: { modelValue: true, activeText: '开启', inactiveText: '关闭' } });
  expect(wrapper.find('.i-switch__inactive').attributes('aria-hidden')).toBe('true');
  expect(wrapper.find('.i-switch__active').attributes('aria-hidden')).toBeUndefined();
  await wrapper.setProps({ modelValue: false });
  expect(wrapper.find('.i-switch__inactive').attributes('aria-hidden')).toBeUndefined();
  expect(wrapper.find('.i-switch__active').attributes('aria-hidden')).toBe('true');
});

test('状态插槽包含交互内容时不隐藏整个状态包装节点', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true },
    slots: { active: '<button>开启操作</button>', inactive: '<button>关闭操作</button>' }
  });
  expect(wrapper.find('.i-switch__inactive').attributes('aria-hidden')).toBeUndefined();
  expect(wrapper.find('.i-switch__active').attributes('aria-hidden')).toBeUndefined();
});

test('action 插槽包含交互内容时不隐藏轨道', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true },
    slots: { 'active-action': '<button>动作</button>' }
  });
  expect(wrapper.find('.i-switch__track').attributes('aria-hidden')).toBeUndefined();
});

test('loading 时即使存在 action 插槽也隐藏轨道', () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true, loading: true },
    slots: { 'active-action': '<button>动作</button>' }
  });
  expect(wrapper.find('.i-switch__loading').exists()).toBe(true);
  expect(wrapper.find('.i-switch__track').attributes('aria-hidden')).toBe('true');
});

test('支持 Switch 主题变量并忽略非法尺寸类名', () => {
  const wrapper = mount(Switch, {
    props: { size: 'extra-large', activeColor: 'green', inactiveColor: 'gray', borderColor: 'black' }
  });
  expect(wrapper.element.style.getPropertyValue('--i-switch-on-color')).toBe('green');
  expect(wrapper.classes()).not.toContain('i-switch--extra-large');
});
