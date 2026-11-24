// @vitest-environment node
import { expect, test, vi } from 'vitest';
import { createSSRApp, effectScope } from 'vue';
import { ElLoading } from '../loading';
import { ElMessage } from '../message';
import { ElMessageBox, useMessageBox } from '../message-box';
import { ElNotification } from '../notification';

// Node 只验证服务入口。避免 Vitest VM 将 SSR 编译的 TSX 组件交给并行的浏览器用例。
vi.mock('../config-provider', () => ({ default: {} }));
vi.mock('../directives', () => ({ LoadingDirective: {} }));
vi.mock('../loading/loading', () => ({ default: {} }));
vi.mock('../message/message', () => ({ default: {} }));
vi.mock('../message-box/message-box', () => ({ default: {} }));
vi.mock('../notification/notification', () => ({ default: {} }));

test('无 DOM 的提示和加载句柄可重复关闭、更新，且不运行用户回调', () => {
  const onClose = vi.fn();
  const message = ElMessage.success({ message: '消息', onClose });
  const notification = ElNotification.info({ message: '通知', onClose });
  const loading = ElLoading({ target: '#missing', lock: true });
  loading.setText('更新');
  for (const handle of [message, notification, loading]) {
    handle.close();
    handle.close();
  }
  loading.setText('关闭后');
  expect(onClose).not.toHaveBeenCalled();
});

test('无 DOM 的消息框拒绝 Promise，不产生用户操作', async () => {
  await expect(ElMessageBox.confirm('继续？')).rejects.toBeUndefined();
  await expect(ElMessageBox.prompt('输入')).rejects.toBeUndefined();
  ElMessageBox.close();
});

test('静态、安装和组合式服务在服务端不读取用户选项', async () => {
  let reads = 0;
  const options = {
    get message() { reads++; return document.title; },
    get showInput() { reads++; return document.hasFocus(); }
  };
  const app = createSSRApp({});
  app.use(ElMessage).use(ElNotification).use(ElMessageBox);
  const globals = app.config.globalProperties;
  for (const message of [ElMessage, globals.$message as typeof ElMessage]) {
    message(options).close();
    for (const type of ['primary', 'success', 'warning', 'info', 'error'] as const) {
      message[type](options).close();
    }
  }
  for (const notify of [ElNotification, globals.$notify as typeof ElNotification]) {
    notify(options).close();
    for (const type of ['primary', 'success', 'warning', 'info', 'error', 'danger'] as const) {
      notify[type](options).close();
    }
  }
  const scope = effectScope();
  try {
    const local = scope.run(useMessageBox)!;
    for (const open of [ElMessageBox, ElMessageBox.msgbox, globals.$msgbox, globals.$messageBox, local.msgbox]) {
      await expect(open(options)).rejects.toBeUndefined();
    }
    for (const kind of ['alert', 'confirm', 'prompt'] as const) {
      await expect(ElMessageBox[kind]('内容', '标题', options)).rejects.toBeUndefined();
      await expect(globals[`$${kind}`]('内容', options)).rejects.toBeUndefined();
      await expect(local[kind]('内容', '标题', options)).rejects.toBeUndefined();
    }
    expect(reads).toBe(0);
  } finally {
    scope.stop();
  }
});
