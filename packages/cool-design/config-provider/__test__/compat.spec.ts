import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../index';
import { useConfig, useLocale } from '../context';
import { useNamespace } from '../../../hooks/use-namespace';
import { useZIndex } from '../../../hooks/use-z-index';
import { useEmptyValues } from '../../../hooks/use-empty-values';

test('嵌套配置继承命名空间、空值和层级并响应更新', async () => {
  let nextZIndex!: () => number;
  let getValueOnClear!: () => unknown;
  const Probe = defineComponent({
    setup() {
      const ns = useNamespace('probe');
      const config = useConfig();
      const empty = useEmptyValues();
      getValueOnClear = empty.getValueOnClear;
      nextZIndex = useZIndex().nextZIndex;
      return () =>
        h(
          'span',
          { class: ns.b() },
          `${config.value.zIndex}:${empty.isEmptyValue('none')}:${typeof empty.valueOnClear.value === 'function' ? 'factory' : empty.valueOnClear.value}`
        );
    }
  });
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'custom', zIndex: 7000, emptyValues: ['none'], valueOnClear: null },
    slots: { default: () => h(ConfigProvider, null, { default: () => h(Probe) }) }
  });
  expect(wrapper.find('span').classes()).toContain('custom-probe');
  expect(wrapper.find('span').text()).toBe('7000:true:null');
  const first = nextZIndex();
  expect(first).toBeGreaterThan(7000);
  expect(nextZIndex()).toBe(first + 1);
  await wrapper.setProps({ namespace: 'other', zIndex: 9000, emptyValues: [], valueOnClear: () => undefined });
  expect(wrapper.find('span').classes()).toContain('other-probe');
  expect(wrapper.find('span').text()).toBe('9000:false:factory');
  expect(nextZIndex()).toBeGreaterThan(9000);
  expect(getValueOnClear()).toBeUndefined();
});

test('语言对象支持 Element Plus 路径、嵌套继承和动态切换', async () => {
  const Probe = defineComponent({
    setup() {
      const { t } = useLocale();
      return () => h('span', `${t('el.select.placeholder')}:${t('el.missing', '后备文案')}`);
    }
  });
  const wrapper = mount(ConfigProvider, {
    slots: { default: () => h(ConfigProvider, null, { default: () => h(Probe) }) }
  });
  expect(wrapper.find('span').text()).toBe('请选择:后备文案');
  await wrapper.setProps({ locale: { name: 'en', el: { select: { placeholder: 'Select' } } } });
  expect(wrapper.find('span').text()).toBe('Select:后备文案');
});

test('局部空值配置优先于全局，清空函数可以返回 undefined', async () => {
  const Probe = defineComponent({
    setup() {
      const empty = useEmptyValues({ emptyValues: ['local'], valueOnClear: () => undefined });
      return () =>
        h('button', { onClick: () => expect(empty.getValueOnClear('fallback')).toBeUndefined() },
          `${empty.isEmptyValue('local')}:${empty.isEmptyValue('global')}`);
    }
  });
  const wrapper = mount(ConfigProvider, {
    props: { emptyValues: ['global'], valueOnClear: 'global' },
    slots: { default: () => h(Probe) }
  });
  expect(wrapper.find('button').text()).toBe('true:false');
  await wrapper.find('button').trigger('click');
});
