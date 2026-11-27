import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, Fragment, h, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import { ConfigProvider } from '../../config-provider';
import { Carousel, CarouselItem } from '..';

const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const items = (count = 3, autoplay = false) =>
  mount(Carousel, {
    props: { autoplay },
    slots: {
      default: () => Array.from({ length: count }, (_, i) => h(CarouselItem, { name: `s${i}` }, () => `内容${i}`))
    },
    attachTo: document.body
  });

const activeText = (w: ReturnType<typeof mount>) => w.get('.i-carousel__item.is-active').text();

test('渲染子项与指示器，change 事件携带新旧索引', async () => {
  const w = items();
  wrappers.push(w);
  await flushPromises();
  expect(w.findAll('.i-carousel__item')).toHaveLength(3);
  expect(w.findAll('.i-carousel__indicator')).toHaveLength(3);
  expect(activeText(w)).toBe('内容0');
  await w.get('.i-carousel__arrow--right').trigger('click');
  expect(activeText(w)).toBe('内容1');
  expect(w.emitted('change')).toEqual([[1, 0]]);
});

test('自动播放推进，悬停暂停，卸载清理计时器', async () => {
  vi.useFakeTimers();
  const w = items(3, true);
  wrappers.push(w);
  await flushPromises();
  expect(activeText(w)).toBe('内容0');
  vi.advanceTimersByTime(3000);
  await flushPromises();
  expect(activeText(w)).toBe('内容1');
  await w.get('.i-carousel').trigger('mouseenter');
  vi.advanceTimersByTime(6000);
  await flushPromises();
  expect(activeText(w)).toBe('内容1');
  await w.get('.i-carousel').trigger('mouseleave');
  vi.advanceTimersByTime(3000);
  await flushPromises();
  expect(activeText(w)).toBe('内容2');
  w.unmount();
  wrappers.pop();
  expect(vi.getTimerCount()).toBe(0);
});

test('循环与边界：loop 包裹，关闭后箭头隐藏', async () => {
  const w = items();
  wrappers.push(w);
  await flushPromises();
  await w.get('.i-carousel__arrow--left').trigger('click');
  expect(activeText(w)).toBe('内容2');
  await w.setProps({ loop: false });
  expect(w.find('.i-carousel__arrow--right').exists()).toBe(false);
  expect(w.find('.i-carousel__arrow--left').exists()).toBe(true);
  await w.get('.i-carousel__arrow--left').trigger('click');
  await w.get('.i-carousel__arrow--left').trigger('click');
  expect(activeText(w)).toBe('内容0');
  expect(w.find('.i-carousel__arrow--left').exists()).toBe(false);
  expect(w.find('.i-carousel__arrow--right').exists()).toBe(true);
  await w.setProps({ arrow: 'never' });
  expect(w.find('.i-carousel__arrow--right').exists()).toBe(false);
});

test('指示器 hover/click 切换，支持 initial-index', async () => {
  const w = mount(Carousel, {
    props: { autoplay: false, initialIndex: 2 },
    slots: { default: () => [h(CarouselItem, () => 'a'), h(CarouselItem, () => 'b'), h(CarouselItem, () => 'c')] },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  expect(activeText(w)).toBe('c');
  await w.findAll('.i-carousel__indicator')[0].trigger('mouseenter');
  expect(activeText(w)).toBe('a');
  await w.setProps({ trigger: 'click' });
  await w.findAll('.i-carousel__indicator')[1].trigger('click');
  expect(activeText(w)).toBe('b');
  await w.setProps({ indicatorPosition: 'none' });
  expect(w.find('.i-carousel__indicators').exists()).toBe(false);
});

test('键盘切换与垂直方向', async () => {
  const w = mount(Carousel, {
    props: { autoplay: false, direction: 'vertical' },
    slots: { default: () => [h(CarouselItem, () => 'a'), h(CarouselItem, () => 'b')] },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  expect(w.get('.i-carousel').classes()).toContain('is-vertical');
  await w.get('.i-carousel').trigger('keydown', { key: 'ArrowDown' });
  expect(activeText(w)).toBe('b');
  await w.get('.i-carousel').trigger('keydown', { key: 'ArrowUp' });
  expect(activeText(w)).toBe('a');
  await w.setProps({ direction: 'horizontal' });
  await w.get('.i-carousel').trigger('keydown', { key: 'ArrowRight' });
  expect(activeText(w)).toBe('b');
});

test('expose 支持索引与名称切换', async () => {
  const w = items();
  wrappers.push(w);
  await flushPromises();
  const vm = w.vm as unknown as {
    activeIndex: number;
    setActiveItem: (target: number | string) => void;
    prev: () => void;
    next: () => void;
  };
  expect(vm.activeIndex).toBe(0);
  vm.setActiveItem('s2');
  await flushPromises();
  expect(vm.activeIndex).toBe(2);
  vm.prev();
  await flushPromises();
  expect(vm.activeIndex).toBe(1);
  vm.next();
  await flushPromises();
  expect(vm.activeIndex).toBe(2);
  vm.setActiveItem(0);
  await flushPromises();
  expect(vm.activeIndex).toBe(0);
  vm.setActiveItem(-4);
  await flushPromises();
  expect(vm.activeIndex).toBe(2);
});

test('卡片模式缩放非激活项，高度属性生效', async () => {
  const w = mount(Carousel, {
    props: { autoplay: false, type: 'card', height: '220px' },
    slots: { default: () => [h(CarouselItem, () => 'a'), h(CarouselItem, () => 'b')] },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  expect(w.get('.i-carousel').classes()).toContain('is-card');
  expect((w.get('.i-carousel__stage').element as HTMLElement).style.height).toBe('220px');
  const [first, second] = w.findAll('.i-carousel__item');
  expect((first.element as HTMLElement).style.transform).toContain('scale(1)');
  expect((second.element as HTMLElement).style.transform).toContain('scale(0.83)');
});

test('切换最近 Provider 的命名空间时保留 Fragment 子项、激活索引和焦点', async () => {
  const namespace = ref('acme');
  const w = mount({
    setup: () => () => h(ConfigProvider, { namespace: 'outer' }, () =>
      h(ConfigProvider, { namespace: namespace.value }, () =>
        h(Carousel, { autoplay: false, initialIndex: 1, indicatorPosition: 'outside' }, () => [
          h(CarouselItem, { key: 'a' }, () => 'a'),
          h(Fragment, [h(CarouselItem, { key: 'b', class: 'user-slide' }, () => 'b')])
        ])
      )
    )
  }, { attachTo: document.body });
  wrappers.push(w);
  await flushPromises();

  expect(w.get('[role="region"]').classes()).toContain('acme-carousel');
  const root = w.get<HTMLElement>('.acme-carousel--indicator-outside');
  const slide = w.get('.acme-carousel__item.is-active.user-slide').element;
  const arrow = root.get('.acme-carousel__arrow--left').element;
  root.element.focus();

  namespace.value = '3d';
  await flushPromises();
  expect(document.activeElement).toBe(root.element);
  expect(root.classes()).toContain('3d-carousel--arrow-hover');
  expect(slide.classList.contains('3d-carousel__item')).toBe(true);
  expect(slide.classList.contains('is-active')).toBe(true);
  expect(arrow.classList.contains('3d-carousel__arrow--left')).toBe(true);
  await root.trigger('keydown', { key: 'ArrowLeft' });
  expect(slide.getAttribute('aria-hidden')).toBe('true');
  expect(w.get('[aria-current="true"]').classes()).toContain('3d-carousel__indicator');
  expect(w.getComponent(Carousel).emitted('change')).toEqual([[0, 1]]);
});

test('带键列表增删重排后重新应用 initialIndex，导航跟随渲染顺序', async () => {
  const ids = ref(['A', 'B', 'C']);
  const w = mount(Carousel, {
    props: { autoplay: false, initialIndex: 1 },
    slots: { default: () => h(Fragment, ids.value.map(id => h(CarouselItem, { key: id, name: id }, () => id))) }
  });
  wrappers.push(w);
  const vm = w.vm as unknown as { setActiveItem: (name: string) => void };
  await flushPromises();
  vm.setActiveItem('C');
  await flushPromises();
  const slide = w.get('.is-active[role="group"]').element;
  ids.value = ['C', 'A', 'B'];
  await flushPromises();
  expect(activeText(w)).toBe('A');
  expect(w.get('[role="group"]').element).toBe(slide);
  expect(slide.getAttribute('aria-hidden')).toBe('true');
  vm.setActiveItem('B');
  await flushPromises();
  expect(activeText(w)).toBe('B');
  ids.value = ['X', 'C'];
  await flushPromises();
  expect(activeText(w)).toBe('C');
  expect(w.emitted('change')).toEqual([[2, 1], [1, 2], [2, 1], [1, 2]]);
});

test('同名包装只为已注册子项生成导航，独立更新时同步顺序', async () => {
  const ids = ref<string[]>([]);
  const Wrapped = defineComponent({
    name: CarouselItem.name,
    setup: () => () => ids.value.length
      ? h(Fragment, ids.value.map(id => h(CarouselItem, { key: id, name: id }, () => id)))
      : h('span')
  });
  const w = mount(Carousel, {
    props: { autoplay: false },
    slots: { default: () => [h(CarouselItem, { name: 'A' }, () => 'A'), h(Wrapped)] }
  });
  wrappers.push(w);
  const vm = w.vm as unknown as { next: () => void; setActiveItem: (name: string) => void };
  await flushPromises();
  expect(w.findAll('ul button')).toHaveLength(1);
  vm.next();
  expect(activeText(w)).toBe('A');
  for (const order of [['B', 'C'], ['C', 'B'], ['X'], []]) {
    ids.value = order;
    await flushPromises();
    expect(w.findAll('ul button')).toHaveLength(order.length + 1);
    expect(activeText(w)).toBe('A');
    if (order.length) {
      vm.setActiveItem(order[0]);
      await flushPromises();
      expect(activeText(w)).toBe(order[0]);
      expect(w.findAll('ul button')[1].attributes('aria-current')).toBe('true');
    }
  }
  expect(w.emitted('change')).toEqual([[1, 0], [0, 1], [1, 0], [0, 1], [1, 0], [0, 1]]);
});
