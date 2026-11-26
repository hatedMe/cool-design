import { afterEach, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, withDirectives } from 'vue';
import Loading, { vLoading } from '..';

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

test('目标元素优先于全屏选项和已有全屏实例', () => {
  const target = document.createElement('section');
  target.id = 'loading-target';
  document.body.appendChild(target);
  const full = Loading.service();
  const local = Loading.service({ target });
  const selector = Loading.service({ target: '#loading-target', fullscreen: true });
  closers.push(full, local, selector);
  expect(target.querySelectorAll('.i-loading--overlay')).toHaveLength(2);
  expect(Loading.service({ target: '#missing-target' })).toBe(full);
  expect(Loading.service({ target: document.body })).toBe(full);
  local.close();
  expect(target.querySelectorAll('.i-loading--overlay')).toHaveLength(1);
  const body = Loading.service({ target: document.body, fullscreen: false });
  closers.push(body);
  expect(body).not.toBe(full);
  expect(document.body.querySelector(':scope > .i-loading-service > .i-loading--overlay')).toBeTruthy();
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

test('挂到 body 的区域遮罩等待目标显示后测量，提前关闭可取消测量', async () => {
  const shown = ref(false);
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp(() => h('section', { style: { display: shown.value ? 'block' : 'none' } }));
  app.mount(host);
  const target = host.firstElementChild as HTMLElement;
  const rect = vi.spyOn(target, 'getBoundingClientRect').mockImplementation(() =>
    new DOMRect(0, 0, target.style.display === 'none' ? 0 : 200, 80)
  );
  try {
    shown.value = true;
    const cancelled = Loading.service({ target, body: true, lock: true });
    cancelled.close();
    const shownMask = Loading.service({ target, body: true, lock: true });
    closers.push(shownMask);
    await nextTick();
    expect(rect).toHaveBeenCalledTimes(1);
    expect(document.querySelector<HTMLElement>('.i-loading-service')!.style.width).toBe('200px');
    expect(document.body.style.overflow).toBe('hidden');
  } finally {
    app.unmount();
    rect.mockRestore();
  }
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

test('不同应用分别持有全屏实例并共享滚动锁', () => {
  const a = createApp({});
  const b = createApp({});
  document.body.style.overflow = 'scroll';
  const first = Loading.service({ lock: true }, a._context);
  const second = Loading.service({ lock: true }, b._context);
  closers.push(first, second);
  expect(first).not.toBe(second);
  first.close();
  expect(document.body.style.overflow).toBe('hidden');
  second.close();
  expect(document.body.style.overflow).toBe('scroll');
});

test('文字重绘和移出宿主后只释放指令持有的定位', async () => {
  const text = ref('before');
  const body = ref(false);
  const style = document.createElement('style');
  style.textContent = 'section.loading-target { position: static }';
  document.head.append(style);
  const app = createApp(() => withDirectives(h('section', { class: 'loading-target' }, text.value), [
    [vLoading, { body: body.value }]
  ]));
  const host = document.createElement('div');
  document.body.append(host);
  app.mount(host);
  const target = host.querySelector('section')!;
  const instance = Loading.service({ target, fullscreen: false });
  closers.push(instance);
  try {
    text.value = 'after';
    await nextTick();
    expect(target.querySelector('[role=status]')).not.toBeNull();
    body.value = true;
    await nextTick();
    expect(target.style.position).toBe('relative');
    instance.close();
    expect(target.style.position).toBe('');
  } finally {
    app.unmount();
    style.remove();
  }
});

test('目标已定位的服务关闭时保留后来实例取得的定位', () => {
  const target = document.createElement('div');
  document.body.append(target);
  target.style.position = 'absolute';
  const first = Loading.service({ target, fullscreen: false });
  target.style.position = 'static';
  const second = Loading.service({ target, fullscreen: false });
  closers.push(first, second);
  first.close();
  expect(target.style.position).toBe('relative');
  second.close();
  expect(target.style.position).toBe('static');
});

test('最后释放时恢复滚动轴和定位优先级，保留其他样式更新', () => {
  const target = document.createElement('div');
  document.body.append(target);
  target.style.setProperty('position', 'static', 'important');
  document.body.style.setProperty('overflow-y', 'scroll', 'important');
  const first = Loading.service({ target, fullscreen: false, lock: true });
  const second = Loading.service({ target, fullscreen: false, lock: true });
  closers.push(first, second);
  target.style.color = 'red';
  second.close();
  expect(target.style.position).toBe('relative');
  first.close();
  expect(target.style.getPropertyPriority('position')).toBe('important');
  expect(target.style.color).toBe('red');
  expect(document.body.style.overflowY).toBe('scroll');
  expect(document.body.style.getPropertyPriority('overflow-y')).toBe('important');
  document.body.style.removeProperty('overflow-y');
});
