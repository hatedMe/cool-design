import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../../config-provider';
import TableColumn from '../../table-column';
import Table from '../index';

test('声明式列的编辑器随前缀切换并保留焦点和草稿', async () => {
  const namespace = ref('i');
  const data = ref([{ id: 1, title: 'Alpha' }]);
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: namespace.value }, () => h(Table, {
      data: data.value,
      'onUpdate:data': (rows: typeof data.value) => { data.value = rows; }
    }, {
      default: () => h(TableColumn, { prop: 'title', label: '标题', editable: true, className: 'user-cell' }, {
        header: () => h('strong', '标题插槽')
      })
    }))
  }, { attachTo: document.body });
  try {
    expect(wrapper.get('th strong').text()).toBe('标题插槽');
    const cell = wrapper.get('td.user-cell');
    await cell.trigger('dblclick');
    const editor = cell.get<HTMLInputElement>('input.i-table__editor');
    await editor.setValue('Beta');
    namespace.value = 'acme';
    await nextTick();

    expect(wrapper.get('.acme-table .acme-table__scroll td.user-cell').element).toBe(cell.element);
    expect(cell.get('.acme-table__editor').element).toBe(editor.element);
    expect(document.activeElement).toBe(editor.element);
    expect(editor.element.value).toBe('Beta');
    await editor.trigger('keydown', { key: 'Enter' });
    expect(cell.text()).toBe('Beta');
    expect(data.value).toEqual([{ id: 1, title: 'Beta' }]);
  } finally {
    wrapper.unmount();
  }
});

test('数组列的外置筛选面板响应最近 Provider 并保留复选草稿', async () => {
  const namespace = ref('acme');
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: namespace.value, theme: 'light', size: 'large' }, () =>
      h(ConfigProvider, { theme: 'dark', size: 'small', themeVars: { '--local-filter': 'purple' } }, () => h(Table, {
        data: [{ id: 1, title: 'Alpha' }, { id: 2, title: 'Beta' }],
        appendFilterPanelTo: 'body',
        columns: [{
          prop: 'title',
          label: '标题',
          filterClassName: 'user-filter',
          filters: [{ text: 'Alpha', value: 'Alpha' }],
          filterMethod: (value: unknown, row: Record<string, unknown>) => value === row.title
        }]
      }))
    )
  }, { attachTo: document.body });
  try {
    await wrapper.get('button[aria-label="筛选标题"]').trigger('click');
    const panel = document.querySelector<HTMLElement>('body > .user-filter')!;
    expect(panel.dataset.theme).toBe('dark');
    expect(panel.classList.contains('acme-theme-scope')).toBe(true);
    expect(panel.classList.contains('acme-table__filter-panel')).toBe(true);
    expect(panel.style.getPropertyValue('--acme-control-height')).toBe('28px');
    expect(panel.style.getPropertyValue('--local-filter')).toBe('purple');
    const checkbox = panel.querySelector<HTMLInputElement>('.acme-checkbox input')!;
    checkbox.focus();
    checkbox.click();
    await nextTick();

    namespace.value = 'i';
    await nextTick();
    expect(document.querySelector('body > .i-table__filter-panel.user-filter')).toBe(panel);
    expect(document.activeElement).toBe(checkbox);
    expect(checkbox.checked).toBe(true);
    panel.querySelector<HTMLButtonElement>('.i-table__filter-actions .is-primary')!.click();
    await nextTick();
    expect(wrapper.findAll('tbody tr').map((row) => row.text())).toEqual(['Alpha']);
  } finally {
    wrapper.unmount();
  }
  expect(document.querySelector('body > .user-filter')).toBeNull();
});
