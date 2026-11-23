import { compile } from 'sass';
import { defineComponent, h, nextTick, provide, ref, toRef } from 'vue';
import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Alert from '../alert';
import Breadcrumb, { BreadcrumbItem } from '../breadcrumb';
import ConfigProvider from '../config-provider';
import PageHeader from '../page-header';
import Progress from '../progress';
import Steps, { Step } from '../steps';
import Timeline, { TimelineItem } from '../timeline';
import Watermark from '../watermark';
import { namespaceKey } from '../../hooks/use-namespace';

test.each([
  ['breadcrumb', () => h(Breadcrumb, { items: [{ label: 'Home' }] })],
  ['breadcrumb__item', () => h(Breadcrumb, null, () => h(BreadcrumbItem, null, () => 'Home'))],
  ['page-header', () => h(PageHeader, { title: 'Back' })],
  ['timeline', () => h(Timeline, { mode: 'end' })],
  ['timeline-item', () => h(Timeline, null, () => h(TimelineItem, { type: 'success' }))],
  ['steps', () => h(Steps, null, () => h(Step, { title: 'Start' }))],
  ['step', () => h(Step, { title: 'Start' })],
  ['progress', () => h(Progress, { percentage: 42, striped: true })],
  ['alert', () => h(Alert, { title: 'Warning' })],
  ['watermark', () => h(Watermark, { content: 'Draft' })]
] as const)('%s keeps its node when the nearest namespace changes', async (block, render) => {
  const namespace = ref('acme');
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'outer' },
    slots: { default: () => h(ConfigProvider, { namespace: namespace.value }, render) }
  });
  try {
    const node = wrapper.get(`.acme-${block}`).element;
    namespace.value = 'next';
    await nextTick();
    expect(wrapper.get(`.next-${block}`).element).toBe(node);
    expect(node.classList.contains(`acme-${block}`)).toBe(false);
  } finally {
    wrapper.unmount();
  }
});

test('timeline mode controls mixed-namespace direct items and their own tails', async () => {
  const style = document.createElement('style');
  style.textContent = compile('packages/cool-design/timeline/index.scss').css;
  document.head.appendChild(style);

  const ItemNamespace = defineComponent({
    props: { namespace: String },
    setup(props) {
      provide(namespaceKey, toRef(props, 'namespace'));
      return () => h(TimelineItem, null, () => 'Wrapped item');
    }
  });
  const namespace = ref('i');
  const mode = ref<'end' | 'alternate' | 'alternate-reverse'>('end');
  const wrapper = mount({
    render: () => h(Timeline, { mode: mode.value }, () => [
      h(ItemNamespace, { namespace: namespace.value }),
      h(TimelineItem, null, () => 'Second item')
    ])
  }, { attachTo: document.body });
  try {
    const first = wrapper.get('li').element;
    const tail = first.firstElementChild!;
    namespace.value = 'acme';
    await nextTick();
    expect(wrapper.get('li').element).toBe(first);
    expect(first.classList.contains('acme-timeline-item')).toBe(true);
    expect(getComputedStyle(first).flexDirection).toBe('row-reverse');
    expect(getComputedStyle(tail).right).toBe('6px');
    mode.value = 'alternate';
    await nextTick();
    expect(getComputedStyle(first).flexDirection).toBe('');
    mode.value = 'alternate-reverse';
    await nextTick();
    expect(getComputedStyle(first).flexDirection).toBe('row-reverse');
  } finally {
    wrapper.unmount();
    style.remove();
  }
});

test('watermark restores its current layer after external changes and stops when unmounted', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'acme' },
    slots: { default: () => h(Watermark, { content: 'Draft', offset: [8, 12] }) }
  });
  const root = wrapper.get('.acme-watermark').element;
  const layer = wrapper.get<HTMLElement>('.acme-watermark__layer').element;
  const image = layer.style.backgroundImage;
  await wrapper.setProps({ namespace: '3d' });
  layer.className = 'foreign';
  layer.style.backgroundImage = 'none';
  layer.style.zIndex = '0';
  layer.remove();
  await nextTick();
  expect(layer.parentElement).toBe(root);
  expect([...layer.classList]).toEqual(['foreign', '3d-watermark__layer']);
  expect(layer.style.backgroundImage).toBe(image);
  expect(layer.style.zIndex).toBe('9');
  layer.remove();
  wrapper.unmount();
  await nextTick();
  expect(layer.parentElement).toBeNull();
});
