import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { afterEach, expect, test } from 'vitest';
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
