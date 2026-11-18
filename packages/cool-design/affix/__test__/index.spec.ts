import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Affix from '..';

const fakeRect = (top: number, left = 0, width = 120, height = 40) =>
  ({
    top,
    bottom: top + height,
    left,
    right: left + width,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({})
  }) as DOMRect;

let phTop = 200;
const phHeight = 40;
let spy: ReturnType<typeof vi.spyOn> | undefined;

const mockRects = () => {
  spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.classList.contains('i-affix')) return fakeRect(phTop, 10, 120, phHeight);
    return fakeRect(phTop, 10, 120, 40);
  });
};

const scroll = async () => {
  window.dispatchEvent(new Event('scroll'));
  await nextTick();
};

afterEach(() => {
  spy?.mockRestore();
  spy = undefined;
  document.body.innerHTML = '';
});

describe('test `Affix` component', () => {
  test('滚动越过 offset-top 后固定并触发 change', async () => {
    mockRects();
    const wrapper = mount(Affix, {
      props: { offsetTop: 20 },
      slots: { default: () => '固定内容' },
      attachTo: document.body
    });
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);

    phTop = -10;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    const style = (wrapper.find('.i-affix__content').attributes('style') ?? '') as string;
    expect(style).toContain('position: fixed');
    expect(style).toContain('top: 20px');
    expect(style).toContain('left: 10px');
    expect(style).toContain('width: 120px');
    expect(wrapper.emitted('change')).toEqual([[true]]);
    wrapper.unmount();
  });

  test('position=bottom 与 offsetBottom 固定在底部', async () => {
    mockRects();
    phTop = 740; // bottom 780 超过视口底(768) - offsetBottom(30)
    const wrapper = mount(Affix, {
      props: { position: 'bottom', offsetBottom: 30 },
      slots: { default: () => '底部内容' },
      attachTo: document.body
    });
    await nextTick();
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    expect(wrapper.find('.i-affix__content').attributes('style')).toContain('bottom: 30px');
    wrapper.unmount();
  });

  test('未越过阈值时恢复静态定位并可手动 update', async () => {
    mockRects();
    const wrapper = mount(Affix, {
      props: { offsetTop: 0 },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    await nextTick();
    phTop = -5;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    phTop = 100;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);
    expect(wrapper.emitted('change')).toEqual([[true], [false]]);

    const api = wrapper.vm as unknown as { update: () => void };
    phTop = -5;
    api.update();
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    wrapper.unmount();
  });

  test('offset 属性对 top/bottom 均生效', async () => {
    mockRects();
    const wrapper = mount(Affix, {
      props: { offset: 35 },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    await nextTick();
    phTop = 30; // top 30 < offset 35，应固定
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    expect(wrapper.find('.i-affix__content').attributes('style')).toContain('top: 35px');
    phTop = 50;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);
    wrapper.unmount();

    const bottom = mount(Affix, {
      props: { position: 'bottom', offset: 30 },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    phTop = 740; // bottom 780 > 视口底(768) - 30
    await nextTick();
    await scroll();
    expect(bottom.find('.is-fixed').exists()).toBe(true);
    expect(bottom.find('.i-affix__content').attributes('style')).toContain('bottom: 30px');
    bottom.unmount();
  });

  test('target-container 容器滚动触发更新并发出 scroll 事件', async () => {
    mockRects();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const wrapper = mount(Affix, {
      props: { offset: 20, targetContainer: container },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);
    phTop = 10;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    const scrollEvents = wrapper.emitted('scroll');
    expect(scrollEvents?.at(-1)).toEqual([{ scrollTop: 0, fixed: true }]);
    wrapper.unmount();
  });
});
