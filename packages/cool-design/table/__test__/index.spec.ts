import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { expect, test } from 'vitest';
import Table from '../index';
import Pagination from '../../pagination/index';

test('列插槽收到正确记录，排序发出事件，替换数据清除已失效选择', async () => {
  const rows = [
    { id: 1, name: '小明' },
    { id: 2, name: '小红' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'name', title: '姓名', sortable: true },
        { key: 'action', title: '操作', fixed: 'right', width: 100 }
      ],
      rowKey: 'id',
      selection: true
    },
    slots: { action: ({ row }: { row: (typeof rows)[number] }) => h('button', row.name) }
  });
  expect(w.findAll('tbody button')[1].text()).toBe('小红');
  await w.find('thead button').trigger('click');
  expect(w.emitted('sort-change')?.[0]).toEqual([{ key: 'name', order: 'asc' }]);
  await w.findAll('tbody input')[0].setValue(true);
  expect(w.emitted('selection-change')?.[0]).toEqual([[rows[0]]]);
  await w.setProps({ data: [rows[1]] });
  expect(w.emitted('selection-change')?.at(-1)).toEqual([[]]);
});

test('分页在总数缩小时修正页码，改变大小只发出大小事件', async () => {
  const w = mount(Pagination, { props: { total: 100, currentPage: 5, pageSize: 10 } });
  await w.setProps({ total: 12 });
  expect(w.emitted('update:currentPage')?.[0]).toEqual([2]);
  await w.find('select').setValue('20');
  expect(w.emitted('update:pageSize')?.[0]).toEqual([20]);
  expect(w.emitted('update:currentPage')).toHaveLength(1);
});

test('加载期间隔离表格交互，结束后显示统一空态', async () => {
  const w = mount(Table, { props: { loading: true, columns: [{ key: 'id', title: '编号', sortable: true }] } });
  expect(w.find('[role="status"]').exists()).toBe(true);
  await w.get('thead button').trigger('click');
  expect(w.emitted('sort-change')).toBeUndefined();
  await w.setProps({ loading: false });
  expect(w.find('.i-empty').exists()).toBe(true);
  expect(w.find('[role="status"]').exists()).toBe(false);
  w.unmount();
});
