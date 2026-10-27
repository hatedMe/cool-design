import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { expect, test } from 'vitest';
import Space from '..';
import ConfigProvider from '../../config-provider';
test('间距继承配置并响应方向与显式数值', async () => {
  const w = mount(ConfigProvider, {
    props: { size: 'large' },
    slots: { default: () => h(Space, {}, () => [h('button', '一'), h('button', '二')]) }
  });
  expect(w.get('.i-space').attributes('style')).toContain('gap: 12px');
  w.unmount();
  const space = mount(Space);
  await space.setProps({ size: [4, 16], direction: 'vertical', wrap: false });
  expect(space.attributes('style')).toContain('gap: 4px 16px');
  expect(space.attributes('style')).toContain('flex-direction: column');
  expect(space.attributes('style')).toContain('flex-wrap: nowrap');
  space.unmount();
});
