import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import Message from '..';

test('支持完整消息类型和隐藏关闭按钮', () => {
  const w = mount(Message, { props: { type: 'warning', message: '注意', showClose: false, duration: 0 } });
  expect(w.classes()).toContain('i-message--warning');
  expect(w.find('button').exists()).toBe(false);
  vi.restoreAllMocks();
});

test('悬停暂停倒计时，移开按剩余时长继续', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  const closeSpy = vi.fn();
  const w = mount(Message, { props: { message: '暂停', duration: 3000, onClose: closeSpy } });
  vi.advanceTimersByTime(1000);
  await w.trigger('mouseenter');
  vi.advanceTimersByTime(5000);
  expect(closeSpy).not.toHaveBeenCalled();
  await w.trigger('mouseleave');
  // 剩余 2000ms 倒计时，重新计满前不关闭。
  vi.advanceTimersByTime(1999);
  expect(closeSpy).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(closeSpy).toHaveBeenCalledTimes(1);
  w.unmount();
  vi.useRealTimers();
});
