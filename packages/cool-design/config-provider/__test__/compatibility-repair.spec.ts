import ConfigProvider from '..';
import { useConfig } from '../context';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Provider 接受官方预留 experimental-features 并继承，未虚构实验功能', async () => {
  let current: ReturnType<typeof useConfig>;
  const Probe = { setup() { current = useConfig(); return () => h('span'); } };
  const wrapper = mount(ConfigProvider, { props: { experimentalFeatures: {} }, slots: { default: () => h(ConfigProvider, null, () => h(Probe)) } });
  expect(current!.value.experimentalFeatures).toEqual({});
  await wrapper.setProps({ experimentalFeatures: undefined });
  expect(current!.value.experimentalFeatures).toBeUndefined();
  wrapper.unmount();
});
