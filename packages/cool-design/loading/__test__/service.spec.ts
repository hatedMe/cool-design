import { afterEach, expect, test } from 'vitest';
import { createApp, h } from 'vue';
import Loading from '..';

const closers: Array<{ close(): void }> = [];
afterEach(() => {
  closers.forEach((c) => c.close());
  closers.length = 0;
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

test('服务创建全屏遮罩并可关闭', () => {
  const inst = Loading.service({ text: '加载中', background: 'rgba(0,0,0,.5)', customClass: 'my-loading' });
  closers.push(inst);
  const mask = document.querySelector('.i-loading');
  expect(mask).not.toBeNull();
  expect(mask!.textContent).toContain('加载中');
  expect(mask!.className).toContain('my-loading');
  inst.close();
  expect(document.querySelector('.i-loading')).toBeNull();
});

test('全屏单例复用同一实例', () => {
  const a = Loading.service({ fullscreen: true });
  closers.push(a);
  const b = Loading.service({ fullscreen: true });
  // b 与 a 同一实例，无需重复 push
  expect(b).toBe(a);
  expect(document.querySelectorAll('.i-loading').length).toBe(1);
  a.close();
  expect(document.querySelector('.i-loading')).toBeNull();
});

test('支持 target 与 body 挂载', () => {
  const target = document.createElement('div');
  target.textContent = '内容';
  document.body.appendChild(target);
  const inst = Loading.service({ target, fullscreen: false });
  closers.push(inst);
  expect(target.querySelector('.i-loading')).not.toBeNull();
  inst.close();
  expect(target.querySelector('.i-loading')).toBeNull();

  const target2 = document.createElement('div');
  document.body.appendChild(target2);
  const inst2 = Loading.service({ target: target2, body: true, fullscreen: false });
  closers.push(inst2);
  expect(target2.querySelector('.i-loading')).toBeNull();
  expect(document.body.querySelector('.i-loading')).not.toBeNull();
  inst2.close();
});

test('lock 锁定滚动并在关闭后恢复', () => {
  document.body.style.overflow = '';
  const inst = Loading.service({ fullscreen: true, lock: true });
  closers.push(inst);
  expect(document.body.style.overflow).toBe('hidden');
  inst.close();
  expect(document.body.style.overflow).toBe('');
});

test('服务接受 appContext 参数', () => {
  const app = createApp({ render: () => h('div') });
  const inst = Loading.service({ fullscreen: true, text: 'ctx' }, app._context);
  closers.push(inst);
  expect(document.body.textContent).toContain('ctx');
  inst.close();
});

test('setText 更新提示文字', () => {
  const inst = Loading.service({ fullscreen: true, text: '加载中' });
  closers.push(inst);
  expect(document.body.textContent).toContain('加载中');
  inst.setText('仍在加载');
  expect(document.body.textContent).toContain('仍在加载');
  expect(document.body.textContent).not.toContain('加载中');
  inst.setText('第三次');
  expect(document.body.textContent).toContain('第三次');
  inst.close();
  inst.setText('关闭后无效');
  expect(document.body.textContent).not.toContain('关闭后无效');
});

test('支持自定义 spinner 图标类名', () => {
  const inst = Loading.service({ fullscreen: true, spinner: 'icon-refresh' });
  closers.push(inst);
  expect(document.querySelector('.i-loading__icon')).not.toBeNull();
  expect(document.querySelector('.i-loading__icon')?.className).toContain('icon-refresh');
  expect(document.querySelector('.i-loading__spinner')).toBeNull();
  inst.close();
});

test('支持自定义 SVG 片段与尺寸', () => {
  const inst = Loading.service({
    fullscreen: true,
    svg: '<circle cx="25" cy="25" r="20" fill="none" />',
    svgViewBox: '25 25 50 50',
    svgSize: 64
  });
  closers.push(inst);
  const svg = document.querySelector('.i-loading__svg');
  expect(svg).not.toBeNull();
  expect(svg?.getAttribute('viewBox')).toBe('25 25 50 50');
  expect(svg?.getAttribute('width')).toBe('64');
  expect(svg?.innerHTML).toContain('<circle');
  inst.close();
});
