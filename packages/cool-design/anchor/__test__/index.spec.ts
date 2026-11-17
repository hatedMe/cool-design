import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, describe, expect, test } from 'vitest';
import Anchor from '..';
import AnchorLink from '../anchor-link';

const fakeRect = (top: number) =>
  ({ top, bottom: top + 10, left: 0, right: 100, width: 100, height: 10, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;

const setupContainer = (targets: Record<string, number>) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  Object.defineProperty(container, 'getBoundingClientRect', { value: () => fakeRect(0) });
  Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });
  Object.entries(targets).forEach(([id, top]) => {
    const element = document.createElement('div');
    element.id = id;
    container.appendChild(element);
    Object.defineProperty(element, 'getBoundingClientRect', {
      value: () => fakeRect(top - container.scrollTop)
    });
  });
  return container;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('test `Anchor` component', () => {
  test('渲染链接与 sub-link，样式类名生效', () => {
    const wrapper = mount(Anchor, {
      props: { type: 'underline', direction: 'horizontal', marker: false },
      slots: {
        default: () => [
          h(AnchorLink, { href: '#a', title: 'A' }),
          h(AnchorLink, { href: '#b' }, {
            default: () => 'B',
            'sub-link': () => h(AnchorLink, { href: '#b1', title: 'B1' })
          })
        ]
      }
    });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['i-anchor--horizontal', 'i-anchor--underline'])
    );
    expect(wrapper.classes()).not.toContain('has-marker');
    expect(wrapper.findAll('.i-anchor__link')).toHaveLength(3);
    expect(wrapper.text()).toContain('B1');
  });

  test('点击链接滚动到目标并触发 click', async () => {
    const container = setupContainer({ 'target-1': 400 });
    const wrapper = mount(Anchor, {
      props: { container, offset: 50, duration: 0 },
      slots: { default: () => h(AnchorLink, { href: '#target-1', title: '目标一' }) },
      attachTo: document.body
    });
    await wrapper.find('.i-anchor__link').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(container.scrollTop).toBe(350);
    wrapper.unmount();
  });

  test('滚动时高亮并触发 change', async () => {
    const container = setupContainer({ 'target-1': 100, 'target-2': 400 });
    const wrapper = mount(Anchor, {
      props: { container, duration: 0 },
      slots: {
        default: () => [
          h(AnchorLink, { href: '#target-1', title: '一' }),
          h(AnchorLink, { href: '#target-2', title: '二' })
        ]
      },
      attachTo: document.body
    });
    container.scrollTop = 200;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.emitted('change')).toEqual([['#target-1']]);
    expect(wrapper.findAll('.i-anchor__link')[0].classes()).toContain('is-active');

    container.scrollTop = 500;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.emitted('change')).toEqual([['#target-1'], ['#target-2']]);
    expect(wrapper.findAll('.i-anchor__link')[1].classes()).toContain('is-active');
    wrapper.unmount();
  });

  test('scrollTo 暴露方法与 selectScrollTop 顶部选中', async () => {
    const container = setupContainer({ 'target-1': 400 });
    const wrapper = mount(Anchor, {
      props: { container, duration: 0, selectScrollTop: true },
      slots: { default: () => h(AnchorLink, { href: '#target-1', title: '一' }) },
      attachTo: document.body
    });
    const api = wrapper.vm as unknown as { scrollTo: (href: string) => void };
    api.scrollTo('#target-1');
    await nextTick();
    expect(container.scrollTop).toBe(400);

    container.scrollTop = 0;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.findAll('.i-anchor__link')[0].classes()).toContain('is-active');
    wrapper.unmount();
  });
});
