import Select from '..';
import { DOMWrapper, mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Select 下拉箭头开关及 suffix-transition 兼容属性生效', async () => {
  const wrapper = mount(Select, { props: { options: [], suffixTransition: false } });
  await wrapper.get('[role=combobox]').trigger('click');
  expect(new DOMWrapper(document.body).find('.i-select__arrow').exists()).toBe(true);
  expect(wrapper.get('.i-select__suffix-caret').classes()).toContain('no-transition');
  await wrapper.setProps({ showArrow: false });
  expect(new DOMWrapper(document.body).find('.i-select__arrow').exists()).toBe(false);
  wrapper.unmount();
});

test('Select 箭头位于独立滚动区域之外，滚动事件只发送一次', async () => {
  const wrapper = mount(Select, { props: { placement: 'top', options: [{ value: 1, label: 'one' }] } });
  await wrapper.get('[role=combobox]').trigger('click');
  const panel = new DOMWrapper(document.body).get('.i-select__dropdown');
  const scroll = panel.get('.i-select__scroll');
  expect(scroll.find('.i-select__arrow').exists()).toBe(false);
  (scroll.element as HTMLElement).scrollTop = 20;
  await scroll.trigger('scroll');
  expect(wrapper.emitted('popup-scroll')).toHaveLength(1);
  expect(wrapper.emitted('popup-scroll')?.[0]).toEqual([{ scrollTop: 20, scrollLeft: 0 }]);
  wrapper.unmount();
});
