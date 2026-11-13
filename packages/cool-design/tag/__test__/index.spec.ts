import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { expect, test } from 'vitest';
import Tag from '..';
test('保留复杂插槽，关闭仅发事件且不冒泡点击或自行移除', async () => {
  const w = mount(Tag, { props: { closable: true, type: 'success' }, slots: { default: () => h('strong', '启用') } });
  expect(w.get('strong').text()).toBe('启用');
  await w.get('button').trigger('click');
  expect(w.emitted('close')).toHaveLength(1);
  expect(w.emitted('click')).toBeUndefined();
  expect(w.exists()).toBe(true);
  await w.setProps({ disabled: true });
  await w.get('button').trigger('click');
  expect(w.emitted('close')).toHaveLength(1);
  w.unmount();
});

test('支持圆角和 hit 样式，禁用时不触发点击', async () => {
  const w = mount(Tag, { props: { round: true, hit: true, disabled: true } });
  expect(w.classes()).toEqual(expect.arrayContaining(['i-tag--round', 'i-tag--hit']));
  await w.trigger('click');
  expect(w.emitted('click')).toBeUndefined();
});

test('对齐 Element Plus Tag 的主题、尺寸、颜色和关闭过渡属性', () => {
  const w = mount(Tag, {
    props: { type: 'danger', effect: 'dark', size: 'large', color: '#7c3aed', disableTransitions: true, closable: true }
  });
  expect(w.classes()).toEqual(
    expect.arrayContaining(['i-tag--danger', 'i-tag--dark', 'i-tag--large', 'i-tag--disable-transitions'])
  );
  expect((w.element as HTMLElement).style.getPropertyValue('--i-tag-bg-color')).toBe('#7c3aed');
  expect(w.get('button').attributes('aria-label')).toBe('移除标签');
});
