import { createApp, h, nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../../config-provider';
import { ElMessage } from '..';
import { Notify } from '../../notification';

test('两个服务跟随所属应用的根配置注册和替换，保持原节点', async () => {
  const prefix = ref('');
  const app = createApp(() => prefix.value
    ? h(ConfigProvider, { key: prefix.value, namespace: prefix.value, theme: 'dark', size: 'small' })
    : null);
  app.mount(document.createElement('div'));
  const msg = ElMessage({ message: h('input'), duration: 0 }, app._context);
  const note = Notify({ message: '通知', duration: 0 }, app._context);
  const input = document.querySelector('.i-message input');
  const notification = document.querySelector('.i-notification');
  try {
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(notification).toBeInstanceOf(HTMLElement);
    for (const namespace of ['acme', 'replacement', 'i']) {
      prefix.value = namespace === 'i' ? '' : namespace;
      await nextTick();
      expect(document.querySelector(`.${namespace}-message-container .${namespace}-message input`)).toBe(input);
      expect(document.querySelector(`.${namespace}-notification-container .${namespace}-notification`)).toBe(notification);
    }
  } finally {
    msg.close();
    note.close();
    app.unmount();
  }
});
