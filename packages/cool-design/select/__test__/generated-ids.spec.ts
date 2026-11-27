import { h, ref } from 'vue';
import { mount, type DOMWrapper } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Select from '..';
import SelectOption from '../../select-option';
import SelectOptionGroup from '../../select-option-group';
import ConfigProvider from '../../config-provider';
import Form from '../../form';
import FormItem from '../../form-item';
import Input from '../../input';
import { idKey } from '../../../hooks/use-id';

const options = Array.from({ length: 16 }, (_, index) => ({
  value: index,
  label: `Option ${index}`,
  disabled: index === 1
}));

const getActive = (combo: DOMWrapper<Element>) => {
  const id = combo.attributes('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

test('两个应用与同一应用的多个 Select 只引用自己的高亮选项', async () => {
  const create = (prefix: number) => mount(ConfigProvider, {
    attachTo: document.body,
    global: { provide: { [idKey as symbol]: { prefix, current: 0 } } },
    slots: { default: () => ['a', 'b'].map(label => h(Select, {
      teleported: false,
      options: [{ value: 0, label: `${prefix}${label}` }]
    })) }
  });
  const apps = [create(13), create(23)];
  try {
    for (const app of apps) {
      for (const select of app.findAllComponents(Select)) {
        await select.get('[role="combobox"]').trigger('click');
      }
    }
    for (const app of apps) {
      for (const select of app.findAllComponents(Select)) {
        const option = select.get('[role="option"]');
        expect(option.element.id).toBeTruthy();
        expect(getActive(select.get('[role="combobox"]'))).toBe(option.element);
      }
    }
  } finally {
    apps.forEach(app => app.unmount());
  }
});

test.each([false, true])('关闭 Select 时移除高亮引用（persistent=%s）', async (persistent) => {
  const select = mount(Select, { props: { teleported: false, persistent, options }, attachTo: document.body });
  try {
    const combo = select.get('[role="combobox"]');
    await combo.trigger('click');
    expect(getActive(combo)).toBe(select.get('[role="option"]').element);
    await combo.trigger('keydown', { key: 'Escape' });
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
    expect(select.find('[role="listbox"]').exists()).toBe(persistent);
  } finally {
    select.unmount();
  }
});

test('内置选项被加载态、空列表或自定义面板替换时不输出高亮引用', async () => {
  const custom = ref(false);
  const loading = ref(false);
  const records = ref(options);
  const wrapper = mount({
    setup: () => () => h(Select, {
      options: records.value, loading: loading.value, teleported: false
    }, custom.value ? { dropdown: () => h('div', { role: 'option' }, 'Custom') } : {})
  }, { attachTo: document.body });
  try {
    const combo = wrapper.get('[role="combobox"]');
    await combo.trigger('click');
    expect(getActive(combo)).toBe(wrapper.get('[role="option"]').element);
    loading.value = true;
    await wrapper.vm.$nextTick();
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
    loading.value = false;
    records.value = [];
    await wrapper.vm.$nextTick();
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
    records.value = options;
    custom.value = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[role="option"]').text()).toBe('Custom');
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
  } finally {
    wrapper.unmount();
  }
});

test('虚拟窗口内的全局高亮索引能解析到实际渲染项', async () => {
  const select = mount(Select, { attachTo: document.body, props: {
    options, modelValue: 6, virtualized: true, height: 34, teleported: false
  } });
  try {
    const combo = select.get('[role="combobox"]');
    await combo.trigger('click');
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
    const panel = select.get('[role="listbox"]');
    panel.element.scrollTop = 4 * 34;
    await panel.trigger('scroll');
    expect(getActive(combo)).toBe(panel.get('[data-value="6"]').element);
    await combo.trigger('keydown', { key: 'ArrowDown' });
    expect(getActive(combo)).toBe(panel.get('[data-value="7"]').element);
    await combo.trigger('keydown', { key: 'Enter' });
    expect(select.emitted('change')).toEqual([[7]]);
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
  } finally {
    select.unmount();
  }
});

test.each([false, true])('虚拟面板反向滚动时保留当前高亮状态（全部禁用=%s）', async (allDisabled) => {
  const select = mount(Select, {
    attachTo: document.body,
    props: {
      options: options.slice(0, 4).map(option => ({ ...option, disabled: allDisabled })),
      virtualized: true,
      teleported: false,
      popperStyle: { display: 'flex', flexDirection: 'column-reverse', maxHeight: '45px', overflowY: 'auto' }
    }
  });
  try {
    const combo = select.get('[role="combobox"]');
    await combo.trigger('keydown', { key: 'ArrowDown' });
    const panel = select.get('[role="listbox"]');
    const firstOption = panel.get('[data-value="0"]').element;
    panel.element.scrollTop = -10;
    await panel.trigger('scroll');
    if (allDisabled) {
      expect(combo.attributes('aria-activedescendant')).toBeUndefined();
      expect(panel.find('.is-highlighted').exists()).toBe(false);
    } else {
      expect(getActive(combo)).toBe(firstOption);
    }
    expect(panel.get('[data-value="0"]').element).toBe(firstOption);
    expect(select.emitted('popup-scroll')).toEqual([[{ scrollTop: -10, scrollLeft: 0 }]]);
  } finally {
    select.unmount();
  }
});

test('合法显式触发器和同字段兄弟 ID 优先，动态前缀保持高亮选项节点', async () => {
  const triggerId = ref<string>();
  const siblingId = ref<string>();
  const ns = ref('demo');
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: ns.value }, () =>
      h(Form, { model: {} }, () => h(FormItem, { label: '字段', error: '错误' }, () => [
        h(Input, { id: siblingId.value }),
        h(Select, { id: triggerId.value, 'aria-describedby': 'hint', teleported: false }, () =>
          h(SelectOptionGroup, { label: '组' }, () => [
            h(SelectOption, { value: false, label: '布尔' }),
            h(SelectOption, { value: 'false', label: '文本' })
          ]))
      ]))
    )
  }, { attachTo: document.body, global: { provide: { [idKey as symbol]: { prefix: 13, current: 0 } } } });
  try {
    const combo = wrapper.get('[role="combobox"]');
    await combo.trigger('click');
    const active = getActive(combo);
    expect(active).toBe(wrapper.get('[role="option"]').element);
    triggerId.value = active!.id;
    await wrapper.vm.$nextTick();
    expect(combo.element.id).toBe(triggerId.value);
    expect(active!.id).not.toBe(triggerId.value);
    expect(getActive(combo)).toBe(active);
    siblingId.value = active!.id;
    await wrapper.vm.$nextTick();
    expect(document.getElementById(siblingId.value)).toBe(wrapper.get('input').element);
    expect(getActive(combo)).toBe(active);
    expect(combo.attributes('aria-describedby')?.split(' ').slice(0, 1)).toEqual(['hint']);
    expect(document.getElementById(combo.attributes('aria-describedby').split(' ')[1])?.textContent).toBe('错误');
    ns.value = '3d';
    await wrapper.vm.$nextTick();
    expect(getActive(combo)).toBe(active);
    expect(active!.id).toMatch(/^3d-/);
    expect(wrapper.findAll('select option').map(option => option.attributes('value'))).toEqual(['b:false', 's:false']);
  } finally {
    wrapper.unmount();
  }
});
