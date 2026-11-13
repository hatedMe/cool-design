import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { expect, test } from 'vitest';
import Table from '../index';

type TableExposed = {
  clearSelection(): void;
  getSelectionRows(): object[];
  getHalfSelectionRows(): object[];
  toggleRowSelection(row: object, selected?: boolean): void;
  toggleAllSelection(): void;
  toggleRowExpansion(row: object, expanded?: boolean): void;
  setCurrentRow(row?: object | null): void;
  clearSort(): void;
  sort(prop: string, order: 'ascending' | 'descending' | null): void;
  doLayout(): void;
  scrollTo(options?: { top?: number; left?: number }): void;
  setScrollTop(top: number): void;
  setScrollLeft(left: number): void;
  updateKeyChildren(key: string | number, children: object[]): void;
  setColumnVisibility(key: string, visible: boolean): void;
  moveColumn(fromKey: string, toIndex: number): void;
  getColumnOrder(): string[];
  clearFilter(keys?: string[]): void;
};
const vmOf = (w: { vm: unknown }) => w.vm as unknown as TableExposed;
const sortPayloads = (w: { emitted: (name: string) => unknown[][] | undefined }) =>
  w.emitted('sort-change')?.map((args) => {
    const payload = args[0] as { prop: string; order: string | null; column: { key?: string } };
    return { prop: payload.prop, order: payload.order, columnKey: payload.column?.key };
  });

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
  expect(sortPayloads(w)?.[0]).toEqual({ prop: 'name', order: 'ascending', columnKey: 'name' });
  await w.findAll('tbody input')[0].setValue(true);
  expect(w.emitted('selection-change')?.[0]).toEqual([[rows[0]]]);
  await w.setProps({ data: [rows[1]] });
  expect(w.emitted('selection-change')?.at(-1)).toEqual([[]]);
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

test('支持 prop/label 别名、函数 rowKey，排序循环并自动重排', async () => {
  const rows = [
    { uid: 'a1', age: 30 },
    { uid: 'b2', age: 20 }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { prop: 'uid', label: '编号', sortable: true },
        { key: 'age', title: '年龄' }
      ],
      rowKey: (row: object) => (row as { uid: string }).uid,
      selection: true
    }
  });
  expect(w.find('thead th:nth-child(2)').text()).toContain('编号');
  const sorter = w.get('thead button');
  await sorter.trigger('click');
  await sorter.trigger('click');
  expect(w.find('tbody tr:first-child td:nth-child(2)').text()).toBe('b2');
  await sorter.trigger('click');
  expect(sortPayloads(w)).toEqual([
    { prop: 'uid', order: 'ascending', columnKey: undefined },
    { prop: 'uid', order: 'descending', columnKey: undefined },
    { prop: 'uid', order: null, columnKey: undefined }
  ]);
  expect(w.find('tbody tr:first-child td:nth-child(2)').text()).toBe('a1');
  await w.find('thead input').setValue(true);
  expect(w.emitted('selection-change')?.[0]).toEqual([rows]);
});

test('插槽作用域含 column 和 $index，formatter 收到行列值与序号', async () => {
  const rows = [{ id: 7, age: 30 }];
  const scopes: Array<{ column?: { key?: string }; index?: number; $index?: number }> = [];
  const calls: unknown[][] = [];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'id', title: '编号' },
        {
          key: 'age',
          title: '年龄',
          formatter: (...args: [object, object, unknown, number]) => {
            calls.push([...args]);
            return `${args[2]} 岁`;
          }
        }
      ]
    },
    slots: {
      id: (scope: { column?: { key?: string }; index?: number; $index?: number }) => {
        scopes.push(scope);
        return h('i', 'x');
      }
    }
  });
  expect(w.find('tbody td i').exists()).toBe(true);
  expect(scopes[0]).toMatchObject({ index: 0, $index: 0 });
  expect(scopes[0]?.column?.key).toBe('id');
  expect(w.find('tbody tr:first-child td:last-child').text()).toBe('30 岁');
  expect(calls[0]?.[0]).toEqual(rows[0]);
  expect(calls[0]?.slice(2)).toEqual([30, 0]);
});

test('clearSelection 清空选择，表头开关与条纹边框生效，maxHeight 支持字符串', async () => {
  const rows = [{ id: 1 }, { id: 2 }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'id', title: '编号' }],
      selection: true,
      stripe: true,
      border: true,
      maxHeight: '50vh'
    }
  });
  expect(w.classes()).toContain('is-striped');
  expect(w.classes()).toContain('is-bordered');
  expect((w.find('.i-table__scroll').element as HTMLElement).style.maxHeight).toBe('50vh');
  await w.find('thead input').setValue(true);
  expect(w.emitted('selection-change')?.[0]).toEqual([rows]);
  vmOf(w).clearSelection();
  expect(w.emitted('selection-change')?.at(-1)).toEqual([[]]);
  await w.setProps({ showHeader: false });
  expect(w.find('thead').exists()).toBe(false);
});

test('空态支持自定义文字与插槽，固定列带粘性偏移', async () => {
  const w = mount(Table, {
    props: { data: [], columns: [{ key: 'a', title: '甲' }], emptyText: '暂无数据' }
  });
  expect(w.text()).toContain('暂无数据');
  const custom = mount(Table, {
    props: { data: [], columns: [{ key: 'a', title: '甲' }] },
    slots: { empty: () => h('p', '自定义空态') }
  });
  expect(custom.find('.i-table__empty p').text()).toBe('自定义空态');
  const fixed = mount(Table, {
    props: { data: [{ id: 1, a: 'x' }], columns: [{ key: 'a', title: '甲', fixed: 'left', width: 120 }] }
  });
  const style = (fixed.find('tbody td').element as HTMLElement).style;
  expect(style.position).toBe('sticky');
  expect(style.left).toBe('0px');
});

test('size、fit、tableLayout、height 控制表格外观与滚动区', async () => {
  const w = mount(Table, {
    props: {
      data: [{ id: 1 }],
      columns: [{ key: 'id', title: '编号' }],
      size: 'small',
      fit: false,
      tableLayout: 'auto',
      height: 200
    }
  });
  expect(w.classes()).toContain('is-small');
  expect(w.classes()).not.toContain('is-fit');
  expect((w.find('table').element as HTMLElement).style.tableLayout).toBe('auto');
  const scroll = w.find('.i-table__scroll').element as HTMLElement;
  expect(scroll.style.height).toBe('200px');
  expect(scroll.style.maxHeight).toBe('');
  const large = mount(Table, { props: { data: [], columns: [], size: 'large' } });
  expect(large.classes()).toContain('is-large');
});

test('点击行设置当前行并高亮，setCurrentRow 与 currentRowKey 受控', async () => {
  const rows = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' }
  ];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名' }], highlightCurrentRow: true }
  });
  await w.find('tbody tr:first-child td').trigger('click');
  expect(w.emitted('current-change')?.[0]).toEqual([rows[0], null]);
  expect(w.find('tbody tr:first-child').classes()).toContain('is-current');
  vmOf(w).setCurrentRow(rows[1]);
  expect(w.emitted('current-change')?.[1]).toEqual([rows[1], rows[0]]);
  vmOf(w).setCurrentRow(null);
  expect(w.emitted('current-change')?.[2]).toEqual([null, rows[1]]);
  await nextTick();
  expect(w.find('.is-current').exists()).toBe(false);
  const controlled = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名' }], highlightCurrentRow: true, currentRowKey: 2 }
  });
  expect(controlled.findAll('tbody tr')[1].classes()).toContain('is-current');
  expect(controlled.emitted('current-change')).toBeUndefined();
  await controlled.setProps({ currentRowKey: 1 });
  expect(controlled.emitted('current-change')?.[0]).toEqual([rows[0], rows[1]]);
});

test('index 列渲染序号，支持数字起点与函数', async () => {
  const rows = [{ id: 1 }, { id: 2 }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { type: 'index', title: '序号' },
        { type: 'index', index: 10 },
        { type: 'index', index: (i: number) => `No.${i}` }
      ]
    }
  });
  const cells = w.find('tbody tr:first-child').findAll('td');
  expect(cells.map((td) => td.text())).toEqual(['1', '10', 'No.0']);
  expect(w.find('tbody tr:last-child').findAll('td')[0].text()).toBe('2');
});

test('selection 列支持 selectable，select 与 select-all 事件及选择方法', async () => {
  const rows = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { type: 'selection', selectable: (row: Record<string, unknown>) => row.id !== 2 },
        { key: 'name', title: '姓名' }
      ]
    }
  });
  const boxes = w.findAll('tbody input');
  expect((boxes[1].element as HTMLInputElement).disabled).toBe(true);
  await boxes[0].setValue(true);
  expect(w.emitted('select')?.[0]).toEqual([[rows[0]], rows[0]]);
  expect(w.emitted('row-click')).toBeUndefined();
  expect(vmOf(w).getSelectionRows()).toEqual([rows[0]]);
  await w.find('thead input').setValue(false);
  expect(w.emitted('select-all')?.[0]).toEqual([[]]);
  await w.find('thead input').setValue(true);
  expect(w.emitted('select-all')?.[1]).toEqual([[rows[0]]]);
  vmOf(w).toggleRowSelection(rows[1]);
  expect(w.emitted('selection-change')?.at(-1)).toEqual([rows]);
  vmOf(w).toggleAllSelection();
  expect(w.emitted('selection-change')?.at(-1)).toEqual([[]]);
});

test('custom 排序只发事件，sortMethod、sortBy、sortOrders 自定义排序', async () => {
  const rows = [
    { id: 1, name: 'b', age: 30 },
    { id: 2, name: 'a', age: 20 }
  ];
  const custom = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名', sortable: 'custom' }] }
  });
  await custom.get('thead button').trigger('click');
  expect(sortPayloads(custom)?.[0]).toEqual({ prop: 'name', order: 'ascending', columnKey: 'name' });
  expect(custom.find('tbody tr:first-child td').text()).toBe('b');
  const method = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名', sortable: true, sortMethod: (a, b) => a.age - b.age }]
    }
  });
  await method.get('thead button').trigger('click');
  expect(method.find('tbody tr:first-child td').text()).toBe('a');
  const by = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名', sortable: true, sortBy: 'age' }] }
  });
  await by.get('thead button').trigger('click');
  expect(by.find('tbody tr:first-child td').text()).toBe('a');
  const orders = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名', sortable: true, sortOrders: ['descending', null] }]
    }
  });
  await orders.get('thead button').trigger('click');
  expect(sortPayloads(orders)?.[0]).toEqual({ prop: 'name', order: 'descending', columnKey: 'name' });
  expect(orders.find('tbody tr:first-child td').text()).toBe('b');
});

test('clearSort 与 sort 方法编程式控制排序', async () => {
  const rows = [
    { id: 1, age: 30 },
    { id: 2, age: 20 }
  ];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'age', title: '年龄', sortable: true }] }
  });
  vmOf(w).sort('age', 'ascending');
  expect(sortPayloads(w)?.[0]).toEqual({ prop: 'age', order: 'ascending', columnKey: 'age' });
  await nextTick();
  expect(w.find('tbody tr:first-child td').text()).toBe('20');
  vmOf(w).clearSort();
  expect(sortPayloads(w)?.[1]).toEqual({ prop: 'age', order: null, columnKey: 'age' });
  await nextTick();
  expect(w.find('tbody tr:first-child td').text()).toBe('30');
  vmOf(w).sort('missing', 'ascending');
  expect(w.emitted('sort-change')).toHaveLength(2);
});

test('多选过滤经确认生效，重置清空，columnKey 命名载荷', async () => {
  const rows = [
    { id: 1, status: '启用' },
    { id: 2, status: '停用' },
    { id: 3, status: '启用' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        {
          key: 'status',
          title: '状态',
          columnKey: 'statusCol',
          filters: [
            { text: '启用', value: '启用' },
            { text: '停用', value: '停用' }
          ],
          filterMethod: (value: unknown, row: Record<string, unknown>) => row.status === value
        }
      ]
    }
  });
  await w.get('.i-table__filter-trigger').trigger('click');
  expect(w.find('.i-table__filter-panel').exists()).toBe(true);
  await w.findAll('.i-table__filter-panel input')[0].setValue(true);
  await w.findAll('.i-table__filter-actions button')[1].trigger('click');
  expect(w.emitted('filter-change')?.[0]).toEqual([{ statusCol: ['启用'] }]);
  expect(w.findAll('tbody tr')).toHaveLength(2);
  expect(w.get('.i-table__filter-trigger').classes()).toContain('is-active');
  await w.get('.i-table__filter-trigger').trigger('click');
  await w.findAll('.i-table__filter-actions button')[0].trigger('click');
  expect(w.emitted('filter-change')?.[1]).toEqual([{}]);
  expect(w.findAll('tbody tr')).toHaveLength(3);
});

test('单选过滤点击即生效，filteredValue 受控初始过滤', async () => {
  const rows = [
    { id: 1, status: '启用' },
    { id: 2, status: '停用' }
  ];
  const column = {
    key: 'status',
    title: '状态',
    filterMultiple: false,
    filters: [
      { text: '启用', value: '启用' },
      { text: '停用', value: '停用' }
    ],
    filterMethod: (value: unknown, row: Record<string, unknown>) => row.status === value
  };
  const w = mount(Table, { props: { data: rows, columns: [column] } });
  await w.get('.i-table__filter-trigger').trigger('click');
  await w.findAll('.i-table__filter-option')[1].trigger('click');
  expect(w.emitted('filter-change')?.[0]).toEqual([{ status: ['停用'] }]);
  expect(w.findAll('tbody tr')).toHaveLength(1);
  const controlled = mount(Table, {
    props: { data: rows, columns: [{ ...column, filteredValue: ['启用'] }] }
  });
  expect(controlled.findAll('tbody tr')).toHaveLength(1);
  expect(controlled.find('tbody td').text()).toBe('启用');
});

test('展开行切换内容并发出 expand-change，toggleRowExpansion 受控', async () => {
  const rows = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { type: 'expand', key: 'detail' },
        { key: 'name', title: '姓名' }
      ]
    },
    slots: { detail: ({ row }: { row: (typeof rows)[number] }) => h('p', `详情-${row.name}`) }
  });
  await w.findAll('.i-table__expand-toggle')[0].trigger('click');
  expect(w.emitted('expand-change')?.[0]).toEqual([rows[0], [rows[0]]]);
  expect(w.find('.i-table__expanded-row p').text()).toBe('详情-甲');
  expect(w.emitted('row-click')).toBeUndefined();
  await w.findAll('.i-table__expand-toggle')[0].trigger('click');
  expect(w.find('.i-table__expanded-row').exists()).toBe(false);
  vmOf(w).toggleRowExpansion(rows[1], true);
  await nextTick();
  expect(w.find('.i-table__expanded-row p').text()).toBe('详情-乙');
});

test('合计行默认求和与自定义 summaryMethod', async () => {
  const rows = [
    { id: 1, name: '甲', age: 30 },
    { id: 2, name: '乙', age: 20 }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'name', title: '姓名' },
        { key: 'age', title: '年龄' }
      ],
      showSummary: true
    }
  });
  const cells = w.find('tfoot tr').findAll('td');
  expect(cells.map((td) => td.text())).toEqual(['合计', '50']);
  const custom = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'name', title: '姓名' },
        { key: 'age', title: '年龄' }
      ],
      showSummary: true,
      sumText: '总计',
      summaryMethod: () => ['共计', '2 人']
    }
  });
  expect(
    custom
      .find('tfoot tr')
      .findAll('td')
      .map((td) => td.text())
  ).toEqual(['共计', '2 人']);
});

test('spanMethod 合并与隐藏单元格', async () => {
  const rows = [
    { id: 1, a: 'x', b: 'y' },
    { id: 2, a: 'p', b: 'q' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'a', title: '甲' },
        { key: 'b', title: '乙' }
      ],
      spanMethod: ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => {
        if (rowIndex === 0 && columnIndex === 0) return [1, 2];
        if (rowIndex === 0 && columnIndex === 1) return [0, 0];
        return undefined;
      }
    }
  });
  const firstRowCells = w.findAll('tbody tr')[0].findAll('td');
  expect(firstRowCells).toHaveLength(1);
  expect(firstRowCells[0].attributes('colspan')).toBe('2');
  expect(w.findAll('tbody tr')[1].findAll('td')).toHaveLength(2);
});

test('行列点击、双击、右键与表头点击事件载荷', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'name', title: '姓名' },
        { key: 'id', title: '编号' }
      ]
    }
  });
  const cell = w.find('tbody tr:first-child td');
  await cell.trigger('click');
  const cellClick = w.emitted('cell-click')?.[0] as unknown[];
  expect(cellClick[0]).toEqual(rows[0]);
  expect((cellClick[1] as { key?: string }).key).toBe('name');
  expect((cellClick[2] as HTMLElement).tagName).toBe('TD');
  expect(w.emitted('row-click')?.[0]?.slice(0, 2)).toEqual([rows[0], expect.objectContaining({ key: 'name' })]);
  await cell.trigger('dblclick');
  expect(w.emitted('cell-dblclick')).toHaveLength(1);
  expect(w.emitted('row-dblclick')).toHaveLength(1);
  await cell.trigger('contextmenu');
  expect(w.emitted('row-contextmenu')?.[0]?.slice(0, 2)).toEqual([rows[0], expect.objectContaining({ key: 'name' })]);
  await w.find('thead th:nth-child(2)').trigger('click');
  expect(w.emitted('header-click')?.[0]?.[0]).toEqual(expect.objectContaining({ key: 'id' }));
});

test('溢出提示、列类名与表头插槽、附加插槽', async () => {
  const rows = [{ id: 1, name: '很长很长的名字' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'name', title: '姓名', showOverflowTooltip: true, className: 'cell-x', labelClassName: 'head-x' },
        { key: 'id', title: '编号' }
      ]
    },
    slots: {
      'name-header': () => h('em', '自定义表头'),
      append: () => h('p', '附加内容')
    }
  });
  const overflow = w.find('tbody td .i-table__cell-text');
  expect(overflow.exists()).toBe(true);
  const tipTrigger = w.find('tbody td .i-tooltip__trigger');
  await tipTrigger.trigger('mouseenter');
  const tip = document.body.querySelector('.i-tooltip');
  expect(tip?.textContent).toBe('很长很长的名字');
  await tipTrigger.trigger('mouseleave');
  document.body.querySelectorAll('.i-tooltip').forEach((el) => el.remove());
  expect(w.find('tbody td.cell-x').exists()).toBe(true);
  expect(w.find('thead th.head-x em').text()).toBe('自定义表头');
  expect(w.find('.i-table__scroll > p').text()).toBe('附加内容');
  const tableLevel = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名' }], showOverflowTooltip: true },
    slots: { name: () => h('b', '插槽优先') }
  });
  expect(tableLevel.find('tbody td b').text()).toBe('插槽优先');
  expect(tableLevel.find('.i-table__cell-text').exists()).toBe(false);
});

test('fixed 支持布尔值，property 是 prop 的别名', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [{ property: 'name', label: '姓名', fixed: true, width: 120 }]
    }
  });
  expect(w.find('thead th').text()).toBe('姓名');
  expect(w.find('tbody td').text()).toBe('甲');
  const style = (w.find('tbody td').element as HTMLElement).style;
  expect(style.position).toBe('sticky');
  expect(style.left).toBe('0px');
});

test('rowClassName 支持字符串与函数', async () => {
  const rows = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' }
  ];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名' }], rowClassName: 'row-x' }
  });
  expect(w.findAll('tbody tr')[0].classes()).toContain('row-x');
  const fn = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名' }],
      rowClassName: ({ row, rowIndex }: { row: object; rowIndex: number }) =>
        `${(row as { id: number }).id === 1 ? 'first' : ''} r${rowIndex}`
    }
  });
  expect(fn.findAll('tbody tr')[0].classes()).toContain('first');
  expect(fn.findAll('tbody tr')[1].classes()).toContain('r1');
});

test('expandRowKeys 受控展开', async () => {
  const rows = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { type: 'expand', key: 'detail' },
        { key: 'name', title: '姓名' }
      ],
      expandRowKeys: [1]
    },
    slots: { detail: ({ row }: { row: (typeof rows)[number] }) => h('p', `详情-${row.name}`) }
  });
  expect(w.findAll('.i-table__expanded-row')).toHaveLength(1);
  expect(w.find('.i-table__expanded-row p').text()).toBe('详情-甲');
  await w.setProps({ expandRowKeys: [2] });
  expect(w.find('.i-table__expanded-row p').text()).toBe('详情-乙');
});

test('reserveSelection 在替换数据时保留选择', async () => {
  const row1 = { id: 1, name: '甲' };
  const row2 = { id: 2, name: '乙' };
  const w = mount(Table, {
    props: {
      data: [row1, row2],
      columns: [{ key: 'name', title: '姓名' }],
      selection: true,
      reserveSelection: true
    }
  });
  await w.findAll('tbody input')[0].setValue(true);
  await w.setProps({ data: [row2] });
  expect(w.emitted('selection-change')).toHaveLength(1);
  await w.setProps({ data: [row1, row2] });
  expect(vmOf(w).getSelectionRows()).toEqual([row1]);
});

test('静态树形渲染、缩进与展开收起', async () => {
  const rows = [
    {
      id: 1,
      name: '父',
      children: [
        { id: 11, name: '子一' },
        { id: 12, name: '子二' }
      ]
    },
    { id: 2, name: '单' }
  ];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名' }] }
  });
  expect(w.findAll('tbody > tr')).toHaveLength(2);
  await w.find('.i-table__expand-toggle').trigger('click');
  expect(w.emitted('expand-change')?.[0]?.[0]).toEqual(rows[0]);
  const bodyRows = w.findAll('tbody > tr');
  expect(bodyRows).toHaveLength(4);
  expect(bodyRows[1].text()).toBe('子一');
  expect((bodyRows[1].find('.i-table__indent').element as HTMLElement).style.width).toBe('16px');
  await w.find('.i-table__expand-toggle').trigger('click');
  expect(w.findAll('tbody > tr')).toHaveLength(2);
});

test('树形选择级联与半选，checkStrictly 关闭级联', async () => {
  const child1 = { id: 11, name: '子一' };
  const child2 = { id: 12, name: '子二' };
  const parent = { id: 1, name: '父', items: [child1, child2] };
  const props = {
    data: [parent],
    columns: [{ type: 'selection' as const }, { key: 'name', title: '姓名' }],
    treeProps: { children: 'items' },
    expandRowKeys: [1]
  };
  const w = mount(Table, { props });
  expect(w.findAll('tbody > tr')).toHaveLength(3);
  await w.findAll('tbody input')[0].setValue(true);
  expect(
    vmOf(w)
      .getSelectionRows()
      .map((r) => (r as { id: number }).id)
      .sort()
  ).toEqual([1, 11, 12]);
  await w.findAll('tbody input')[1].setValue(false);
  expect(
    vmOf(w)
      .getSelectionRows()
      .map((r) => (r as { id: number }).id)
  ).toEqual([12]);
  expect(vmOf(w).getHalfSelectionRows()).toEqual([parent]);
  expect(w.findAll('tbody input')[0].element.indeterminate).toBe(true);
  const strict = mount(Table, { props: { ...props, treeProps: { children: 'items', checkStrictly: true } } });
  await strict.findAll('tbody input')[0].setValue(true);
  expect(strict.emitted('selection-change')?.[0]).toEqual([[{ ...parent }]]);
  expect(vmOf(strict).getHalfSelectionRows()).toEqual([]);
});

test('懒加载树按需加载，updateKeyChildren 更新子节点', async () => {
  const levels: number[] = [];
  const w = mount(Table, {
    props: {
      data: [{ id: 1, name: '父', hasChildren: true }],
      columns: [{ key: 'name', title: '姓名' }],
      lazy: true,
      load: (row: object, node: { level: number }, resolve: (children: object[]) => void) => {
        levels.push(node.level);
        resolve([{ id: 11, name: '懒子' }]);
      }
    }
  });
  await w.find('.i-table__expand-toggle').trigger('click');
  expect(levels).toEqual([0]);
  expect(w.findAll('tbody > tr')).toHaveLength(2);
  expect(w.findAll('tbody > tr')[1].text()).toBe('懒子');
  expect(w.emitted('expand-change')?.[0]?.[0]).toEqual({ id: 1, name: '父', hasChildren: true });
  vmOf(w).updateKeyChildren(1, [{ id: 12, name: '新子' }]);
  await nextTick();
  expect(w.findAll('tbody > tr')[1].text()).toBe('新子');
});

test('多级表头分组渲染，叶子列可排序', async () => {
  const rows = [
    { id: 1, a: 'b', b: 'x', c: 'p' },
    { id: 2, a: 'a', b: 'y', c: 'q' }
  ];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        {
          title: '分组',
          children: [
            { key: 'a', title: '甲', sortable: true },
            { key: 'b', title: '乙' }
          ]
        },
        { key: 'c', title: '丙' }
      ]
    }
  });
  const headRows = w.findAll('thead tr');
  expect(headRows).toHaveLength(2);
  expect(headRows[0].findAll('th')[0].attributes('colspan')).toBe('2');
  expect(headRows[0].findAll('th')[1].attributes('rowspan')).toBe('2');
  expect(
    w
      .findAll('tbody tr')[0]
      .findAll('td')
      .map((td) => td.text())
  ).toEqual(['b', 'x', 'p']);
  await w.find('thead button').trigger('click');
  expect(
    w
      .findAll('tbody tr')[0]
      .findAll('td')
      .map((td) => td.text())
  ).toEqual(['a', 'y', 'q']);
});

test('表头右键、单元格右键、悬停与滚动事件', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, { props: { data: rows, columns: [{ key: 'name', title: '姓名' }] } });
  await w.find('thead th').trigger('contextmenu');
  expect(w.emitted('header-contextmenu')?.[0]?.[0]).toEqual(expect.objectContaining({ key: 'name' }));
  const cell = w.find('tbody td');
  await cell.trigger('contextmenu');
  expect(w.emitted('cell-contextmenu')?.[0]?.slice(0, 2)).toEqual([rows[0], expect.objectContaining({ key: 'name' })]);
  expect(w.emitted('row-contextmenu')).toHaveLength(1);
  await cell.trigger('mouseenter');
  await cell.trigger('mouseleave');
  expect(w.emitted('cell-mouse-enter')?.[0]?.slice(0, 2)).toEqual([rows[0], expect.objectContaining({ key: 'name' })]);
  expect(w.emitted('cell-mouse-leave')).toHaveLength(1);
  const scroll = w.find('.i-table__scroll');
  (scroll.element as HTMLElement).scrollTop = 30;
  (scroll.element as HTMLElement).scrollLeft = 10;
  await scroll.trigger('scroll');
  expect(w.emitted('scroll')?.[0]).toEqual([{ scrollLeft: 10, scrollTop: 30 }]);
});

test('滚动方法与 doLayout 兼容方法', async () => {
  const w = mount(Table, { props: { data: [{ id: 1 }], columns: [{ key: 'id', title: '编号' }] } });
  expect(() => vmOf(w).doLayout()).not.toThrow();
  vmOf(w).scrollTo({ top: 25, left: 5 });
  expect((w.find('.i-table__scroll').element as HTMLElement).scrollTop).toBe(25);
  expect((w.find('.i-table__scroll').element as HTMLElement).scrollLeft).toBe(5);
  vmOf(w).setScrollTop(7);
  vmOf(w).setScrollLeft(8);
  expect((w.find('.i-table__scroll').element as HTMLElement).scrollTop).toBe(7);
  expect((w.find('.i-table__scroll').element as HTMLElement).scrollLeft).toBe(8);
});

test('字符串列宽原样渲染，固定偏移回退到数值', async () => {
  const w = mount(Table, {
    props: {
      data: [{ id: 1, a: 'x', b: 'y' }],
      columns: [
        { key: 'a', title: '甲', width: '10%', minWidth: 100, fixed: 'left' },
        { key: 'b', title: '乙', width: '120px', fixed: 'left' }
      ]
    }
  });
  const cells = w.findAll('tbody tr')[0].findAll('td');
  expect((cells[0].element as HTMLElement).style.width).toBe('10%');
  expect((cells[1].element as HTMLElement).style.width).toBe('120px');
  expect((cells[1].element as HTMLElement).style.left).toBe('100px');
});

test('拖拽表头调整列宽并发出 header-dragend', async () => {
  const columns = [
    { key: 'a', title: '甲', width: 100 },
    { key: 'b', title: '乙', width: 100 }
  ];
  const w = mount(Table, { props: { data: [{ id: 1, a: 'x', b: 'y' }], columns } });
  const handles = w.findAll('.i-table__resize-handle');
  expect(handles).toHaveLength(1);
  await handles[0].trigger('mousedown', { clientX: 100 });
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 130 }));
  await nextTick();
  expect((w.findAll('tbody td')[0].element as HTMLElement).style.width).toBe('130px');
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 130 }));
  const emitted = w.emitted('header-dragend')?.[0] as unknown[];
  expect(emitted[0]).toBe(130);
  expect(emitted[1]).toBe(100);
  expect((emitted[2] as { key?: string }).key).toBe('a');
  const all = mount(Table, {
    props: { data: [{ id: 1 }], columns, allowDragLastColumn: true }
  });
  expect(all.findAll('.i-table__resize-handle')).toHaveLength(2);
  const off = mount(Table, { props: { data: [{ id: 1 }], columns, resizable: false } });
  expect(off.findAll('.i-table__resize-handle')).toHaveLength(0);
  const colOff = mount(Table, {
    props: {
      data: [{ id: 1 }],
      columns: [
        { key: 'a', title: '甲', resizable: false },
        { key: 'b', title: '乙' }
      ]
    }
  });
  expect(colOff.findAll('.i-table__resize-handle')).toHaveLength(0);
});

test('溢出提示支持 tooltip-formatter 自定义内容', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        {
          key: 'name',
          title: '姓名',
          showOverflowTooltip: true,
          tooltipFormatter: ({ cellValue }: { cellValue: unknown }) => `姓名：${cellValue}`
        }
      ]
    }
  });
  await w.find('tbody td .i-tooltip__trigger').trigger('mouseenter');
  expect(document.body.querySelector('.i-tooltip')?.textContent).toBe('姓名：甲');
  document.body.querySelectorAll('.i-tooltip').forEach((el) => el.remove());
});

test('双击可编辑单元格，确认发出 cell-edit 与 update:data', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名', editable: true }] }
  });
  await w.find('tbody td').trigger('dblclick');
  const editor = w.find('tbody td input.i-table__editor');
  expect(editor.exists()).toBe(true);
  expect((editor.element as HTMLInputElement).value).toBe('甲');
  await editor.setValue('乙');
  await editor.trigger('keydown', { key: 'Enter' });
  const edit = w.emitted('cell-edit')?.[0]?.[0] as { value: unknown; oldValue: unknown; index: number };
  expect(edit).toMatchObject({ value: '乙', oldValue: '甲', index: 0 });
  expect(w.emitted('update:data')?.[0]).toEqual([[{ id: 1, name: '乙' }]]);
  await w.setProps({ data: [{ id: 1, name: '乙' }] });
  expect(w.find('tbody td').text()).toBe('乙');
});

test('编辑中按 Escape 取消，不发出更新', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名', editable: true }] }
  });
  await w.find('tbody td').trigger('dblclick');
  const editor = w.get('tbody td input.i-table__editor');
  await editor.setValue('乙');
  await editor.trigger('keydown', { key: 'Escape' });
  expect(w.emitted('cell-edit-cancel')).toHaveLength(1);
  expect(w.emitted('cell-edit')).toBeUndefined();
  expect(w.emitted('update:data')).toBeUndefined();
  expect(w.find('tbody td input.i-table__editor').exists()).toBe(false);
});

test('列隐藏与编程式显隐，不改动输入 columns', async () => {
  const columns = [
    { key: 'a', title: '甲' },
    { key: 'b', title: '乙', visible: false },
    { key: 'c', title: '丙' }
  ];
  const w = mount(Table, { props: { data: [{ id: 1, a: 'x', b: 'y', c: 'z' }], columns } });
  expect(w.findAll('thead th').map((th) => th.text())).toEqual(['甲', '丙']);
  expect(w.findAll('tbody td')).toHaveLength(2);
  vmOf(w).setColumnVisibility('b', true);
  await nextTick();
  expect(w.findAll('thead th').map((th) => th.text())).toEqual(['甲', '乙', '丙']);
  vmOf(w).setColumnVisibility('a', false);
  await nextTick();
  expect(w.findAll('thead th').map((th) => th.text())).toEqual(['乙', '丙']);
  expect(columns.map((c) => c.key)).toEqual(['a', 'b', 'c']);
});

test('moveColumn 移动顶层列并可查询顺序', async () => {
  const columns = [
    { key: 'a', title: '甲' },
    { key: 'b', title: '乙' },
    { key: 'c', title: '丙' }
  ];
  const w = mount(Table, { props: { data: [{ id: 1, a: 'x', b: 'y', c: 'z' }], columns } });
  expect(vmOf(w).getColumnOrder()).toEqual(['a', 'b', 'c']);
  vmOf(w).moveColumn('a', 2);
  await nextTick();
  expect(w.findAll('thead th').map((th) => th.text())).toEqual(['乙', '丙', '甲']);
  expect(w.findAll('tbody td').map((td) => td.text())).toEqual(['y', 'z', 'x']);
  expect(vmOf(w).getColumnOrder()).toEqual(['b', 'c', 'a']);
  expect(columns.map((c) => c.key)).toEqual(['a', 'b', 'c']);
  vmOf(w).moveColumn('missing', 0);
  await nextTick();
  expect(w.findAll('thead th').map((th) => th.text())).toEqual(['乙', '丙', '甲']);
});

test('分组列隐藏叶子后收缩，全隐藏时分组消失', async () => {
  const w = mount(Table, {
    props: {
      data: [{ id: 1, a: 'x', b: 'y', c: 'z' }],
      columns: [
        {
          title: '分组',
          children: [
            { key: 'a', title: '甲' },
            { key: 'b', title: '乙' }
          ]
        },
        { key: 'c', title: '丙' }
      ]
    }
  });
  expect(w.findAll('thead tr')[0].findAll('th')[0].attributes('colspan')).toBe('2');
  vmOf(w).setColumnVisibility('a', false);
  await nextTick();
  const head = w.findAll('thead tr')[0].findAll('th');
  expect(head[0].attributes('colspan')).toBeUndefined();
  expect(head[0].text()).toBe('分组');
  vmOf(w).setColumnVisibility('b', false);
  await nextTick();
  expect(
    w
      .findAll('thead tr')[0]
      .findAll('th')
      .map((th) => th.text())
  ).toEqual(['丙']);
});

test('拖拽手柄支持键盘调整并暴露无障碍属性', async () => {
  const w = mount(Table, {
    props: {
      data: [{ id: 1, a: 'x', b: 'y' }],
      columns: [
        { key: 'a', title: '甲', width: 100 },
        { key: 'b', title: '乙' }
      ]
    }
  });
  const handle = w.get('.i-table__resize-handle');
  expect(handle.attributes('role')).toBe('separator');
  expect(handle.attributes('aria-label')).toBe('调整甲列宽');
  expect(handle.attributes('aria-valuenow')).toBe('100');
  await handle.trigger('keydown', { key: 'ArrowRight' });
  expect((w.findAll('tbody td')[0].element as HTMLElement).style.width).toBe('110px');
  await handle.trigger('keydown', { key: 'ArrowLeft' });
  expect((w.findAll('tbody td')[0].element as HTMLElement).style.width).toBe('100px');
  expect(w.emitted('header-dragend')).toHaveLength(2);
  expect(w.emitted('header-dragend')?.[0]?.slice(0, 2)).toEqual([110, 100]);
});

test('自定义 editor 渲染函数接管编辑并发出 cell-edit-start', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        {
          key: 'name',
          title: '姓名',
          editable: true,
          editor: (params: { value: string; update: (v: string) => void; confirm: () => void }) =>
            h(
              'button',
              {
                class: 'custom-confirm',
                onClick: () => {
                  params.update(`新-${params.value}`);
                  params.confirm();
                }
              },
              'ok'
            )
        }
      ]
    }
  });
  await w.find('tbody td').trigger('dblclick');
  expect(w.emitted('cell-edit-start')?.[0]?.[0]).toMatchObject({ index: 0 });
  expect(w.find('tbody td input.i-table__editor').exists()).toBe(false);
  await w.get('tbody td .custom-confirm').trigger('click');
  expect(w.emitted('cell-edit')?.[0]?.[0]).toMatchObject({ value: '新-甲', oldValue: '甲' });
  expect(w.emitted('update:data')?.[0]).toEqual([[{ id: 1, name: '新-甲' }]]);
});

test('编辑插槽优先于默认输入框', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: { data: rows, columns: [{ key: 'name', title: '姓名', editable: true }] },
    slots: {
      'name-edit': (params: { cancel: () => void }) =>
        h('button', { class: 'slot-cancel', onClick: () => params.cancel() }, 'cancel')
    }
  });
  await w.find('tbody td').trigger('dblclick');
  expect(w.find('tbody td .slot-cancel').exists()).toBe(true);
  await w.get('tbody td .slot-cancel').trigger('click');
  expect(w.emitted('cell-edit-cancel')).toHaveLength(1);
  expect(w.emitted('update:data')).toBeUndefined();
});

test('溢出提示支持对象配置并透传 Tooltip 选项', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名' }],
      showOverflowTooltip: { placement: 'bottom', popperClass: 'tip-x' }
    }
  });
  await w.find('tbody td .i-tooltip__trigger').trigger('mouseenter');
  const tip = document.body.querySelector('.i-tooltip');
  expect(tip?.textContent).toBe('甲');
  expect(tip?.classList.contains('tip-x')).toBe(true);
  document.body.querySelectorAll('.i-tooltip').forEach((el) => el.remove());
});

test('行列样式与类名支持字符串和函数', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名' }],
      rowStyle: { background: 'rgb(1, 2, 3)' },
      cellClassName: 'cell-y',
      cellStyle: () => ({ color: 'rgb(4, 5, 6)' }),
      headerRowClassName: 'head-row',
      headerRowStyle: { fontSize: '15px' },
      headerCellClassName: 'head-cell',
      headerCellStyle: () => ({ textAlign: 'center' })
    }
  });
  expect((w.find('tbody tr').element as HTMLElement).style.background).toBe('rgb(1, 2, 3)');
  expect(w.find('tbody td.cell-y').exists()).toBe(true);
  expect((w.find('tbody td').element as HTMLElement).style.color).toBe('rgb(4, 5, 6)');
  expect(w.find('thead tr.head-row').exists()).toBe(true);
  expect((w.find('thead tr').element as HTMLElement).style.fontSize).toBe('15px');
  expect(w.find('thead th.head-cell').exists()).toBe(true);
  expect((w.find('thead th').element as HTMLElement).style.textAlign).toBe('center');
});

test('defaultExpandAll 展开全部，defaultSort 初始化排序，indent 自定义缩进', async () => {
  const rows = [{ id: 1, name: '父', children: [{ id: 11, name: '子' }] }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名' }],
      defaultExpandAll: true,
      indent: 24
    }
  });
  expect(w.findAll('tbody > tr')).toHaveLength(2);
  expect((w.find('.i-table__indent').element as HTMLElement).style.width).toBe('24px');
  expect(w.emitted('expand-change')).toBeUndefined();
  const sorted = mount(Table, {
    props: {
      data: [
        { id: 1, age: 30 },
        { id: 2, age: 20 }
      ],
      columns: [{ key: 'age', title: '年龄', sortable: true }],
      defaultSort: { prop: 'age', order: 'ascending' }
    }
  });
  expect(sorted.find('tbody tr:first-child td').text()).toBe('20');
  expect(sorted.find('thead th').attributes('aria-sort')).toBe('ascending');
  expect(sorted.emitted('sort-change')).toBeUndefined();
});

test('selectOnIndeterminate 为 false 时半选点击全选框清空', async () => {
  const rows = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' }
  ];
  const props = {
    data: rows,
    columns: [{ key: 'name', title: '姓名' }],
    selection: true,
    selectOnIndeterminate: false
  };
  const w = mount(Table, { props });
  await w.findAll('tbody input')[0].setValue(true);
  await w.find('thead input').setValue(true);
  expect(w.emitted('select-all')?.[0]).toEqual([[]]);
  const def = mount(Table, { props: { ...props, selectOnIndeterminate: true } });
  await def.findAll('tbody input')[0].setValue(true);
  await def.find('thead input').setValue(true);
  expect(def.emitted('select-all')?.[0]).toEqual([rows]);
});

test('clearFilter 清空全部或指定列筛选', async () => {
  const rows = [
    { id: 1, a: 'x', b: 'p' },
    { id: 2, a: 'y', b: 'q' }
  ];
  const filterMethod = (value: unknown, row: Record<string, unknown>) => row.a === value || row.b === value;
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { key: 'a', title: '甲', filters: [{ text: 'x', value: 'x' }], filterMethod, filteredValue: ['x'] },
        { key: 'b', title: '乙', filters: [{ text: 'p', value: 'p' }], filterMethod, filteredValue: ['p'] }
      ]
    }
  });
  expect(w.findAll('tbody tr')).toHaveLength(1);
  vmOf(w).clearFilter(['b']);
  await nextTick();
  expect(w.findAll('tbody tr')).toHaveLength(1);
  expect(w.emitted('filter-change')?.[0]).toEqual([{ a: ['x'] }]);
  vmOf(w).clearFilter();
  await nextTick();
  expect(w.findAll('tbody tr')).toHaveLength(2);
  expect(w.emitted('filter-change')?.[1]).toEqual([{}]);
});

test('筛选弹层支持位置、类名与自定义图标', async () => {
  const rows = [{ id: 1, status: '启用' }];
  const column = {
    key: 'status',
    title: '状态',
    filters: [{ text: '启用', value: '启用' }],
    filterMethod: (value: unknown, row: Record<string, unknown>) => row.status === value,
    filterPlacement: 'top' as const,
    filterClassName: 'panel-x',
    filterIcon: () => h('i', 'F')
  };
  const w = mount(Table, { props: { data: rows, columns: [column] } });
  expect(w.find('.i-table__filter-trigger i').text()).toBe('F');
  await w.get('.i-table__filter-trigger').trigger('click');
  const panel = w.get('.i-table__filter-panel');
  expect(panel.classes()).toContain('is-top');
  expect(panel.classes()).toContain('panel-x');
  const slotted = mount(Table, {
    props: { data: rows, columns: [{ key: 'status', title: '状态', filters: [{ text: '启用', value: '启用' }] }] },
    slots: { 'status-filter-icon': () => h('em', 'S') }
  });
  expect(slotted.find('.i-table__filter-trigger em').text()).toBe('S');
});

test('滚动条与弹性布局属性渲染对应类名与 tabindex', async () => {
  const w = mount(Table, {
    props: {
      data: [{ id: 1 }],
      columns: [{ key: 'id', title: '编号' }],
      scrollbarAlwaysOn: true,
      scrollbarTabindex: 5,
      flexible: true,
      nativeScrollbar: false
    }
  });
  expect(w.classes()).toContain('is-flexible');
  const scroll = w.find('.i-table__scroll');
  expect(scroll.classes()).toContain('has-always-scrollbar');
  expect(scroll.classes()).toContain('has-custom-scrollbar');
  expect(scroll.attributes('tabindex')).toBe('5');
});

test('preserveExpandedContent 保留收起的展开行', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [
        { type: 'expand', key: 'detail' },
        { key: 'name', title: '姓名' }
      ],
      preserveExpandedContent: true
    },
    slots: { detail: () => h('p', '详情') }
  });
  const expanded = w.find('.i-table__expanded-row');
  expect(expanded.exists()).toBe(true);
  expect((expanded.element as HTMLElement).style.display).toBe('none');
  await w.get('.i-table__expand-toggle').trigger('click');
  expect((w.find('.i-table__expanded-row').element as HTMLElement).style.display).not.toBe('none');
});

test('列级 reserveSelection 与表格级等效保留选择', async () => {
  const row1 = { id: 1, name: '甲' };
  const w = mount(Table, {
    props: {
      data: [row1, { id: 2, name: '乙' }],
      columns: [
        { type: 'selection', reserveSelection: true },
        { key: 'name', title: '姓名' }
      ]
    }
  });
  await w.findAll('tbody input')[0].setValue(true);
  await w.setProps({ data: [{ id: 2, name: '乙' }] });
  expect(w.emitted('selection-change')).toHaveLength(1);
  await w.setProps({ data: [row1, { id: 2, name: '乙' }] });
  expect(vmOf(w).getSelectionRows()).toEqual([row1]);
});

test('树形级联跳过不可选节点', async () => {
  const child1 = { id: 11, name: '子一' };
  const child2 = { id: 12, name: '子二' };
  const parent = { id: 1, name: '父', children: [child1, child2] };
  const w = mount(Table, {
    props: {
      data: [parent],
      columns: [
        { type: 'selection', selectable: (row: Record<string, unknown>) => row.id !== 12 },
        { key: 'name', title: '姓名' }
      ],
      expandRowKeys: [1]
    }
  });
  await w.findAll('tbody input')[0].setValue(true);
  expect(
    vmOf(w)
      .getSelectionRows()
      .map((r) => (r as { id: number }).id)
      .sort()
  ).toEqual([1, 11]);
  expect(vmOf(w).getHalfSelectionRows()).toEqual([]);
});

test('拖拽中根节点禁用文本选择，结束后恢复', async () => {
  const w = mount(Table, {
    props: {
      data: [{ id: 1, a: 'x', b: 'y' }],
      columns: [
        { key: 'a', title: '甲', width: 100 },
        { key: 'b', title: '乙', width: 100 }
      ]
    }
  });
  await w.get('.i-table__resize-handle').trigger('mousedown', { clientX: 100 });
  expect(w.classes()).toContain('is-resizing');
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: 100 }));
  await nextTick();
  expect(w.classes()).not.toContain('is-resizing');
});

test('tooltipEffect 切换悬浮层主题', async () => {
  const rows = [{ id: 1, name: '甲' }];
  const w = mount(Table, {
    props: {
      data: rows,
      columns: [{ key: 'name', title: '姓名', showOverflowTooltip: true }],
      tooltipEffect: 'light'
    }
  });
  await w.find('tbody td .i-tooltip__trigger').trigger('mouseenter');
  expect(document.body.querySelector('.i-tooltip--light')).not.toBeNull();
  document.body.querySelectorAll('.i-tooltip').forEach((el) => el.remove());
});
