import { mount, flushPromises } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, test, vi } from 'vitest';
import ConfigProvider from '../../config-provider';
import Tour from '..';
import type { TourStep } from '../types';

const steps: TourStep[] = [
  { title: '第一步', description: '描述一', placement: 'center' },
  { title: '第二步', description: '描述二', placement: 'center' }
];

const fakeRect = (top: number) =>
  ({ top, bottom: top + 40, left: 10, right: 110, width: 100, height: 40, x: 10, y: top, toJSON: () => ({}) }) as DOMRect;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('test `Tour` component', () => {
  test('配置变更后重新测量当前目标且保持原滚动位置', async () => {
    const namespace = ref('i');
    const theme = ref<'dark' | 'light'>('dark');
    const size = ref<'large' | 'small'>('large');
    const open = ref(true);
    const anchoredSteps: TourStep[] = [{ target: '#config-target', title: '目标步骤' }];
    const gap = { offset: 5 };
    const wrapper = mount({
      setup: () => () => h(ConfigProvider, { namespace: namespace.value, size: size.value, theme: theme.value }, () => [
        h('button', { id: 'config-target' }),
        h(Tour, { modelValue: open.value, steps: anchoredSteps, gap, scrollIntoViewOptions: true })
      ])
    }, { attachTo: document.body });

    try {
      const target = wrapper.get('#config-target').element;
      const provider = target.parentElement!;
      const scrollIntoView = vi.fn();
      const measureTarget = vi.fn(() => fakeRect(
        120 + (provider.classList.contains('acme-config-provider') ? 10 : 0)
        + (provider.dataset.theme === 'light' ? 10 : 0)
        + (provider.style.getPropertyValue('--acme-control-height') === '28px' ? 10 : 0)
      ));
      Object.defineProperties(target, {
        scrollIntoView: { value: scrollIntoView },
        getBoundingClientRect: { value: measureTarget }
      });
      await flushPromises();
      const spotlight = document.querySelector<HTMLElement>('.i-tour__spotlight')!;
      expect(spotlight.style.top).toBe('115px');
      expect(scrollIntoView).toHaveBeenCalled();
      scrollIntoView.mockClear();

      namespace.value = 'acme';
      await flushPromises();
      expect(spotlight.classList.contains('acme-tour__spotlight')).toBe(true);
      expect(spotlight.style.top).toBe('125px');
      theme.value = 'light';
      await flushPromises();
      expect(spotlight.style.top).toBe('135px');
      size.value = 'small';
      await flushPromises();
      expect(spotlight.style.top).toBe('145px');
      expect(scrollIntoView).not.toHaveBeenCalled();

      open.value = false;
      await flushPromises();
      measureTarget.mockClear();
      namespace.value = 'i';
      await flushPromises();
      expect(spotlight.isConnected).toBe(false);
      expect(measureTarget).not.toHaveBeenCalled();
      expect(scrollIntoView).not.toHaveBeenCalled();
    } finally {
      wrapper.unmount();
    }
  });

  test('外置浮层跟随最近 Provider，切换前缀后保留步骤和用户样式', async () => {
    const namespace = ref('acme');
    const host = document.createElement('div');
    document.body.appendChild(host);
    const wrapper = mount({
      setup: () => () => h(ConfigProvider, { namespace: 'outer', themeVars: { '--user-outer': '7px' } }, () =>
        h(ConfigProvider, { namespace: namespace.value, size: 'large', theme: 'dark' }, () =>
          h(Tour, { modelValue: true, steps, appendTo: host, mask: { style: { '--acme-control-height': '44px' } } })))
    }, { attachTo: document.body });

    try {
      await nextTick();
      const panel = host.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(panel.classList.contains('acme-tour')).toBe(true);
      expect(panel.dataset.theme).toBe('dark');
      expect(panel.style.getPropertyValue('--acme-control-height')).toBe('44px');
      expect(panel.style.getPropertyValue('--user-outer')).toBe('7px');
      expect(host.querySelector('.acme-tour__mask')?.classList.contains('acme-theme-scope')).toBe(true);

      host.querySelector<HTMLButtonElement>('.acme-tour__next')!.click();
      namespace.value = '3d';
      await nextTick();
      expect(host.querySelector('[role="dialog"]')).toBe(panel);
      expect(panel.classList.contains('3d-tour')).toBe(true);
      expect(panel.style.getPropertyValue('--3d-control-height')).toBe('40px');
      expect(panel.textContent).toContain('第二步');
      expect(panel.querySelector('.is-active')?.classList.contains('3d-tour__dot')).toBe(true);
    } finally {
      wrapper.unmount();
    }
    expect(host.children).toHaveLength(0);
  });

  test('步骤导航、完成与关闭事件流', async () => {
    const wrapper = mount(Tour, {
      props: { modelValue: true, current: 0, steps },
      attachTo: document.body
    });
    await nextTick();
    expect(document.body.textContent).toContain('第一步');
    expect(document.body.textContent).toContain('描述一');

    document.querySelector<HTMLButtonElement>('.i-tour__next')!.click();
    await nextTick();
    expect(wrapper.emitted('update:current')).toEqual([[1]]);
    expect(wrapper.emitted('change')).toEqual([[1]]);
    expect(wrapper.emitted('next')).toEqual([[1]]);
    expect(document.body.textContent).toContain('第二步');

    document.querySelector<HTMLButtonElement>('.i-tour__prev')!.click();
    await nextTick();
    expect(wrapper.emitted('prev')).toEqual([[0]]);

    document.querySelector<HTMLButtonElement>('.i-tour__next')!.click();
    await nextTick();
    document.querySelector<HTMLButtonElement>('.i-tour__next')!.click();
    await nextTick();
    expect(wrapper.emitted('finish')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    expect(wrapper.emitted('close')).toEqual([[1]]);
    wrapper.unmount();
  });

  test('目标步骤渲染聚光遮罩，mask=false 不渲染遮罩', async () => {
    const target = document.createElement('div');
    target.id = 'tour-target';
    document.body.appendChild(target);
    Object.defineProperty(target, 'getBoundingClientRect', { value: () => fakeRect(120) });

    const wrapper = mount(Tour, {
      props: {
        modelValue: true,
        steps: [{ target: '#tour-target', title: '聚焦', placement: 'bottom' }]
      },
      attachTo: document.body
    });
    await nextTick();
    const spotlight = document.querySelector<HTMLElement>('.i-tour__spotlight');
    expect(spotlight).not.toBeNull();
    expect(spotlight!.style.boxShadow).toContain('9999px');
    // 默认 gap=10：聚光框向四周扩张。
    expect(spotlight!.style.top).toBe('110px');
    expect(spotlight!.style.left).toBe('0px');
    expect(spotlight!.style.width).toBe('120px');
    await wrapper.setProps({ gap: 0 });
    await flushPromises();
    expect((document.querySelector('.i-tour__spotlight') as HTMLElement).style.top).toBe('120px');

    await wrapper.setProps({ mask: false });
    await nextTick();
    expect(document.querySelector('.i-tour__spotlight')).toBeNull();
    expect(document.querySelector('.i-tour__mask')).toBeNull();
    wrapper.unmount();
  });

  test('default、indicator、close 与按钮插槽可自定义', async () => {
    const wrapper = mount(Tour, {
      props: { modelValue: true, current: 0, steps },
      slots: {
        default: ({ current }: { current: number }) => `自定义内容-${current}`,
        indicator: ({ current, total }: { current: number; total: number }) => `指示 ${current + 1}/${total}`,
        close: () => '关闭引导',
        'prev-btn': () => '返回',
        'next-btn': () => '继续'
      },
      attachTo: document.body
    });
    await nextTick();
    const text = document.body.textContent ?? '';
    expect(text).toContain('自定义内容-0');
    expect(text).toContain('指示 1/2');
    expect(text).toContain('关闭引导');
    expect(text).toContain('继续');
    expect(text).not.toContain('第一步');
    // 第一步不渲染 prev 按钮，插槽仅在按钮存在时生效。
    expect(text).not.toContain('返回');
    document.querySelector<HTMLButtonElement>('.i-tour__next')!.click();
    await nextTick();
    expect(document.body.textContent).toContain('返回');
    wrapper.unmount();
  });

  test('无目标步骤渲染全屏遮罩，go 方法跳转步骤', async () => {
    const wrapper = mount(Tour, {
      props: { modelValue: true, steps, mask: { color: 'rgba(0, 0, 0, 0.8)' } },
      attachTo: document.body
    });
    await nextTick();
    const mask = document.querySelector<HTMLElement>('.i-tour__mask');
    expect(mask).not.toBeNull();
    expect(mask!.style.background).toBe('rgba(0, 0, 0, 0.8)');

    const api = wrapper.vm as unknown as { go: (index: number) => void };
    api.go(1);
    await nextTick();
    expect(wrapper.emitted('update:current')).toEqual([[1]]);
    wrapper.unmount();
  });
});
