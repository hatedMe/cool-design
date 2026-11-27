import TreeV2 from '..';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('TreeV2 外部拖放按官方签名发送 node-drop', async () => {
  const data = { id: 1, label: 'one' };
  const wrapper = mount(TreeV2, { props: { data: [data] } });
  await wrapper.get('[role=treeitem]').trigger('drop');
  const event = wrapper.emitted('node-drop')?.[0];
  expect(event?.[0]).toEqual(data);
  expect(event?.[1]).toMatchObject({ key: 1, data });
  expect(event?.[2]).toBeInstanceOf(Event);
  wrapper.unmount();
});
