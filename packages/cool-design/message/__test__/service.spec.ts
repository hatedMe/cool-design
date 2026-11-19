import { afterEach, expect, test, vi } from 'vitest';
import { createApp, h } from 'vue';
import { ElMessage } from '..';

afterEach(() => {
  ElMessage.closeAll();
  document.body.innerHTML = '';
  vi.useRealTimers();
});

test('字符串与选项创建消息并可关闭', () => {
  const a = ElMessage('你好');
  expect(document.body.textContent).toContain('你好');
  expect(document.querySelector('.i-message--info')).not.toBeNull();
  a.close();
  expect(document.querySelector('.i-message')).toBeNull();

  const onClose = vi.fn();
  const b = ElMessage({ message: '成功', type: 'success', showClose: true, duration: 0, onClose });
  expect(document.querySelector('.i-message--success')).not.toBeNull();
  expect(document.querySelector('.i-message button')).not.toBeNull();
  b.close();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('支持五种类型与便捷方法', () => {
  const types = ['primary', 'success', 'warning', 'info', 'error'] as const;
  types.forEach((t) => {
    ElMessage[t](`${t}消息`);
  });
  types.forEach((t) => {
    expect(document.querySelector(`.i-message--${t}`)).not.toBeNull();
  });
  ElMessage.closeAll();
  expect(document.querySelector('.i-message')).toBeNull();
});

test('HTML 默认转义，显式开启才渲染', () => {
  const a = ElMessage({ message: '<b>加粗</b>', duration: 0 });
  expect(document.body.textContent).toContain('<b>加粗</b>');
  expect(document.querySelector('.i-message b')).toBeNull();
  a.close();
  const b = ElMessage({ message: '<b>加粗</b>', dangerouslyUseHTMLString: true, duration: 0 });
  expect(document.querySelector('.i-message b')).not.toBeNull();
  b.close();
});

test('支持 offset 与 placement', () => {
  const a = ElMessage({ message: '顶部', offset: 40, placement: 'top', duration: 0 });
  const top = document.querySelector('.i-message-container--top') as HTMLElement;
  expect(top).not.toBeNull();
  expect(top.style.top).toBe('40px');
  a.close();
  const b = ElMessage({ message: '底部', placement: 'bottom', duration: 0 });
  expect(document.querySelector('.i-message-container--bottom')).not.toBeNull();
  b.close();
});

test('closeAll 支持按类型过滤', () => {
  ElMessage.success('成功消息');
  ElMessage({ message: '提示', type: 'info' });
  ElMessage({ message: '错误', type: 'error' });
  expect(document.querySelectorAll('.i-message')).toHaveLength(3);
  ElMessage.closeAll('info');
  expect(document.querySelectorAll('.i-message')).toHaveLength(2);
  expect(document.querySelector('.i-message--info')).toBeNull();
  ElMessage.closeAll();
  expect(document.querySelectorAll('.i-message')).toHaveLength(0);
});

test('plain 朴素样式与 VNode 消息', () => {
  const a = ElMessage({ message: '朴素提示', plain: true, duration: 0 });
  expect(document.querySelector('.i-message.is-plain')).not.toBeNull();
  a.close();
  const b = ElMessage({ message: h('b', null, '加粗提示'), duration: 0 });
  expect(document.querySelector('.i-message b')?.textContent).toBe('加粗提示');
  b.close();
});

test('自动关闭与 appContext', async () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  ElMessage({ message: '定时', duration: 1000, onClose });
  expect(document.querySelector('.i-message')).not.toBeNull();
  vi.advanceTimersByTime(1000);
  await Promise.resolve();
  expect(onClose).toHaveBeenCalled();
  vi.useRealTimers();

  const app = createApp({ render: () => h('div') });
  const inst = ElMessage('ctx', app._context);
  expect(document.body.textContent).toContain('ctx');
  inst.close();
});
