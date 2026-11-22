import { mount } from '@vue/test-utils';
import { getCurrentInstance, h, type AppContext } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../index';
import { getAppConfig } from '../context';
import Button from '../../button';

test('嵌套配置继承尺寸、主题和变量，支持动态更新', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { size: 'small', theme: 'dark', themeVars: { '--i-primary': '#123456' } },
    slots: { default: () => h(ConfigProvider, null, { default: () => h(Button, null, () => '保存') }) }
  });
  expect(wrapper.find('button').classes()).toContain('i-button--small');
  const nested = wrapper.findAll('.i-config-provider')[1];
  expect(nested.attributes('data-theme')).toBe('dark');
  expect(nested.attributes('style')).toContain('--i-primary: #123456');
  await wrapper.setProps({ size: 'large' });
  expect(wrapper.find('button').classes()).toContain('i-button--large');
});

test('Provider 的本地前缀覆盖父级并随属性更新', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'acme', size: 'small' },
    slots: { default: () => h(ConfigProvider, null, { default: () => h(Button, { color: 'red', loading: true }) }) }
  });
  expect(wrapper.findAll('.acme-config-provider')).toHaveLength(2);
  expect(wrapper.findAll('.acme-overlay-host')).toHaveLength(2);
  expect(wrapper.find('.acme-button--small').attributes('style')).toContain('--acme-button-bg-color: red');
  expect(wrapper.find('.acme-icon.is-loading').exists()).toBe(true);
  await wrapper.setProps({ namespace: 'next' });
  expect(wrapper.find('.next-button').exists()).toBe(true);
  expect(wrapper.find('.acme-button').exists()).toBe(false);
});

test('服务配置按应用追踪根 Provider 的当前前缀', async () => {
  const contexts: AppContext[] = [];
  const Probe = {
    setup() {
      contexts.push(getCurrentInstance()!.appContext);
      return () => null;
    }
  };
  const mountApp = (namespace: string) =>
    mount(ConfigProvider, {
      props: { namespace },
      slots: { default: () => h(ConfigProvider, { namespace: 'inner' }, () => h(Probe)) }
    });
  const first = mountApp('acme');
  const second = mountApp('other');
  expect(contexts.map((context) => getAppConfig(context)?.namespace)).toEqual(['acme', 'other']);
  await first.setProps({ namespace: 'changed' });
  expect(contexts.map((context) => getAppConfig(context)?.namespace)).toEqual(['changed', 'other']);
  first.unmount();
  expect(getAppConfig(contexts[0])).toBeUndefined();
  expect(getAppConfig(contexts[1])?.namespace).toBe('other');
  second.unmount();
});
