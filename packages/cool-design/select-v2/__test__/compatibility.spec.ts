import { DOMWrapper, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import SelectV2 from '..';
import ConfigProvider, { en, zhCn } from '../../config-provider';

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
const doc = () => new DOMWrapper(document.body);

test('动态高度使用测量值滚动，选项替换后清理旧尺寸并释放观察器', async () => {
  let resize: () => void = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    unobserve() {}
    disconnect = disconnect;
  });
  const heights = [60, 40, 80];
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const height = this.getAttribute('role') === 'option' ? heights[Number(this.textContent)] : 0;
    return { height, width: 200, top: 0, bottom: height, left: 0, right: 200, x: 0, y: 0, toJSON() {} };
  });
  const wrapper = mount(SelectV2, { props: {
    options: heights.map((_, value) => ({ value, label: String(value) })), estimatedOptionHeight: 20, height: 40
  } });
  await wrapper.get('input').trigger('click');
  await nextTick();
  expect(doc().get('.i-select-v2__list').attributes('style')).toContain('180px');
  const panel = doc().get('[role=listbox]').element as HTMLElement;
  Object.defineProperty(panel, 'clientHeight', { value: 40 });
  wrapper.vm.scrollTo(2);
  expect(panel.scrollTop).toBe(140);
  heights[0] = 80;
  resize(); await nextTick();
  expect(doc().get('.i-select-v2__list').attributes('style')).toContain('200px');
  heights[0] = 30;
  await wrapper.setProps({ options: [{ value: 'new', label: '0' }] });
  await nextTick();
  expect(doc().get('.i-select-v2__list').attributes('style')).toContain('30px');
  wrapper.unmount();
  expect(disconnect).toHaveBeenCalled();
});

test('prefix 实际渲染，数字宽度生效，滚动条开关控制面板', async () => {
  const wrapper = mount(SelectV2, {
    props: { fitInputWidth: 360, scrollbarAlwaysOn: true, modelValue: 1, options: [{ value: 1, label: 'one' }] },
    slots: { prefix: () => h('b', { 'data-prefix': '' }, '前缀') }
  });
  expect(wrapper.get('[data-prefix]').text()).toBe('前缀');
  expect(wrapper.text()).toContain('one');
  await wrapper.get('input').trigger('click');
  expect(doc().get('[role=listbox]').attributes('style')).toContain('width: 360px');
  expect(doc().get('[role=listbox]').classes()).toContain('is-scrollbar-always-on');
  wrapper.unmount();
});

test('语言切换与显式文案优先级', async () => {
  const locale = ref(en);
  const custom = ref<Record<string, string>>({});
  const wrapper = mount({ setup: () => () => h(ConfigProvider, { locale: locale.value }, () => h(SelectV2, { modelValue: null, options: [], ...custom.value })) }, { attachTo: document.body });
  expect(wrapper.get('input').attributes('placeholder')).toBe('Select');
  await wrapper.get('input').trigger('click');
  expect(doc().get('.i-select-v2__empty').text()).toBe('No data');
  locale.value = zhCn; await nextTick();
  expect(wrapper.get('input').attributes('placeholder')).toBe('请选择');
  expect(doc().get('.i-select-v2__empty').text()).toBe('暂无数据');
  custom.value = { placeholder: '自定义', noDataText: '没有选项' }; await nextTick();
  expect(wrapper.get('input').attributes('placeholder')).toBe('自定义');
  expect(doc().get('.i-select-v2__empty').text()).toBe('没有选项');
  wrapper.unmount();
});
