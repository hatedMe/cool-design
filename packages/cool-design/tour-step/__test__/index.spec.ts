import { mount } from '@vue/test-utils';
import { Fragment, h, nextTick, resolveComponent } from 'vue';
import { afterEach, expect, test } from 'vitest';
import Tour from '../../tour';
import ConfigProvider from '../../config-provider';
import TourStep from '..';

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

test('installed TourStep declarations render their slots in the Tour namespace', async () => {
  const wrapper = mount({
    setup: () => {
      const Step = resolveComponent('ElTourStep');
      return () => h(ConfigProvider, { namespace: 'acme' }, () =>
        h(Tour, { modelValue: true, steps: [{ title: 'Ignored array step' }] }, {
          default: () => h(Fragment, [
            h(Step, { title: 'Fallback' }, { header: () => 'Declared header', default: () => 'Declared body' })
          ])
        }));
    }
  }, { attachTo: document.body, global: { plugins: [TourStep] } });

  try {
    await nextTick();
    expect(document.querySelector('.acme-tour__title')?.textContent).toBe('Declared header');
    expect(document.querySelector('.acme-tour__description')?.textContent).toBe('Declared body');
    expect(document.body.textContent).not.toContain('Ignored array step');
  } finally {
    wrapper.unmount();
  }
});
