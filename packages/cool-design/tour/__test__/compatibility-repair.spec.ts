import Tour from '..';
import TourStep from '../../tour-step';
import { h, nextTick } from 'vue';
import { DOMWrapper, mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Tour 步骤内容样式覆盖全局，切换后不残留', async () => {
  const wrapper = mount(Tour, { props: { modelValue: true, contentStyle: { color: 'red' } }, slots: {
    default: () => [h(TourStep, { title: 'first', contentStyle: { color: 'blue' } }), h(TourStep, { title: 'second' })]
  } });
  await nextTick();
  expect(new DOMWrapper(document.body).get('[role=dialog]').attributes('style')).toContain('color: blue');
  await wrapper.setProps({ current: 1 });
  expect(new DOMWrapper(document.body).get('[role=dialog]').attributes('style')).toContain('color: red');
  wrapper.unmount();
});
