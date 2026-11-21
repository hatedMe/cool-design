import { mount } from '@vue/test-utils';
import { afterEach, expect, test, vi } from 'vitest';
import Backtop from '..';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

test('按 target 监听滚动，达到阈值显示并定位', async () => {
  const container = document.createElement('div');
  container.className = 'backtop-scroll';
  container.style.height = '100px';
  container.style.overflow = 'auto';
  container.innerHTML = '<div style="height: 500px"></div>';
  document.body.append(container);
  const w = mount(Backtop, {
    attachTo: document.body,
    props: { target: '.backtop-scroll', visibilityHeight: 100, right: 24, bottom: 32 }
  });
  expect(w.find('.i-backtop').exists()).toBe(false);
  Object.defineProperty(container, 'scrollTop', { configurable: true, writable: true, value: 150 });
  container.dispatchEvent(new Event('scroll'));
  await w.vm.$nextTick();
  const button = w.get('.i-backtop');
  expect(button.attributes('style')).toContain('right: 24px');
  expect(button.attributes('style')).toContain('bottom: 32px');
  w.unmount();
});

test('点击回顶并触发 click，卸载清理监听', async () => {
  const container = document.createElement('div');
  container.className = 'backtop-click';
  document.body.append(container);
  Object.defineProperty(container, 'scrollTop', { configurable: true, writable: true, value: 200 });
  const scrollTo = vi.fn();
  Object.defineProperty(container, 'scrollTo', { configurable: true, value: scrollTo });
  const removeSpy = vi.spyOn(container, 'removeEventListener');
  const w = mount(Backtop, { attachTo: document.body, props: { target: '.backtop-click', visibilityHeight: 10 } });
  await w.vm.$nextTick();
  expect(w.find('.i-backtop').exists()).toBe(true);
  await w.get('.i-backtop').trigger('click');
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  expect(w.emitted('click')).toHaveLength(1);
  w.unmount();
  expect(removeSpy).toHaveBeenCalled();
});

test('非法选择器回退 window 且不抛出', async () => {
  const w = mount(Backtop, { props: { target: '[[[invalid' } });
  await w.vm.$nextTick();
  expect(w.find('.i-backtop').exists()).toBe(false);
  w.unmount();
});
