import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Countdown from '..';

afterEach(() => {
  vi.useRealTimers();
});

describe('test `Countdown` component', () => {
  test('按格式展示剩余时间并随刷新递减', async () => {
    vi.useFakeTimers();
    const now = Date.now();
    const wrapper = mount(Countdown, {
      props: { value: now + 3_700_000, format: 'HH:mm:ss' }
    });
    expect(wrapper.find('.i-countdown__value').text()).toBe('01:01:40');
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.i-countdown__value').text()).toBe('01:01:39');
    wrapper.unmount();
  });

  test('支持天数与毫秒令牌以及秒小数位', async () => {
    vi.useFakeTimers();
    const now = Date.now();
    const wrapper = mount(Countdown, {
      props: { value: now + 90_061_500, format: 'DD 天 HH:mm:ss.SSS' }
    });
    expect(wrapper.find('.i-countdown__value').text()).toBe('01 天 01:01:01.500');

    const precise = mount(Countdown, {
      props: { value: now + 1500, format: 'ss', precision: 1 }
    });
    expect(precise.find('.i-countdown__value').text()).toBe('1.5');
    precise.unmount();
    wrapper.unmount();
  });

  test('倒计时结束触发 finish 且仅一次', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Countdown, {
      props: { value: Date.now() + 400, format: 'ss' }
    });
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('finish')).toBeUndefined();
    vi.advanceTimersByTime(400);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('finish')).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('finish')).toHaveLength(1);
    expect(wrapper.find('.i-countdown__value').text()).toBe('00');
    wrapper.unmount();
  });

  test('标题、前后缀与自定义内容插槽', () => {
    vi.useFakeTimers();
    const wrapper = mount(Countdown, {
      props: { value: Date.now() + 1000, title: '倒计时', prefix: '剩余', suffix: '后结束' },
      slots: { default: ({ text }: { text: string }) => `自定义 ${text}` }
    });
    expect(wrapper.find('.i-countdown__title').text()).toBe('倒计时');
    expect(wrapper.find('.i-countdown__content').text()).toContain('自定义');
    expect(wrapper.find('.i-countdown__content').text()).toContain('剩余');
    expect(wrapper.find('.i-countdown__content').text()).toContain('后结束');
    wrapper.unmount();
  });
});
