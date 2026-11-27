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
