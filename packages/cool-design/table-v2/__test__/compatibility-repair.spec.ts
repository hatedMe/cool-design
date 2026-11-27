import TableV2 from '..';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('TableV2 max-height 根据内容收缩，树形缩进与滚动条配置生效', async () => {
  const wrapper = mount(TableV2, { props: {
    columns: [{ key: 'name', dataKey: 'name', width: 200 }],
    data: [{ id: 1, name: 'parent', children: [{ id: 2, name: 'child' }] }],
    defaultExpandedRowKeys: [1], maxHeight: 240, footerHeight: 20, hScrollbarSize: 8, vScrollbarSize: 10,
    scrollbarAlwaysOn: true
  } });
  expect(wrapper.attributes('style')).toContain('height: 170px');
  expect(wrapper.get('.i-table-v2__indent').attributes('style')).toContain('12px');
  expect(wrapper.attributes('style')).toContain('--i-table-v2-v-scrollbar-size: 10px');
  expect(wrapper.get('.i-table-v2__scroll').classes()).toContain('is-scrollbar-always-on');
  await wrapper.setProps({ indentSize: 24, maxHeight: 120 });
  expect(wrapper.attributes('style')).toContain('height: 120px');
  expect(wrapper.get('.i-table-v2__indent').attributes('style')).toContain('24px');
  wrapper.unmount();
});
