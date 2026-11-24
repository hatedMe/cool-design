import { h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { idKey } from '../../../hooks/use-id';
import Tabs, { TabPane } from '../index';

describe('Tabs 生成的 DOM ID', () => {
  test('同页各实例及数字、字符串、带空白名称的标签和面板独立配对', () => {
    const names = [42, '42', 'with space\t\n', '\uD800'];
    const wrapper = mount({
      render: () => h('div', ['one', 'two'].map((id) =>
        h(Tabs, { id, defaultValue: 42 }, () =>
          names.map((name, index) => h(TabPane, { name, label: String(index) }, () => `panel ${index}`))
        )
      ))
    }, { attachTo: document.body });
    try {
      const ids = new Set<string>();
      for (const id of ['one', 'two']) {
        const root = wrapper.get(`#${id}`);
        const tabs = root.findAll('[role="tab"]');
        const panels = root.findAll('[role="tabpanel"]');
        for (const [index, tab] of tabs.entries()) {
          const panel = panels[index];
          expect(tab.attributes('data-tabs-tab')).toBe(String(names[index]));
          for (const { id } of [tab.element, panel.element]) {
            expect(id).toMatch(/^[^\t\n\f\r ]+$/);
            expect(ids.has(id)).toBe(false);
            ids.add(id);
          }
          expect(document.getElementById(tab.attributes('aria-controls')!)).toBe(panel.element);
          expect(document.getElementById(panel.attributes('aria-labelledby')!)).toBe(tab.element);
        }
      }
    } finally {
      wrapper.unmount();
    }
  });

  test('懒面板挂载后才与页签关联，访问后重排保留节点和 ID', async () => {
    const names = ref([42, '42', 'a b']);
    const content = vi.fn(() => h('button', 'content'));
    const wrapper = mount({
      render: () => h(Tabs, { defaultValue: 42 }, () =>
        names.value.map((name) => h(TabPane, { key: name, name, label: typeof name, lazy: true }, content))
      )
    }, { attachTo: document.body });
    try {
      const stringTab = wrapper.findAll('[role="tab"]')[1];
      expect(stringTab.attributes('aria-controls')).toBeUndefined();
      expect(content).toHaveBeenCalledTimes(1);
      await stringTab.trigger('click');
      const id = stringTab.attributes('aria-controls')!;
      const panel = document.getElementById(id)!;
      expect(panel.getAttribute('aria-labelledby')).toBe(stringTab.element.id);
      expect(wrapper.findComponent(Tabs).emitted('update:modelValue')).toEqual([['42']]);
      names.value = ['a b', '42', 42];
      await nextTick();
      expect(wrapper.findAll('[role="tab"]')[1].element).toBe(stringTab.element);
      expect(stringTab.attributes('aria-controls')).toBe(id);
      expect(document.getElementById(id)).toBe(panel);
    } finally {
      wrapper.unmount();
    }
  });

  test('数组式 Tabs 的活动页签独占共享面板 IDREF，并保留共享节点', async () => {
    const defaultSlot = vi.fn(({ name }: { name: string | number }) => `${typeof name} ${name}`);
    const wrapper = mount(Tabs, {
      props: { defaultValue: 42, panes: [{ name: 42, label: 'Number' }, { name: '42', label: 'String' }] },
      slots: { default: defaultSlot },
      attachTo: document.body
    });
    try {
      const panel = wrapper.get('[role="tabpanel"]').element;
      const [numberTab, stringTab] = wrapper.findAll('[role="tab"]');
      expect(defaultSlot).toHaveBeenCalledTimes(1);
      expect(numberTab.attributes('aria-controls')).toBe(panel.id);
      expect(stringTab.attributes('aria-controls')).toBeUndefined();
      expect(panel.getAttribute('aria-labelledby')).toBe(numberTab.element.id);
      await stringTab.trigger('click');
      expect(wrapper.get('[role="tabpanel"]').element).toBe(panel);
      expect(panel.textContent).toBe('string 42');
      expect(numberTab.attributes('aria-controls')).toBeUndefined();
      expect(document.getElementById(stringTab.attributes('aria-controls')!)).toBe(panel);
      expect(document.getElementById(panel.getAttribute('aria-labelledby')!)).toBe(stringTab.element);
      await wrapper.setProps({ modelValue: 'missing' });
      expect(wrapper.get('[role="tabpanel"]').element).toBe(panel);
      expect(panel.getAttribute('aria-labelledby')).toBeNull();
      expect(stringTab.attributes('aria-controls')).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  test('根和插槽内的显式 ID 优先，清除后恢复原生成 ID', async () => {
    const rootId = ref('caller-tabs');
    const labelId = ref('caller-label');
    const label = vi.fn(() => h('span', { id: labelId.value }, 'label'));
    const panelContent = vi.fn(() => h('span', 'panel'));
    const add = vi.fn(() => h('span', '+'));
    const wrapper = mount({
      render: () => h(Tabs, { id: rootId.value, defaultValue: 'a', addable: true }, {
        default: () => h(TabPane, { name: 'a', id: 'pane-attr' }, { label, default: panelContent }),
        'add-icon': add
      })
    }, { global: { provide: { [idKey]: { prefix: 17, current: 2 } } }, attachTo: document.body });
    try {
      expect([label, panelContent, add].map((slot) => slot.mock.calls.length)).toEqual([1, 1, 1]);
      const tab = wrapper.get('[role="tab"]').element;
      const panel = wrapper.get('[role="tabpanel"]').element;
      const tabId = tab.id;
      const panelId = panel.id;
      rootId.value = tabId;
      labelId.value = panelId;
      await nextTick();
      expect(wrapper.element.id).toBe(tabId);
      expect(tab.querySelector('span[id]')?.id).toBe(panelId);
      expect(tab.id).not.toBe(tabId);
      expect(panel.id).not.toBe(panelId);
      expect(document.getElementById(tab.getAttribute('aria-controls')!)).toBe(panel);
      expect(document.getElementById(panel.getAttribute('aria-labelledby')!)).toBe(tab);
      expect(wrapper.find('#pane-attr').exists()).toBe(false);
      rootId.value = '';
      labelId.value = '';
      await nextTick();
      expect(tab.id).toBe(tabId);
      expect(panel.id).toBe(panelId);
    } finally {
      wrapper.unmount();
    }
  });
});
