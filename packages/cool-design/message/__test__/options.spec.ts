import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import Message from '../message';
import { message as MessageService } from '../service';

afterEach(() => {
  MessageService.closeAll();
  document.body.innerHTML = '';
});

describe('Message 新增选项', () => {
  test('icon 与 closeIcon 自定义图标', () => {
    const wrapper = mount(Message, {
      props: {
        message: '提示',
        icon: 'icon-warning',
        showClose: true,
        closeIcon: 'icon-close'
      }
    });
    expect(wrapper.find('.i-message__icon').classes()).toContain('icon-warning');
    expect(wrapper.find('.i-message__close .i-icon').classes()).toContain('icon-close');
  });

  test('grouping 合并同内容消息并累计次数', async () => {
    MessageService({ message: '保存成功', grouping: true });
    MessageService({ message: '保存成功', grouping: true });
    MessageService({ message: '保存成功', grouping: true });
    await flushPromises();
    const texts = [...document.querySelectorAll('.i-message')].map((item) => item.textContent);
    expect(texts).toEqual(['保存成功 ×3']);

    MessageService({ message: '其他消息' });
    await flushPromises();
    expect(document.querySelectorAll('.i-message')).toHaveLength(2);
  });

  test('grouping 合并后关闭即移除', async () => {
    const handle = MessageService({ message: '合并关闭', grouping: true, duration: 0 });
    MessageService({ message: '合并关闭', grouping: true, duration: 0 });
    await flushPromises();
    expect(document.querySelectorAll('.i-message')).toHaveLength(1);
    handle.close();
    await flushPromises();
    expect(document.querySelectorAll('.i-message')).toHaveLength(0);
  });
});
