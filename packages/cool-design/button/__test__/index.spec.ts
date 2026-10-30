import { mount } from '@vue/test-utils';
import { defineComponent, h, markRaw } from 'vue';
import { describe, expect, test, vi } from 'vitest';

import Button from '..';
import ButtonGroup from '../group';
import Form from '../../form/form';
import FormItem from '../../form-item/form-item';

describe('test `Button` component', () => {
  test('renders a component', async () => {
    const wrapper = mount(Button);
    expect(wrapper.exists()).toBeTruthy();
  });
  test('渲染原生按钮和插槽，禁用及加载时不触发点击', async () => {
    const wrapper = mount(Button, { slots: { default: '保存' } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.text()).toBe('保存');
    expect(wrapper.attributes('type')).toBe('button');
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    await wrapper.setProps({ disabled: true });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    await wrapper.setProps({ disabled: false, loading: true });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
  test('动态修改尺寸同步更新', async () => {
    const wrapper = mount(Button, { props: { size: 'small' } });
    expect(wrapper.classes()).toContain('i-button--small');
    await wrapper.setProps({ size: 'large' });
    expect(wrapper.classes()).toContain('i-button--large');
  });
  test('支持 Element Plus 风格的外观属性和图标', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'info',
        plain: true,
        text: true,
        link: true,
        round: true,
        circle: true,
        dashed: true,
        color: '#626aef',
        icon: 'icon-add'
      },
      slots: { default: '新增' }
    });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['i-button--info', 'is-plain', 'is-text', 'is-link', 'is-round', 'is-circle', 'is-dashed'])
    );
    expect(wrapper.find('.i-button__icon').classes()).toContain('icon-add');
    expect(wrapper.attributes('style')).toContain('--i-button-color');
  });
  test('四种语义类型输出稳定变体 class', () => {
    for (const type of ['success', 'warning', 'danger', 'info'] as const) {
      const wrapper = mount(Button, { props: { type } });
      expect(wrapper.classes()).toContain(`i-button--${type}`);
    }
  });
  test('自定义颜色为每种外观提供颜色变量且 dark 保留', () => {
    const wrapper = mount(Button, {
      props: { color: '#8b5cf6', plain: true, text: true, link: true, dark: true }
    });
    expect(wrapper.attributes('style')).toContain('--i-button-color: #8b5cf6');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-plain', 'is-text', 'is-link']));
  });
  test('default 类型也消费自定义颜色变量', () => {
    const wrapper = mount(Button, { props: { color: '#8b5cf6' } });
    expect(wrapper.classes()).toContain('i-button--default');
    expect(wrapper.attributes('style')).toContain('--i-button-color: #8b5cf6');
    expect(wrapper.attributes('style')).toContain('--i-button-custom-hover-text-color: #8b5cf6');
    expect(wrapper.attributes('style')).toContain('--i-button-custom-hover-border-color: #8b5cf6');
  });
  test('dark 无自定义颜色时不覆盖主题颜色变量', () => {
    const wrapper = mount(Button, { props: { type: 'success', dark: true } });
    expect(wrapper.attributes('style')).toBeUndefined();
  });
  test('text 和 link 保持透明语义，只有 text bg 生成背景状态', async () => {
    const wrapper = mount(Button, { props: { type: 'success', text: true, link: true, bg: true } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-text', 'is-link', 'is-has-bg']));
    await wrapper.setProps({ text: false });
    expect(wrapper.classes()).not.toContain('is-has-bg');
  });
  test('bg 只在 text button 上生成 has-bg 状态', async () => {
    const wrapper = mount(Button, { props: { bg: true } });
    expect(wrapper.classes()).not.toContain('is-has-bg');
    await wrapper.setProps({ text: true });
    expect(wrapper.classes()).toContain('is-has-bg');
  });
  test('支持 loading 插槽和自定义标签', () => {
    const wrapper = mount(Button, {
      props: { loading: true, tag: 'a' },
      slots: { loading: () => '等待中', default: '保存' }
    });
    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.find('.i-button__loading').text()).toBe('等待中');
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-disabled', 'is-loading']));
  });
  test('loading 默认使用项目 Icon，且 loading 插槽优先', () => {
    const defaultLoading = mount(Button, { props: { loading: true } });
    expect(defaultLoading.find('.i-button__loading .i-icon').classes()).toContain('icon-refresh');
    expect(defaultLoading.find('.i-button__loading .i-icon').classes()).toContain('is-loading');
    expect(defaultLoading.find('.i-button__loading').text()).toBe('');

    const slottedLoading = mount(Button, {
      props: { loading: true, loadingIcon: 'icon-warning' },
      slots: { loading: () => '加载中' }
    });
    expect(slottedLoading.find('.i-button__loading').text()).toBe('加载中');
    expect(slottedLoading.find('.i-button__loading .i-icon').exists()).toBe(false);
  });
  test('支持 autofocus 和组件型 tag', () => {
    const CustomTag = markRaw(
      defineComponent({
        setup(_, { slots, attrs }) {
          return () => h('a', attrs, { default: () => slots.default?.() });
        }
      })
    );
    const wrapper = mount(Button, {
      props: { autofocus: true, tag: CustomTag },
      slots: { default: '保存' }
    });
    expect(wrapper.attributes('autofocus')).toBeDefined();
    expect(wrapper.element.tagName).toBe('A');
  });
  test('autoInsertSpace 只处理恰好两个中文字符，不改动带空白内容', () => {
    const chinese = mount(Button, { props: { autoInsertSpace: true }, slots: { default: '保存' } });
    expect(chinese.text()).toBe('保 存');
    const padded = mount(Button, {
      props: { autoInsertSpace: true },
      slots: { default: () => h('span', ' 保存 ') }
    });
    expect(padded.find('span').element.textContent).toBe(' 保存 ');
  });
  test('非 button 标签在禁用或加载时阻止冒泡且不触发点击', async () => {
    const parent = vi.fn();
    const wrapper = mount(
      {
        render: () => h('div', { onClick: parent }, [h(Button, { tag: 'a', disabled: true })])
      },
      { attachTo: document.body }
    );
    await wrapper.find('a').trigger('click');
    expect(parent).not.toHaveBeenCalled();
    expect(wrapper.findComponent(Button).emitted('click')).toBeUndefined();
    wrapper.unmount();

    const loadingParent = vi.fn();
    const loadingWrapper = mount(
      {
        render: () => h('section', { onClick: loadingParent }, [h(Button, { tag: 'div', loading: true })])
      },
      { attachTo: document.body }
    );
    await loadingWrapper.find('div.i-button').trigger('click');
    expect(loadingParent).not.toHaveBeenCalled();
    expect(loadingWrapper.findComponent(Button).emitted('click')).toBeUndefined();
    loadingWrapper.unmount();
  });
  test('按钮组默认属性可被子按钮显式属性覆盖', () => {
    const wrapper = mount(ButtonGroup, {
      props: { type: 'primary', size: 'small' },
      slots: { default: () => h(Button, { type: 'default', size: 'large' }) }
    });
    const child = wrapper.findComponent(Button);
    expect(child.classes()).toContain('i-button--default');
    expect(child.classes()).toContain('i-button--large');
  });
  test('reset 原生按钮调用 Form resetFields', async () => {
    const model = { name: 'initial' };
    const wrapper = mount(Form, {
      props: { model },
      slots: {
        default: () => [
          h(FormItem, { prop: 'name' }, { default: () => h('input', { value: model.name }) }),
          h(Button, { nativeType: 'reset' })
        ]
      }
    });
    model.name = 'changed';
    await wrapper.find('button').trigger('click');
    expect(model.name).toBe('initial');
  });
  test('按钮组统一尺寸和类型', () => {
    const wrapper = mount(ButtonGroup, {
      props: { type: 'primary', size: 'small' },
      slots: { default: () => ['前', '后'].map((text) => h(Button, null, () => text)) }
    });
    expect(wrapper.classes()).toContain('i-button-group');
    expect(wrapper.findAll('.i-button--primary')).toHaveLength(2);
    expect(wrapper.findAll('.i-button--small')).toHaveLength(2);
  });
});
