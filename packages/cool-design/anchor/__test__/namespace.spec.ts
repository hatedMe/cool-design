import { flushPromises, mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import { h, ref } from 'vue';
import { Affix } from '../../affix';
import { Backtop } from '../../backtop';
import { ConfigProvider } from '../../config-provider';
import { Scrollbar } from '../../scrollbar';
import { Anchor, AnchorLink } from '..';

test('五个公开组件响应最近命名空间并复用原有节点', async () => {
  const namespace = ref('acme');
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    slots: { default: () => h(ConfigProvider, { namespace: namespace.value }, () => [
      h(Scrollbar, { wrapClass: 'user-wrap', viewClass: 'user-view' }),
      h(Affix),
      h(Backtop, { visibilityHeight: 0 }),
      h(Anchor, { direction: 'horizontal', type: 'underline' }, () =>
        h(ConfigProvider, { namespace: 'child' }, () => h(AnchorLink, { href: '#test', title: '子链接' }))),
      h(AnchorLink, { href: '#test', title: '独立链接' })
    ]) }
  });
  try {
    await flushPromises();
    const roots = ['scrollbar', 'affix', 'backtop', 'anchor', 'anchor__item'];
    expect(roots.map(block => wrapper.findAll('.acme-' + block).length)).toEqual([1, 1, 1, 1, 1]);
    const elements = roots.map(block => wrapper.get('.acme-' + block).element);
    const child = wrapper.get('.child-anchor__link').element;

    namespace.value = '3d';
    await flushPromises();
    roots.forEach((block, index) => {
      expect(wrapper.findAll('[class~="3d-' + block + '"]').map(node => node.element)).toEqual([elements[index]]);
    });
    expect(wrapper.get('.child-anchor__link').element).toBe(child);
    expect(wrapper.get('[class~="3d-scrollbar__wrap"]').classes()).toContain('user-wrap');
    expect(wrapper.get('[class~="3d-scrollbar__view"]').classes()).toContain('user-view');
  } finally {
    wrapper.unmount();
  }
});

