import Scrollbar from '..';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Scrollbar ARIA 属于 view，遮罩响应滚动边界且兼容 native', async () => {
  const wrapper = mount(Scrollbar, { props: { mask: true, native: true, role: 'listbox', 'aria-label': 'choices', 'aria-orientation': 'vertical' } });
  expect(wrapper.get('.i-scrollbar__view').attributes('role')).toBe('listbox');
  expect(wrapper.attributes('role')).toBeUndefined();
  const wrap = wrapper.get('.i-scrollbar__wrap');
  Object.defineProperties(wrap.element, { clientHeight: { value: 100 }, scrollHeight: { value: 300 }, clientWidth: { value: 100 }, scrollWidth: { value: 100 } });
  wrapper.vm.update(); await nextTick();
  expect(wrapper.find('.i-scrollbar__mask--bottom').exists()).toBe(true);
  expect(wrapper.find('.i-scrollbar__mask--top').exists()).toBe(false);
  (wrap.element as HTMLElement).scrollTop = 50;
  await wrap.trigger('scroll');
  expect(wrapper.find('.i-scrollbar__mask--top').exists()).toBe(true);
  await wrapper.setProps({ mask: 'bottom' });
  expect(wrapper.find('.i-scrollbar__mask--top').exists()).toBe(false);
  await wrapper.setProps({ mask: false });
  expect(wrapper.find('[class*=__mask]').exists()).toBe(false);
  wrapper.unmount();
});
