import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, provide, ref, type PropType } from 'vue';
import { afterEach, expect, test } from 'vitest';
import { namespaceKey } from '../../../hooks/use-namespace';
import { Collapse, CollapseItem } from '..';

const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  document.body.innerHTML = '';
});

const basic = (props: Record<string, unknown> = {}) => {
  const model = ref(props.modelValue as (string | number)[] | string | undefined);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Collapse,
          {
            ...props,
            modelValue: props.modelValue === undefined ? undefined : model.value,
            'onUpdate:modelValue': (v: (string | number)[] | string) => (model.value = v)
          },
          () => [
            h(CollapseItem, { title: '标题一', name: '1' }, () => '内容一'),
            h(CollapseItem, { title: '标题二', name: '2' }, () => '内容二'),
            h(CollapseItem, { title: '标题三', name: '3', disabled: true }, () => '内容三')
          ]
        )
    }),
    { attachTo: document.body }
  );
  wrappers.push(wrapper);
  return wrapper;
};

test('非受控展开收起，change 携带激活数组', async () => {
  const w = basic();
  const collapse = w.findComponent(Collapse);
  const headers = w.findAll('.i-collapse-item__header');
  await headers[0].trigger('click');
  await headers[1].trigger('click');
  expect(collapse.emitted('change')).toEqual([[['1']], [['1', '2']]]);
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(2);
  await headers[0].trigger('click');
  expect(collapse.emitted('change')).toEqual([[['1']], [['1', '2']], [['2']]]);
  await headers[2].trigger('click');
  expect(collapse.emitted('change')).toHaveLength(3);
});

test('受控 v-model 与手风琴模式', async () => {
  const w = basic({ modelValue: ['1'], accordion: true });
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(1);
  const headers = w.findAll('.i-collapse-item__header');
  await headers[1].trigger('click');
  await flushPromises();
  const collapse = w.findComponent(Collapse);
  expect(collapse.emitted('update:modelValue')).toEqual([['2']]);
  expect(collapse.emitted('change')).toEqual([['2']]);
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(1);
  await headers[1].trigger('click');
  expect(collapse.emitted('update:modelValue')).toEqual([['2'], [undefined]]);
});

test('异步 beforeCollapse 可拦截', async () => {
  let allow = false;
  const w = basic({ beforeCollapse: async () => allow });
  const headers = w.findAll('.i-collapse-item__header');
  await headers[0].trigger('click');
  await flushPromises();
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(0);
  allow = true;
  await headers[0].trigger('click');
  await flushPromises();
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(1);
});

test('键盘导航与 ARIA 关联', async () => {
  const w = basic({ modelValue: ['1'] });
  const headers = w.findAll('.i-collapse-item__header');
  expect(headers[0].attributes('aria-expanded')).toBe('true');
  expect(headers[0].attributes('aria-controls')).toBe(w.findAll('.i-collapse-item__wrap')[0].attributes('id'));
  (headers[0].element as HTMLElement).focus();
  await headers[0].trigger('keydown', { key: 'ArrowDown' });
  expect(document.activeElement).toBe(headers[1].element);
  await headers[1].trigger('keydown', { key: 'ArrowUp' });
  expect(document.activeElement).toBe(headers[0].element);
  expect(headers[2].attributes('disabled')).toBeDefined();
});

test('键盘按 DOM 顺序定位本组标题，支持子项独立切换命名空间', async () => {
  const namespace = ref('acme');
  const extra = ref(true);
  const MixedItem = defineComponent({
    setup() {
      provide(namespaceKey, namespace);
      return () => h(CollapseItem, { id: 'mixed', title: '跨前缀' });
    }
  });
  const wrapper = mount({
    render: () => h(Collapse, { modelValue: ['outer'] }, () => [
      h(CollapseItem, { id: 'outer', name: 'outer', title: '外组' }, () =>
        h(Collapse, null, () => [
          h(CollapseItem, { id: 'inner', title: '内组' }),
          h('button', { class: 'i-collapse-item__header' }, '自定义按钮')
        ])
      ),
      extra.value && h(CollapseItem, { id: 'disabled', disabled: true }),
      h(MixedItem),
      h(CollapseItem, { id: 'last', title: '末项' })
    ])
  }, { attachTo: document.body });
  wrappers.push(wrapper);

  const outer = wrapper.get('#outer > button');
  const inner = wrapper.get('#inner > button');
  const mixed = wrapper.get('#mixed > button');
  const last = wrapper.get('#last > button');
  (outer.element as HTMLButtonElement).focus();
  await outer.trigger('keydown', { key: 'ArrowDown' });
  expect(document.activeElement).toBe(mixed.element);
  expect(mixed.classes()).toContain('acme-collapse-item__header');

  namespace.value = '3d';
  extra.value = false;
  await nextTick();
  expect(mixed.classes()).toContain('3d-collapse-item__header');
  expect(document.activeElement).toBe(mixed.element);
  await mixed.trigger('keydown', { key: 'ArrowDown' });
  expect(document.activeElement).toBe(last.element);

  (inner.element as HTMLButtonElement).focus();
  await inner.trigger('keydown', { key: 'End' });
  expect(document.activeElement).toBe(inner.element);
});

test('expose 支持读取与设置激活项', async () => {
  const w = mount(Collapse, {
    slots: {
      default: () => [
        h(CollapseItem, { title: '标题一', name: '1' }, () => '内容一'),
        h(CollapseItem, { title: '标题二', name: '2' }, () => '内容二')
      ]
    },
    attachTo: document.body
  });
  wrappers.push(w);
  const vm = w.vm as unknown as {
    activeNames: (string | number)[];
    setActiveNames: (names: (string | number)[]) => void;
  };
  expect(vm.activeNames).toEqual([]);
  vm.setActiveNames(['1', '2']);
  await flushPromises();
  expect(vm.activeNames).toEqual(['1', '2']);
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(2);
  vm.setActiveNames([]);
  await flushPromises();
  expect(vm.activeNames).toEqual([]);
});

test('手风琴 setActiveNames 只保留第一项', async () => {
  const w = mount(Collapse, {
    props: { accordion: true },
    slots: {
      default: () => [
        h(CollapseItem, { title: '标题一', name: '1' }, () => '内容一'),
        h(CollapseItem, { title: '标题二', name: '2' }, () => '内容二')
      ]
    },
    attachTo: document.body
  });
  wrappers.push(w);
  const vm = w.vm as unknown as {
    activeNames: (string | number)[];
    setActiveNames: (names: (string | number)[]) => void;
  };
  vm.setActiveNames(['1', '2']);
  await flushPromises();
  expect(vm.activeNames).toEqual(['1']);
  expect(w.findAll('.i-collapse-item.is-active')).toHaveLength(1);
});

test('图标位置与自定义图标', async () => {
  const w = mount(Collapse, {
    props: { expandIconPosition: 'left' },
    slots: { default: () => h(CollapseItem, { title: '标题', name: '1', icon: 'icon-add' }, () => '内容') },
    attachTo: document.body
  });
  wrappers.push(w);
  const header = w.get('.i-collapse-item__header');
  expect(header.find('.i-icon').exists()).toBe(true);
  expect(header.element.firstElementChild?.classList.contains('i-icon')).toBe(true);
});

test('title 与 icon 插槽接收 isActive 作用域，Item 暴露 isActive', async () => {
  const w = mount(Collapse, {
    props: { modelValue: ['1'] },
    slots: {
      default: () =>
        h(CollapseItem, { name: '1' }, {
          default: () => '内容',
          title: ({ isActive }: { isActive: boolean }) => (isActive ? '展开标题' : '收起标题'),
          icon: ({ isActive }: { isActive: boolean }) => (isActive ? '箭头向上' : '箭头向下')
        })
    }
  });
  wrappers.push(w);
  const header = w.get('.i-collapse-item__header');
  expect(header.text()).toContain('展开标题');
  expect(header.text()).toContain('箭头向上');
  await w.setProps({ modelValue: [] });
  expect(header.text()).toContain('收起标题');
  expect(header.text()).toContain('箭头向下');

  // 模板引用访问暴露的 isActive（与组件库使用方一致）。
  const itemRef = ref<{ isActive: boolean } | null>(null);
  const Host = defineComponent({
    props: { active: { type: Array as PropType<(string | number)[]>, default: () => ['1'] } },
    setup: (hostProps) => () =>
      h(Collapse, { modelValue: hostProps.active }, () => h(CollapseItem, { name: '1', ref: itemRef }, () => '内容'))
  });
  const host = mount(Host);
  wrappers.push(host);
  expect(itemRef.value?.isActive).toBe(true);
  await host.setProps({ active: [] });
  await flushPromises();
  expect(itemRef.value?.isActive).toBe(false);
  // v-show 折叠时节点保留在 DOM。
  expect(host.find('.i-collapse-item__wrap').exists()).toBe(true);
});
