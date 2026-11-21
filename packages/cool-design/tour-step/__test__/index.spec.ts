import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, expect, test } from 'vitest';
import Tour from '../../tour';

afterEach(() => {
  document.body.innerHTML = '';
});

test('renders declarative TourStep slots', async () => {
  const { h } = await import('vue');
  const { TourStep } = await import('../../index');
  const wrapper = mount(Tour, { props: { modelValue: true, placement: 'center' }, slots: {
    default: () => [h(TourStep, { title: 'First' }), h(TourStep, { title: 'Second' }, () => 'Content')]
  }});
  await nextTick();
  expect(document.body.textContent).toContain('First');
  (document.body.querySelector('.i-tour__next') as HTMLButtonElement).click();
  await nextTick();
  expect(document.body.textContent).toContain('Second');
  expect(document.body.textContent).toContain('Content');
  wrapper.unmount();
});
