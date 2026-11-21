import { afterEach, expect, test, vi } from 'vitest';
import { createApp, h } from 'vue';
import Notify from '..';

afterEach(() => {
  Notify.closeAll();
  document.body.innerHTML = '';
  vi.useRealTimers();
});

test('创建通知并可关闭，支持类型', () => {
  const onClose = vi.fn();
  const inst = Notify({ title: '标题', message: '内容', type: 'success', duration: 0, onClose });
  expect(document.querySelector('.i-notification--success')).not.toBeNull();
  expect(document.body.textContent).toContain('标题');
  inst.close();
  expect(document.querySelector('.i-notification')).toBeNull();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('支持便捷方法与 error 别名', () => {
  Notify.success({ title: '成功', message: 'ok', duration: 0 });
  Notify.error({ title: '失败', message: 'err', duration: 0 });
  expect(document.querySelectorAll('.i-notification').length).toBe(2);
  Notify.closeAll();
  expect(document.querySelector('.i-notification')).toBeNull();
});

test('字符串简写等价于 { message }', () => {
  const a = Notify('纯文本消息');
  expect(document.body.textContent).toContain('纯文本消息');
  a.close();
  Notify.success('成功消息');
  const success = document.querySelector('.i-notification--success');
  expect(success).not.toBeNull();
  expect(success?.textContent).toContain('成功消息');
  Notify.closeAll();
});

test('HTML 默认转义，显式开启才渲染', () => {
  const a = Notify({ title: 't', message: '<b>加粗</b>', duration: 0 });
  expect(document.querySelector('.i-notification b')).toBeNull();
  a.close();
  const b = Notify({ title: 't', message: '<b>加粗</b>', dangerouslyUseHTMLString: true, duration: 0 });
  expect(document.querySelector('.i-notification b')).not.toBeNull();
  b.close();
});

test('按位置堆叠与 offset', () => {
  const a = Notify({ title: '右上', message: '1', position: 'top-right', offset: 10, duration: 0 });
  const b = Notify({ title: '左下', message: '2', position: 'bottom-left', duration: 0 });
  expect(document.querySelector('.i-notification-container--top-right')).not.toBeNull();
  expect(document.querySelector('.i-notification-container--bottom-left')).not.toBeNull();
  expect(document.querySelectorAll('.i-notification-container--top-right .i-notification').length).toBe(1);
  a.close();
  b.close();
});

test('自动关闭与悬停暂停', async () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  Notify({ title: 't', message: '定时', duration: 1000, onClose });
  expect(document.querySelector('.i-notification')).not.toBeNull();
  // 悬停暂停
  const el = document.querySelector('.i-notification') as HTMLElement;
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  vi.advanceTimersByTime(1000);
  await Promise.resolve();
  expect(document.querySelector('.i-notification')).not.toBeNull();
  // 离开恢复
  el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  vi.advanceTimersByTime(1000);
  await Promise.resolve();
  expect(onClose).toHaveBeenCalled();
  vi.useRealTimers();
});

test('支持 showClose 与 appContext', () => {
  const a = Notify({ title: 't', message: '无关闭', showClose: false, duration: 0 });
  expect(document.querySelector('.i-notification button')).toBeNull();
  a.close();

  const app = createApp({ render: () => h('div') });
  const b = Notify({ title: 't', message: 'ctx', duration: 0 }, app._context);
  expect(document.body.textContent).toContain('ctx');
  b.close();
});
