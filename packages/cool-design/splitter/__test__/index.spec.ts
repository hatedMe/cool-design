import { mount } from '@vue/test-utils';
import { Fragment, h, nextTick, ref, renderSlot, type VNode } from 'vue';
import { afterEach, describe, expect, test } from 'vitest';
import Splitter from '..';
import ConfigProvider from '../../config-provider';
import SplitterPanel from '../splitter-panel';

const panels = (propsList: Array<Record<string, unknown>> = [{ size: 100 }, { size: 200 }]) =>
  propsList.map((props) => h(SplitterPanel, props, { default: () => '内容' }));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('test `Splitter` component', () => {
  test('更换命名空间时保留正在拖拽的分隔条和面板', async () => {
    const namespace = ref('acme');
    const wrapper = mount(
      () =>
        h(ConfigProvider, { namespace: namespace.value }, () =>
          h(Splitter, { layout: 'vertical' }, () =>
            panels([{ size: 100, collapsible: true, class: 'user-panel' }, { size: 200 }])
          )
        ),
      { attachTo: document.body }
    );

    try {
      await nextTick();
      const splitter = wrapper.getComponent(Splitter);
      const panel = wrapper.getComponent(SplitterPanel);
      const divider = wrapper.get('[role="separator"]');
      expect(splitter.classes()).toEqual(['acme-splitter', 'acme-splitter--vertical']);
      expect(panel.classes()).toEqual(['acme-splitter__panel', 'user-panel']);
      expect(wrapper.get('button').classes()).toEqual(['acme-splitter__collapse', 'is-start']);
      expect(divider.classes()).toEqual(['acme-splitter__divider']);
      await divider.trigger('mousedown', { clientY: 20 });
      namespace.value = '3d';
      await nextTick();
      expect(wrapper.get('[role="separator"]').element).toBe(divider.element);
      expect(wrapper.get('.user-panel').element).toBe(panel.element);
      expect(splitter.classes()).toEqual(['3d-splitter', '3d-splitter--vertical']);
      expect(panel.classes()).toEqual(['3d-splitter__panel', 'user-panel']);
      expect(divider.classes()).toEqual(['3d-splitter__divider']);

      document.dispatchEvent(new MouseEvent('mousemove', { clientY: 50 }));
      document.dispatchEvent(new MouseEvent('mouseup'));
      await nextTick();
      expect(splitter.emitted('resize-end')).toEqual([[0, [130, 170]]]);
      expect(panel.emitted('update:size')).toEqual([[130]]);
    } finally {
      wrapper.unmount();
    }
  });

  test('渲染面板与分隔条，layout 控制分隔条方向', () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels() }
    });
    expect(wrapper.findAll('.i-splitter__panel')).toHaveLength(2);
    expect(wrapper.find('.i-splitter__divider').attributes('aria-orientation')).toBe('vertical');

    const vertical = mount(Splitter, {
      props: { layout: 'vertical' },
      slots: { default: () => panels() }
    });
    expect(vertical.find('.i-splitter__divider').attributes('aria-orientation')).toBe('horizontal');
  });

  test('拖拽调整面板大小并触发 resize 事件与 update:size', async () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels() },
      attachTo: document.body
    });
    const divider = wrapper.find('.i-splitter__divider');
    await divider.trigger('mousedown', { clientX: 0 });
    expect(wrapper.emitted('resize-start')).toEqual([[0, [100, 200]]]);

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    await nextTick();
    expect(wrapper.emitted('resize')).toEqual([[0, [150, 150]]]);
    expect(wrapper.findAll('.i-splitter__panel')[0].attributes('style')).toContain('0 0 150px');

    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(wrapper.emitted('resize-end')).toEqual([[0, [150, 150]]]);
    const first = wrapper.findAllComponents(SplitterPanel)[0];
    expect(first.emitted('update:size')).toEqual([[150]]);
    wrapper.unmount();
  });

  test('min/max 钳制拖拽结果，resizable=false 禁止拖拽', async () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels([{ size: 100, max: 120 }, { size: 200, min: 190 }]) },
      attachTo: document.body
    });
    await wrapper.find('.i-splitter__divider').trigger('mousedown', { clientX: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    // 右面板 min=190 会把结果回拉：[110, 190]
    expect(wrapper.emitted('resize')!.at(-1)).toEqual([0, [110, 190]]);

    const fixed = mount(Splitter, {
      slots: { default: () => panels([{ size: 100 }, { size: 200, resizable: false }]) },
      attachTo: document.body
    });
    await fixed.find('.i-splitter__divider').trigger('mousedown', { clientX: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(fixed.emitted('resize-start')).toBeUndefined();
    fixed.unmount();
    wrapper.unmount();
  });

  test('collapsible 折叠与恢复并触发 collapse', async () => {
    const wrapper = mount(Splitter, {
      slots: { default: () => panels([{ size: 100, collapsible: true }, { size: 200, collapsible: true, min: 40 }]) },
      attachTo: document.body
    });
    await nextTick();
    expect(wrapper.findAll('.i-splitter__collapse')).toHaveLength(2);

    await wrapper.find('.i-splitter__collapse.is-end').trigger('click');
    await nextTick();
    expect(wrapper.emitted('collapse')).toEqual([[0, 'end', [300, 0]]]);
    expect(wrapper.findAllComponents(SplitterPanel)[1].emitted('update:size')).toEqual([[0]]);

    await wrapper.find('.i-splitter__collapse.is-end').trigger('click');
    await nextTick();
    expect(wrapper.findAllComponents(SplitterPanel)[1].emitted('update:size')).toEqual([[0], [200]]);
    wrapper.unmount();
  });

  test('移除中间面板后分隔条仍关联相邻面板', async () => {
    const host = mount(
      {
        components: { Splitter, SplitterPanel },
        data: () => ({ show: true }),
        template: `
          <Splitter>
            <SplitterPanel :size="100">A</SplitterPanel>
            <SplitterPanel v-if="show" :size="200">B</SplitterPanel>
            <SplitterPanel :size="300">C</SplitterPanel>
          </Splitter>`
      },
      { attachTo: document.body }
    );
    await nextTick();
    expect(host.findAll('.i-splitter__panel')).toHaveLength(3);
    await host.setData({ show: false });
    await nextTick();
    expect(host.findAll('.i-splitter__panel')).toHaveLength(2);

    const splitter = host.getComponent(Splitter);
    const divider = host.find('.i-splitter__divider');
    await divider.trigger('mousedown', { clientX: 0 });
    expect(splitter.emitted('resize-start')).toEqual([[0, [100, 300]]]);
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    await nextTick();
    // 拖拽作用于 A 与 C：[150, 250]
    expect(splitter.emitted('resize')!.at(-1)).toEqual([0, [150, 250]]);
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    const outer = host.findAllComponents(SplitterPanel);
    expect(outer[0].emitted('update:size')).toEqual([[150]]);
    expect(outer[1].emitted('update:size')).toEqual([[250]]);
    host.unmount();
  });

  test('移除中间面板后折叠按钮作用于相邻面板', async () => {
    const host = mount(
      {
        components: { Splitter, SplitterPanel },
        data: () => ({ show: true }),
        template: `
          <Splitter>
            <SplitterPanel :size="100" collapsible>C</SplitterPanel>
            <SplitterPanel v-if="show" :size="200">B</SplitterPanel>
            <SplitterPanel :size="300" collapsible :min="60">C</SplitterPanel>
          </Splitter>`
      },
      { attachTo: document.body }
    );
    await nextTick();
    await host.setData({ show: false });
    await nextTick();
    const splitter = host.getComponent(Splitter);
    // 折叠按钮按相邻面板渲染：A、C 各一个
    expect(host.findAll('.i-splitter__collapse')).toHaveLength(2);
    await host.find('.i-splitter__collapse.is-end').trigger('click');
    await nextTick();
    expect(splitter.emitted('collapse')).toEqual([[0, 'end', [400, 0]]]);
    const outer = host.findAllComponents(SplitterPanel);
    expect(outer[0].emitted('update:size')).toEqual([[400]]);
    expect(outer[1].emitted('update:size')).toEqual([[0]]);
    host.unmount();
  });
});

test('v-for 重排后操作新邻居，拖动中插入面板时丢弃延迟提交', async () => {
  const host = mount({
    components: { Splitter, SplitterPanel },
    data: () => ({ list: ['A', 'B', 'C'] }),
    template: `<Splitter lazy><SplitterPanel v-for="id in list" :key="id" :size="100" :data-id="id">{{id}}</SplitterPanel></Splitter>`
  });
  try {
    await host.setData({ list: ['B', 'C', 'A'] });
    const splitter = host.getComponent(Splitter);
    const bars = host.findAll('[role="separator"]');
    expect(bars).toHaveLength(2);
    await bars[0].trigger('mousedown', { clientX: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(host.get('[data-id=B]').attributes('style')).toContain('130px');
    expect(host.get('[data-id=C]').attributes('style')).toContain('70px');
    await bars[0].trigger('mousedown', { clientX: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 15 }));
    await host.setData({ list: ['B', 'X', 'C', 'A'] });
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(splitter.emitted('resize-end')).toHaveLength(1);
    expect(host.get('[data-id=B]').attributes('style')).toContain('130px');
    expect(host.get('[data-id=X]').attributes('style')).toContain('100px');
  } finally {
    host.unmount();
  }
});

test('单根包装面板按实际顺序折叠，并接受外部尺寸更新', async () => {
  const WrappedPanel = (props: { size: number }) =>
    h(SplitterPanel, { size: props.size, collapsible: true });
  const size = ref(100);
  const host = mount(() => h(Splitter, {}, () => [
    h(WrappedPanel, { size: size.value }),
    h(SplitterPanel, { size: 200 })
  ]));
  try {
    await nextTick();
    await host.get('button.is-start').trigger('click');
    expect(host.getComponent(Splitter).emitted('collapse')).toEqual([[0, 'start', [0, 300]]]);
    size.value = 60;
    await nextTick();
    expect(host.findAllComponents(SplitterPanel)[0].attributes('style')).toContain('60px');
  } finally {
    host.unmount();
  }
});

test('相同键在不同 Fragment 内独立匹配，保留转发插槽的作用域', async () => {
  const sequence = ref([1, '1']);
  const host = mount(() => h(Splitter, {}, () => sequence.value.map(key => {
    const slot = renderSlot({ default: () => [h(SplitterPanel, { key: 'same' }, () => String(key))] }, 'default');
    const fragment = h(Fragment, { key }, [slot]) as VNode & { slotScopeIds: string[] };
    fragment.slotScopeIds = ['data-v-splitter-s'];
    return fragment;
  })));
  try {
    const original = host.findAll('[data-v-splitter-s]').filter(n => n.classes().includes('i-splitter__panel'));
    expect(original).toHaveLength(2);
    sequence.value = ['1', 1];
    await nextTick();
    const next = host.findAll('.i-splitter__panel');
    expect(next[0].element).toBe(original[1].element);
    expect(next[1].element).toBe(original[0].element);
    expect(host.findAll('[role=separator]')).toHaveLength(1);
  } finally {
    host.unmount();
  }
});

test.each(['0px', '0%'])('受控尺寸回写 %s 后可反向恢复并保留按钮', async (zero) => {
  const sizes = ref(['100px', '200px']);
  const host = mount(() => h(Splitter, {}, () => sizes.value.map((size, index) =>
    h(SplitterPanel, {
      key: index, size, collapsible: true,
      'onUpdate:size': (value: number) => { sizes.value[index] = value === 0 ? zero : value + 'px'; }
    })
  )));
  try {
    await nextTick();
    for (const side of ['start', 'end']) {
      const start = side === 'start';
      const button = host.get('button.is-' + side);
      await button.trigger('click');
      expect(button.attributes('aria-label')).toBe(start ? '恢复起始面板' : '恢复结束面板');
      expect(button.text()).toBe(start ? '▶' : '◀');
      await button.trigger('click');
      expect(sizes.value).toEqual(['100px', '200px']);
      expect(host.get('button.is-' + side).element).toBe(button.element);
      expect(button.text()).toBe(start ? '◀' : '▶');
    }
    expect(host.getComponent(Splitter).emitted('collapse')).toEqual([
      [0, 'start', [0, 300]], [0, 'end', [100, 200]],
      [0, 'end', [300, 0]], [0, 'start', [100, 200]]
    ]);
  } finally {
    host.unmount();
  }
});
