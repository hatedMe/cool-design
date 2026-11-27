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

test('打开期间改变 height 即时扩展可见窗口', async () => {
  let height = 68;
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) { return this.getAttribute('role') === 'listbox' ? height : 0; });
  const wrapper = mount(SelectV2, { props: { height, options: Array.from({ length: 100 }, (_, value) => ({ value, label: String(value) })) } });
  await wrapper.get('input').trigger('click');
  const count = doc().findAll('[role=option]').length;
  height = 300;
  await wrapper.setProps({ height });
  expect(doc().findAll('[role=option]').length).toBeGreaterThan(count);
  wrapper.unmount();
});

test('内容宽度模式滚动不重复扫描全部标签', async () => {
  let reads = 0;
  const options = Array.from({ length: 1000 }, (_, value) => ({ value, get label() { reads++; return `选项 ${value}`; } }));
  const wrapper = mount(SelectV2, { props: { options, fitInputWidth: false } });
  await wrapper.get('input').trigger('click'); await nextTick();
  reads = 0;
  const panel = doc().get('[role=listbox]');
  (panel.element as HTMLElement).scrollTop = 3400;
  await panel.trigger('scroll'); await nextTick();
  expect(reads).toBeLessThan(200);
  wrapper.unmount();
});

test('越界滚动索引仍将实际高度较大的最后一行完整滚入视口', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { width: 200, height: this.textContent === 'last' ? 80 : 20 } as DOMRect;
  });
  const wrapper = mount(SelectV2, { props: { estimatedOptionHeight: 20, height: 100, options: ['first', 'second', 'last'].map(value => ({ value, label: value })) } });
  await wrapper.get('input').trigger('click'); await nextTick();
  const panel = doc().get('[role=listbox]').element as HTMLElement;
  Object.defineProperty(panel, 'clientHeight', { value: 100 });
  panel.scrollTop = 0;
  wrapper.vm.scrollTo(99);
  expect(panel.scrollTop).toBe(20);
  wrapper.unmount();
});

test('动态分组可键盘选择，过滤清空及数据替换后重新计算尺寸', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { width: 200, height: this.getAttribute('role') === 'option' ? 30 : this.classList.contains('i-select-v2__group') ? 40 : 0 } as DOMRect;
  });
  const wrapper = mount(SelectV2, { props: { filterable: true, estimatedOptionHeight: 20, height: 100,
    options: [{ label: 'group', options: [{ value: 1, label: 'first' }, { value: 2, label: 'second' }] }]
  } });
  await wrapper.get('input').trigger('click'); await nextTick();
  expect(doc().get('.i-select-v2__list').attributes('style')).toContain('100px');
  await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
  await wrapper.get('input').trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
  await wrapper.get('input').trigger('click');
  await wrapper.get('input').setValue('missing');
  expect(doc().findAll('[role=option]')).toHaveLength(0);
  expect(doc().find('.i-select-v2__list').exists()).toBe(false);
  await wrapper.setProps({ options: [{ label: 'new group', options: [{ value: 3, label: 'new' }] }] });
  await wrapper.get('input').setValue(''); await nextTick();
  expect(doc().get('.i-select-v2__list').attributes('style')).toContain('70px');
  wrapper.unmount();
});

test('嵌套语言配置与加载、无匹配的显式文案优先级', async () => {
  const loading = ref(true);
  const custom = ref<Record<string, string>>({});
  const wrapper = mount({ setup: () => () => h(ConfigProvider, { locale: zhCn }, () => h(ConfigProvider, { locale: en }, () => h(SelectV2, {
    modelValue: null, filterable: true, loading: loading.value, options: [{ value: 1, label: 'one' }], ...custom.value
  }))) }, { attachTo: document.body });
  await wrapper.get('input').trigger('click');
  expect(doc().get('.i-select-v2__empty').text()).toBe('Loading');
  custom.value = { loadingText: '等待中', noMatchText: '未找到' }; await nextTick();
  expect(doc().get('.i-select-v2__empty').text()).toBe('等待中');
  loading.value = false; await nextTick();
  await wrapper.get('input').setValue('missing');
  expect(doc().get('.i-select-v2__empty').text()).toBe('未找到');
  custom.value = {}; await nextTick();
  expect(doc().get('.i-select-v2__empty').text()).toBe('No matching data');
  wrapper.unmount();
});
