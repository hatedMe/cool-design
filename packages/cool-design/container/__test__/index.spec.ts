import { mount } from '@vue/test-utils';
import { Fragment, h, ref, nextTick } from 'vue';
import { expect, test } from 'vitest';
import Container from '..';
import Header from '../../header';
import Footer from '../../footer';
import Aside from '../../aside';
import Main from '../../main';
test('自动方向识别 Fragment 内的页头页脚，动态变化后重新判断，显式方向优先', async () => {
  const show = ref(true);
  const w = mount({
    setup: () => () =>
      h(Container, {}, () =>
        h(Fragment, {}, [
          show.value ? h(Header, {}, () => '页头') : h(Aside, {}, () => '侧栏'),
          h(Main, {}, () => '正文')
        ])
      )
  });
  expect(w.get('.i-container').classes()).toContain('i-container--vertical');
  show.value = false;
  await nextTick();
  expect(w.get('.i-container').classes()).toContain('i-container--horizontal');
  w.unmount();
  const explicit = mount(Container, { props: { direction: 'horizontal' }, slots: { default: () => h(Footer) } });
  expect(explicit.classes()).toContain('i-container--horizontal');
  explicit.unmount();
});
test('各区域使用语义标签并响应自定义尺寸', async () => {
  const a = mount(Aside, { props: { width: 220 } });
  expect(a.element.tagName).toBe('ASIDE');
  expect((a.element as HTMLElement).style.width).toBe('220px');
  await a.setProps({ width: '20%' });
  expect((a.element as HTMLElement).style.width).toBe('20%');
  a.unmount();
  for (const Component of [Header, Footer]) {
    const w = mount(Component, { props: { height: 48 } });
    expect((w.element as HTMLElement).style.height).toBe('48px');
    await w.setProps({ height: '4rem' });
    expect((w.element as HTMLElement).style.height).toBe('4rem');
    w.unmount();
  }
  const main = mount(Main);
  expect(main.element.tagName).toBe('MAIN');
  main.unmount();
});

test('忽略 Fragment 中的空节点和文本，仍识别页头', () => {
  const w = mount(Container, {
    slots: { default: () => h(Fragment, null, [null, false, '正文', h(Header), h(Main)]) }
  });
  expect(w.classes()).toContain('i-container--vertical');
  w.unmount();
});

test('五个容器渲染默认插槽、保留原生属性，并使用文档约定的默认尺寸', () => {
  for (const [Component, tag] of [
    [Container, 'section'],
    [Header, 'header'],
    [Aside, 'aside'],
    [Main, 'main'],
    [Footer, 'footer']
  ] as const) {
    const w = mount({
      setup: () => () =>
        h(Component, { id: 'region', class: 'custom-region', 'aria-label': '业务区域' }, () => '业务内容')
    });
    const region = w.get(tag);
    expect(region.text()).toBe('业务内容');
    expect(region.attributes('id')).toBe('region');
    expect(region.attributes('aria-label')).toBe('业务区域');
    expect(region.classes()).toContain('custom-region');
    if (tag === 'header' || tag === 'footer') expect((region.element as HTMLElement).style.height).toBe('60px');
    if (tag === 'aside') expect((region.element as HTMLElement).style.width).toBe('300px');
    w.unmount();
  }
});

test('嵌套容器分别判断方向，不将后代页头误判为父容器的直接区域', () => {
  const w = mount(Container, {
    slots: { default: () => [h(Aside), h(Container, {}, () => [h(Header), h(Main), h(Footer)])] }
  });
  expect(w.classes()).toContain('i-container--horizontal');
  expect(w.get('.i-container .i-container').classes()).toContain('i-container--vertical');
  w.unmount();
});

test('包装组件通过显式direction控制方向，并可在运行时恢复自动判断', async () => {
  const WrappedHeader = { setup: () => () => h(Header, {}, () => '包装页头') };
  const w = mount(Container, {
    props: { direction: 'vertical' },
    slots: { default: () => [h(WrappedHeader), h(Main)] }
  });
  expect(w.classes()).toContain('i-container--vertical');
  await w.setProps({ direction: undefined });
  expect(w.classes()).toContain('i-container--horizontal');
  await w.setProps({ direction: 'vertical' });
  expect(w.classes()).toContain('i-container--vertical');
  w.unmount();
});
