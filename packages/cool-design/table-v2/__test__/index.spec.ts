import { mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import { expect, test, vi } from 'vitest';
import TableV2, { type TableV2SortBy } from '../index';

const columns = [
  { key: 'id', dataKey: 'id', title: '编号', width: 100, sortable: true },
  { key: 'name', dataKey: 'name', title: '姓名', width: 160 }
];
const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `行${i + 1}` }));

test('虚拟窗口只渲染可见行，滚动后窗口移动', async () => {
  const w = mount(TableV2, {
    props: { columns, data: rows(1000), width: 400, height: 400, headerHeight: 40, rowHeight: 40, overscan: 3 }
  });
  expect((w.find('.i-table-v2__body').element as HTMLElement).style.height).toBe('40000px');
  const first = w.findAll('.i-table-v2__row.is-body');
  expect(first.length).toBe(12);
  expect(first[0].text()).toContain('行1');
  const scroll = w.find('.i-table-v2__scroll');
  (scroll.element as HTMLElement).scrollTop = 4000;
  await scroll.trigger('scroll');
  const moved = w.findAll('.i-table-v2__row.is-body');
  expect(moved[0].text()).toContain('行97');
  expect(w.emitted('scroll')?.[0]).toEqual([{ scrollLeft: 0, scrollTop: 4000 }]);
});

test('表头排序循环并发出 column-sort，filter 过滤根行', async () => {
  const w = mount(TableV2, { props: { columns, data: rows(5), height: 400 } });
  const header = w.findAll('.i-table-v2__cell.is-header')[0];
  await header.trigger('click');
  expect(w.emitted('column-sort')?.[0]).toEqual([{ key: 'id', order: 'asc' }]);
  await header.trigger('click');
  expect(w.findAll('.i-table-v2__row.is-body')[0].text()).toContain('行5');
  expect(w.emitted('column-sort')?.[1]).toEqual([{ key: 'id', order: 'desc' }]);
  await header.trigger('click');
  expect(w.emitted('column-sort')?.[2]).toEqual([{ key: 'id', order: null }]);
  expect(w.findAll('.i-table-v2__row.is-body')[0].text()).toContain('行1');
  const filtered = mount(TableV2, {
    props: { columns, data: rows(5), height: 400, filter: (row: object) => (row as { id: number }).id > 3 }
  });
  expect(filtered.findAll('.i-table-v2__row.is-body')).toHaveLength(2);
});

test('替换和清空 sortBy 会同步表头及行顺序', async () => {
  const [first, second, third] = rows(3);
  const data = [second, first, third];
  const w = mount(TableV2, { props: { columns, data } });
  const header = w.find('[role="columnheader"]');

  await w.setProps({ sortBy: { key: 'id', order: 'desc' } });
  expect(header.attributes('aria-sort')).toBe('descending');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行3');

  await w.setProps({ sortBy: undefined });
  expect(header.attributes('aria-sort')).toBe('none');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行2');
  expect(w.emitted('column-sort')).toBeUndefined();
});

test('异步加载目标列后应用已有的 sortBy', async () => {
  const sortBy = { key: 'id', order: 'desc' } as const;
  const w = mount(TableV2, { props: { columns: [], data: rows(3), sortBy } });

  await w.setProps({ columns });

  expect(w.find('[role="columnheader"]').attributes('aria-sort')).toBe('descending');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行3');
});

test('不可点击排序的列仍应用外部排序', async () => {
  const sortBy = { key: 'id', order: 'desc' } as const;
  const w = mount(TableV2, {
    props: { columns: [{ ...columns[0], sortable: false }], data: rows(3), sortBy }
  });

  expect(w.find('.i-table-v2__row.is-body').text()).toBe('3');
  await w.find('[role="columnheader"]').trigger('click');
  expect(w.emitted('column-sort')).toBeUndefined();
});

test('原地修改 sortBy 的 key 和 order 会同步表头及行顺序', async () => {
  const sortBy = reactive<TableV2SortBy>({ key: 'id', order: 'asc' });
  const sortableColumns = [columns[0], { ...columns[1], sortable: true }];
  const data = [
    { id: 1, name: 'Zulu' },
    { id: 2, name: 'Alpha' }
  ];
  const w = mount(TableV2, { props: { columns: sortableColumns, data, sortBy } });
  const [idHeader, nameHeader] = w.findAll('[role="columnheader"]');

  sortBy.key = 'name';
  await nextTick();
  expect(idHeader.attributes('aria-sort')).toBe('none');
  expect(nameHeader.attributes('aria-sort')).toBe('ascending');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('Alpha');

  sortBy.order = 'desc';
  await nextTick();
  expect(nameHeader.attributes('aria-sort')).toBe('descending');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('Zulu');
});

test('sortState 优先于 sortBy，移除后同步最新 sortBy', async () => {
  const sortBy = reactive<TableV2SortBy>({ key: 'id', order: 'asc' });
  const sortState = reactive<TableV2SortBy>({ key: 'id', order: 'desc' });
  const w = mount(TableV2, { props: { columns, data: rows(3), sortBy, sortState } });
  const header = w.find('[role="columnheader"]');

  expect(header.attributes('aria-sort')).toBe('descending');
  sortBy.order = 'desc';
  sortState.order = 'asc';
  await nextTick();
  expect(header.attributes('aria-sort')).toBe('ascending');

  sortBy.order = 'asc';
  await nextTick();
  sortBy.order = 'desc';
  await nextTick();
  expect(header.attributes('aria-sort')).toBe('ascending');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行1');

  await w.setProps({ sortState: undefined });
  expect(header.attributes('aria-sort')).toBe('descending');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行3');
});

test('排序列移除后恢复时不会沿用旧排序', async () => {
  const w = mount(TableV2, { props: { columns, data: rows(3), sortBy: { key: 'id', order: 'desc' } } });
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行3');

  await w.setProps({ columns: [columns[1]] });
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行1');

  await w.setProps({ columns });
  expect(w.find('[role="columnheader"]').attributes('aria-sort')).toBe('none');
  expect(w.find('.i-table-v2__row.is-body').text()).toContain('行1');
});

test('树形展开收起并发出 expanded-rows-change，受控 keys 生效', async () => {
  const data = [{ id: 1, name: '父', children: [{ id: 11, name: '子' }] }];
  const w = mount(TableV2, { props: { columns, data, height: 400 } });
  expect(w.findAll('.i-table-v2__row.is-body')).toHaveLength(1);
  await w.find('.i-table-v2__expand-toggle').trigger('click');
  expect(w.findAll('.i-table-v2__row.is-body')).toHaveLength(2);
  expect(w.emitted('expanded-rows-change')?.[0]?.[1]).toEqual([1]);
  await w.find('.i-table-v2__expand-toggle').trigger('click');
  expect(w.findAll('.i-table-v2__row.is-body')).toHaveLength(1);
  const controlled = mount(TableV2, { props: { columns, data, height: 400, expandedRowKeys: [1] } });
  expect(controlled.findAll('.i-table-v2__row.is-body')).toHaveLength(2);
});

test('行事件处理器、插槽、空态与滚动方法', async () => {
  const onClick = vi.fn();
  const w = mount(TableV2, {
    props: { columns, data: rows(2), height: 400, rowEventHandlers: { onClick } },
    slots: {
      cell: ({ rowData }: { rowData: { name: string } }) => h('b', rowData.name),
      'header-cell': ({ column }: { column: { title?: string } }) => h('em', column.title ?? '')
    }
  });
  expect(w.find('.i-table-v2__cell b').text()).toBe('行1');
  expect(w.find('.i-table-v2__cell.is-header em').text()).toBe('编号');
  await w.findAll('.i-table-v2__row.is-body')[1].trigger('click');
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onClick.mock.calls[0][0]).toMatchObject({ rowData: { id: 2 }, rowIndex: 1 });
  (w.vm as unknown as { scrollTo(options?: { top?: number; left?: number }): void }).scrollTo({ top: 50 });
  expect((w.find('.i-table-v2__scroll').element as HTMLElement).scrollTop).toBe(50);
  const empty = mount(TableV2, {
    props: { columns, data: [], height: 400 },
    slots: { empty: () => h('p', '自定义空态') }
  });
  expect(empty.find('.i-table-v2__empty p').text()).toBe('自定义空态');
  const footer = mount(TableV2, {
    props: { columns, data: rows(2), height: 400, footerHeight: 36 },
    slots: { footer: () => h('span', '合计栏') }
  });
  expect(footer.find('.i-table-v2__footer').text()).toBe('合计栏');
});

test('固定列粘性定位并累积偏移', async () => {
  const fixed = [
    { key: 'a', dataKey: 'a', title: '甲', width: 100, fixed: 'left' as const },
    { key: 'b', dataKey: 'b', title: '乙', width: 50, fixed: 'left' as const },
    { key: 'c', dataKey: 'c', title: '丙', width: 200 },
    { key: 'd', dataKey: 'd', title: '丁', width: 80, fixed: 'right' as const }
  ];
  const w = mount(TableV2, {
    props: { columns: fixed, data: [{ a: 1, b: 2, c: 3, d: 4 }], width: 300, height: 200 }
  });
  const headCells = w.findAll('.i-table-v2__cell.is-header');
  const styleOf = (i: number) => (headCells[i].element as HTMLElement).style;
  expect(styleOf(0).position).toBe('sticky');
  expect(styleOf(0).left).toBe('0px');
  expect(styleOf(1).left).toBe('100px');
  expect(styleOf(2).position).toBe('');
  expect(styleOf(3).position).toBe('sticky');
  expect(styleOf(3).right).toBe('0px');
  const bodyCells = w.findAll('.i-table-v2__row.is-body')[0].findAll('.i-table-v2__cell');
  expect((bodyCells[1].element as HTMLElement).style.left).toBe('100px');
  expect((bodyCells[3].element as HTMLElement).style.right).toBe('0px');
});

test('fixedColumns 按模式自动固定首尾列', () => {
  const cols = [
    { key: 'a', dataKey: 'a', title: '甲', width: 100 },
    { key: 'b', dataKey: 'b', title: '乙', width: 50 },
    { key: 'c', dataKey: 'c', title: '丙', width: 200 },
    { key: 'd', dataKey: 'd', title: '丁', width: 80 }
  ];
  const left = mount(TableV2, {
    props: { columns: cols, data: [{ a: 1, b: 2, c: 3, d: 4 }], width: 300, height: 200, fixedColumns: 2 }
  });
  const leftCells = left.findAll('.i-table-v2__cell.is-header');
  const leftStyle = (i: number) => (leftCells[i].element as HTMLElement).style;
  expect(leftStyle(0).position).toBe('sticky');
  expect(leftStyle(0).left).toBe('0px');
  expect(leftStyle(1).position).toBe('sticky');
  expect(leftStyle(1).left).toBe('100px');
  expect(leftStyle(2).position).toBe('');
  expect(leftStyle(3).position).toBe('');

  const right = mount(TableV2, {
    props: {
      columns: cols,
      data: [{ a: 1, b: 2, c: 3, d: 4 }],
      width: 300,
      height: 200,
      fixedColumns: 1,
      fixedColumnsMode: 'right'
    }
  });
  const rightCells = right.findAll('.i-table-v2__cell.is-header');
  const rightStyle = (i: number) => (rightCells[i].element as HTMLElement).style;
  expect(rightStyle(0).position).toBe('');
  expect(rightStyle(2).position).toBe('');
  expect(rightStyle(3).position).toBe('sticky');
  expect(rightStyle(3).right).toBe('0px');
});

test('动态行高计算偏移与窗口', async () => {
  const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
  const w = mount(TableV2, {
    props: {
      columns,
      data,
      height: 400,
      headerHeight: 40,
      overscan: 0,
      rowHeight: ({ rowIndex }: { rowIndex: number }) => (rowIndex % 2 === 0 ? 30 : 70)
    }
  });
  expect((w.find('.i-table-v2__body').element as HTMLElement).style.height).toBe('500px');
  const shown = w.findAll('.i-table-v2__row.is-body');
  expect(shown).toHaveLength(8);
  expect((shown[0].element as HTMLElement).style.top).toBe('0px');
  expect((shown[1].element as HTMLElement).style.top).toBe('30px');
  expect((shown[1].element as HTMLElement).style.height).toBe('70px');
});

test('cache 覆盖 overscan，sortState 受控排序', async () => {
  const w = mount(TableV2, {
    props: { columns, data: rows(100), width: 400, height: 400, headerHeight: 40, rowHeight: 40, cache: 0 }
  });
  expect(w.findAll('.i-table-v2__row.is-body')).toHaveLength(9);
  const sorted = mount(TableV2, {
    props: { columns, data: rows(3), height: 400, sortState: { key: 'id', order: 'desc' } }
  });
  expect(sorted.findAll('.i-table-v2__row.is-body')[0].text()).toContain('行3');
  await sorted.setProps({ sortState: { key: 'id', order: 'asc' } });
  expect(sorted.findAll('.i-table-v2__row.is-body')[0].text()).toContain('行1');
});

test('滚动到底触发 end-reached，scrollToRow 定位', async () => {
  const w = mount(TableV2, {
    props: { columns, data: rows(100), width: 400, height: 400, headerHeight: 40, rowHeight: 40 }
  });
  const scroll = w.find('.i-table-v2__scroll');
  (scroll.element as HTMLElement).scrollTop = 3640;
  await scroll.trigger('scroll');
  expect(w.emitted('end-reached')).toHaveLength(1);
  await scroll.trigger('scroll');
  expect(w.emitted('end-reached')).toHaveLength(1);
  (w.vm as unknown as { scrollToRow(i: number, align?: string): void }).scrollToRow(50, 'start');
  expect((scroll.element as HTMLElement).scrollTop).toBe(40 + 50 * 40);
});

test('rowClass 与 cellProps 自定义行列样式', async () => {
  const w = mount(TableV2, {
    props: {
      columns,
      data: rows(2),
      height: 400,
      rowClass: ({ rowIndex }: { rowIndex: number }) => (rowIndex === 0 ? 'row-first' : ''),
      cellProps: ({ column }: { column: { key: string } }) =>
        column.key === 'name' ? { class: 'cell-name', style: { color: 'rgb(1, 2, 3)' } } : undefined
    }
  });
  expect(w.findAll('.i-table-v2__row.is-body')[0].classes()).toContain('row-first');
  const cell = w.findAll('.i-table-v2__row.is-body')[0].findAll('.i-table-v2__cell')[1];
  expect(cell.classes()).toContain('cell-name');
  expect((cell.element as HTMLElement).style.color).toBe('rgb(1, 2, 3)');
});
