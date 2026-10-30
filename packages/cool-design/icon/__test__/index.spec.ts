import { mount } from '@vue/test-utils';
import { h, defineComponent, reactive } from 'vue';
import { expect, test, vi } from 'vitest';
import Icon from '../index';

test('使用字体实际定义的类名，更新 type 后替换图标', async () => {
  const wrapper = mount(Icon, { props: { type: 'icon-close' } });
  expect(wrapper.classes()).toContain('iconfont');
  expect(wrapper.classes()).toContain('icon-close');
  await wrapper.setProps({ type: 'icon-search' });
  expect(wrapper.classes()).toContain('icon-search');
  expect(wrapper.classes()).not.toContain('icon-close');
});

test('支持可访问名称与显式图标尺寸', async () => {
  const w = mount(Icon, { props: { label: '搜索', size: 24, color: 'red' } });
  expect(w.attributes('role')).toBe('img');
  expect(w.attributes('aria-label')).toBe('搜索');
  expect(w.attributes('style')).toContain('24px');
  await w.setProps({ label: '' });
  expect(w.attributes('aria-hidden')).toBe('true');
  w.unmount();
});

test('自定义 SVG 优先，不同时叠加字体字形', () => {
  const w = mount(Icon, {
    props: { type: 'icon-search' },
    slots: { default: '<svg viewBox="0 0 24 24" fill="none"><path d="M1 1h2" /></svg>' }
  });
  expect(w.find('svg').exists()).toBe(true);
  expect(w.classes()).not.toContain('iconfont');
  expect(w.classes()).not.toContain('icon-search');
  w.unmount();
});

test('支持 Component 图标属性', () => {
  const Search = defineComponent({ render: () => h('svg', { 'data-test': 'search' }) });
  const w = mount(Icon, { props: { icon: Search } });
  expect(w.find('[data-test="search"]').exists()).toBe(true);
  expect(w.classes()).not.toContain('iconfont');
});

test('空字符串图标回退到 type', () => {
  const w = mount(Icon, { props: { icon: '', type: 'icon-search' } });
  expect(w.classes()).toContain('icon-search');
});

test('外部 aria-label 使图标可访问', () => {
  const w = mount(Icon, { attrs: { 'aria-label': '搜索' } });
  expect(w.attributes('role')).toBe('img');
  expect(w.attributes('aria-label')).toBe('搜索');
  expect(w.attributes('aria-hidden')).toBeUndefined();
});

test('label 优先于冲突的 aria-hidden', () => {
  const w = mount(Icon, { props: { label: '搜索' }, attrs: { 'aria-hidden': 'true' } });
  expect(w.attributes('role')).toBe('img');
  expect(w.attributes('aria-label')).toBe('搜索');
  expect(w.attributes('aria-hidden')).toBeUndefined();
});

test('无可访问名称时保留显式 aria-hidden', () => {
  const w = mount(Icon, { attrs: { 'aria-hidden': 'false' } });
  expect(w.attributes('aria-hidden')).toBe('false');
});

test('透传外部 role 和其他 aria 属性', () => {
  const w = mount(Icon, { attrs: { role: 'presentation', 'aria-describedby': 'icon-help' } });
  expect(w.attributes('role')).toBe('presentation');
  expect(w.attributes('aria-describedby')).toBe('icon-help');
});

test('响应式 Component 图标不会产生 Vue 警告', () => {
  const Search = defineComponent({ render: () => h('svg') });
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const state = reactive({ icon: Search });
  mount(Icon, { props: { icon: state.icon } });
  expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('made a reactive object'));
  warn.mockRestore();
});
