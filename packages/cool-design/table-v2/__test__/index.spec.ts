import { mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import { expect, test, vi } from 'vitest';
import ConfigProvider from '../../config-provider';
import TableV2, { type TableV2Instance, type TableV2SortBy } from '../index';

const columns = [
  { key: 'id', dataKey: 'id', title: '编号', width: 100, sortable: true },
  { key: 'name', dataKey: 'name', title: '姓名', width: 160 }
];
const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `行${i + 1}` }));

test.each(['i', '3d'])('动态行测量跟随最近 Provider 切换至 %s 命名空间', async (namespace) => {
  const observers = new Map<Element, ResizeObserverCallback>();
  class Observer {
    constructor(private callback: ResizeObserverCallback) {}
    observe(target: Element) { observers.set(target, this.callback); }
    disconnect() {}
    unobserve(target: Element) { observers.delete(target); }
  }
  vi.stubGlobal('ResizeObserver', Observer);
  // jsdom 缺少布局，通过行的可见矩形启用真实测量查询。
  const rects = vi.spyOn(HTMLElement.prototype, 'getClientRects')
    .mockReturnValue([new DOMRect(0, 0, 100, 80)] as unknown as DOMRectList);
  const w = mount(ConfigProvider, {
    attachTo: document.body,
    props: { namespace: 'acme' },
    slots: {
      default: () => h(TableV2, {
        columns,
        data: rows(1),
        estimatedRowHeight: 50,
        rowClass: 'user-row'
      })
    }
  });
  try {
    await nextTick();
    const row = w.get<HTMLElement>('.user-row');
    expect(row.classes()).toContain('acme-table-v2__row');
    const measure = row.get<HTMLElement>('.acme-table-v2__measure');
    measure.element.style.height = '80px';
    await w.setProps({ namespace });
    await nextTick();
    expect(row.classes()).toContain(`${namespace}-table-v2__row`);
    expect(row.get(`[class~="${namespace}-table-v2__measure"]`).element).toBe(measure.element);
    expect(row.element.style.height).toBe('80px');
    measure.element.style.height = '96px';
    observers.get(measure.element)?.([{ target: measure.element } as ResizeObserverEntry], {} as ResizeObserver);
    await nextTick();
    expect(row.element.style.height).toBe('96px');
  } finally {
    w.unmount();
    rects.mockRestore();
    vi.unstubAllGlobals();
  }
});

test('默认表头和正文行均为 50px，显式 40px 保持旧尺寸', async () => {
  const w = mount(TableV2, { props: { columns, data: rows(2), fixedData: [{ id: 0 }] } });
  const heights = () => w.findAll<HTMLElement>('.i-table-v2__row').map((row) => row.element.style.height);
  expect(heights()).toEqual(['50px', '50px', '50px', '50px']);
  await w.setProps({ headerHeight: 40, rowHeight: 40 });
  expect(heights()).toEqual(['40px', '40px', '40px', '40px']);
});

test('动态正文行使用估值，固定行仍使用 rowHeight 函数', async () => {
  const w = mount(TableV2, {
    props: {
      columns, data: rows(10), fixedData: [{ id: 0 }], headerHeight: 0,
      rowHeight: ({ rowIndex }) => rowIndex === 1 ? 80 : 30, estimatedRowHeight: 56
    }
  });
  const body = w.get<HTMLElement>('.i-table-v2__body');
  expect(body.element.style.height).toBe('560px');
  expect(w.get<HTMLElement>('.is-fixed').element.style.height).toBe('30px');
  await w.setProps({ estimatedRowHeight: 0 });
  expect(body.element.style.height).toBe('350px');
});

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
  expect(moved[0].text()).toContain('行98');
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
  expect(w.emitted('expanded-rows-change')?.[0]).toEqual([[1]]);
  expect(w.emitted('expanded-row-data-change')?.[0]).toEqual([data, [1]]);
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
  expect(onClick.mock.calls[0][0]).toMatchObject({ rowData: { id: 2 }, rowIndex: 1, rowKey: 2 });
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
  expect(w.emitted('end-reached')?.[0]).toEqual([0]);
  await scroll.trigger('scroll');
  expect(w.emitted('end-reached')).toHaveLength(1);
  (w.vm as unknown as { scrollToRow(i: number, align?: string): void }).scrollToRow(50, 'start');
  expect((scroll.element as HTMLElement).scrollTop).toBe(50 * 40);
});

test('列渲染器优先于插槽，取值器和路径读取提供完整上下文', async () => {
  const clicked = vi.fn();
  const rowData = { id: 5, profile: [{ name: '路径数据' }], 'literal.name': '旧字段', '': '空字段名' };
  const getter = vi.fn(() => '取值器数据');
  const cellRenderer = vi.fn(({ cellData }) => h('button', { onClick: clicked }, cellData));
  const headerCellRenderer = vi.fn(({ headerIndex }) => h('b', `表头 ${headerIndex}`));
  const cols = [
    { ...columns[0], dataGetter: getter, cellRenderer, headerCellRenderer },
    { ...columns[1], dataKey: 'profile[0].name' },
    { ...columns[1], key: 'literal', dataKey: 'literal.name' },
    { ...columns[1], key: 'missing', dataKey: 'profile[5].name' },
    { key: Symbol('action'), width: 60, cellRenderer: ({ cellData }: { cellData: unknown }) =>
      h('strong', cellData === undefined ? '操作' : '错误取值') }
  ];
  const w = mount(TableV2, {
    props: { columns: cols, data: [rowData], headerHeight: [20, 30], useIsScrolling: true },
    slots: {
      cell: ({ column, cellData }) => column.key === 'id' ? '低优先级' : h('i', String(cellData ?? '空字段')),
      'header-cell': ({ column, headerIndex }) => column.key === 'id' ? '低优先级' : h('em', `旧表头 ${headerIndex}`)
    }
  });
  expect(w.findAll('[role="columnheader"] b').map((node) => node.text())).toEqual(['表头 0', '表头 1']);
  expect(w.findAll('[role="columnheader"] em').map((node) => node.text())).toContain('旧表头 1');
  const cell = w.get('[role="gridcell"] button');
  expect(cell.text()).toBe('取值器数据');
  await cell.trigger('click');
  expect(clicked).toHaveBeenCalledOnce();
  expect(w.findAll('[role="gridcell"] i').map((node) => node.text())).toEqual(['路径数据', '旧字段', '空字段']);
  expect(w.get('[role="gridcell"] strong').text()).toBe('操作');
  const context = { columns: cols, column: cols[0], columnIndex: 0 };
  expect(getter).toHaveBeenCalledWith({ ...context, rowData, rowIndex: 0 });
  expect(cellRenderer).toHaveBeenCalledWith({
    ...context, rowData, rowIndex: 0, cellData: '取值器数据', class: expect.any(String), isScrolling: false
  });
  expect(headerCellRenderer).toHaveBeenCalledWith(expect.objectContaining({ ...context, headerIndex: 1, class: expect.any(String) }));
  expect(w.get('[role="columnheader"]').text()).toContain('↕');
});

test('多行表头和固定数据合并附加属性，固定数据与空态正确组合', async () => {
  const headClick = vi.fn();
  const headerProps = vi.fn(({ headerIndex }) => ({ 'data-header': headerIndex, class: 'extra-header' }));
  const rowProps = vi.fn(({ rowIndex }) => ({ 'data-index': rowIndex, style: { color: 'red', height: '999px' } }));
  const rowClass = vi.fn(({ rowIndex }) => `row-${rowIndex}`);
  const headerCellProps = vi.fn(({ columnIndex, headerIndex }) => ({ 'data-cell': `${headerIndex}:${columnIndex}`, onClick: headClick }));
  const header = vi.fn(({ cells, headerIndex }) => headerIndex === 0 ? cells : [...cells, h('span', '第二层')]);
  const fixedData = [{ id: 10, name: '汇总', children: [{ id: 11 }] }, { id: 20, name: '小计' }];
  const w = mount(TableV2, {
    props: {
      columns, fixedData, headerHeight: [20, 30], rowHeight: 25, defaultExpandedRowKeys: [10],
      headerProps, headerClass: 'custom-header', headerCellProps, rowProps, rowClass,
      cellProps: { 'data-custom': 'cell' }
    },
    slots: { header, overlay: () => h('p', '覆盖层'), empty: () => h('p', '没有正文') }
  });
  expect(w.get('[data-header="0"]').classes()).toEqual(expect.arrayContaining(['extra-header', 'custom-header']));
  expect(w.get<HTMLElement>('[data-header="0"]').element.style.height).toBe('20px');
  expect(w.get<HTMLElement>('[data-header="1"]').element.style.height).toBe('30px');
  expect(w.get('[data-header="1"]').text()).toContain('第二层');
  expect(headerProps).toHaveBeenCalledWith({ columns, headerIndex: 1 });
  expect(header).toHaveBeenCalledWith({ columns, headerIndex: 1, cells: expect.any(Array) });
  expect(headerCellProps).toHaveBeenCalledWith({ columns, column: columns[0], columnIndex: 0, headerIndex: 0 });
  await w.get('[data-cell="0:0"]').trigger('click');
  expect(headClick).toHaveBeenCalledOnce();
  expect(w.emitted('column-sort')?.[0]).toEqual([{ key: 'id', order: 'asc' }]);
  expect(w.get('[data-index="-1"]').classes()).toContain('row--1');
  expect(w.get<HTMLElement>('[data-index="-2"]').element.style.height).toBe('25px');
  expect(w.get('[data-index="-2"] [data-custom]').attributes('role')).toBe('gridcell');
  expect(w.get('[data-index="-1"]').find('.i-table-v2__expand-toggle').exists()).toBe(false);
  expect(rowClass).toHaveBeenCalledWith({ columns, rowData: fixedData[1], rowIndex: -2 });
  expect(w.text()).toContain('覆盖层');
  expect(w.text()).not.toContain('没有正文');
  await w.setProps({ fixedData: [], headerProps: { 'data-custom-header': 'yes' }, headerCellProps: { title: '说明' } });
  expect(w.get('[data-custom-header] [role="columnheader"]').attributes('title')).toBe('说明');
  expect(w.text()).toContain('没有正文');
  expect(w.text()).toContain('覆盖层');
});

test('默认展开和受控展开优先级及事件顺序', async () => {
  const child = { id: Symbol('子行'), name: '子', children: [{ id: 111, name: '孙' }] };
  const root = { id: 1, name: '父', children: [child] };
  const data = [root];
  const uncontrolled = mount(TableV2, { props: { columns, data, defaultExpandedRowKeys: [1] } });
  expect(uncontrolled.text()).toContain('子');
  const received: string[] = [];
  const controlled = mount(TableV2, {
    props: {
      columns, data, defaultExpandedRowKeys: [1], expandedRowKeys: [],
      'onUpdate:expandedRowKeys': () => received.push('update'),
      onRowExpand: () => received.push('row-expand'),
      onExpandedRowsChange: () => received.push('expanded-rows-change'),
      onExpandedRowDataChange: () => received.push('expanded-row-data-change')
    }
  });
  expect(controlled.findAll('.i-table-v2__row.is-body')).toHaveLength(1);
  await controlled.get('.i-table-v2__expand-toggle').trigger('click');
  expect(controlled.findAll('.i-table-v2__row.is-body')).toHaveLength(1);
  expect(received).toEqual(['update', 'row-expand', 'expanded-rows-change', 'expanded-row-data-change']);
  await controlled.setProps({ expandedRowKeys: [1] });
  await controlled.findAll('.i-table-v2__expand-toggle')[1].trigger('click');
  expect(controlled.emitted('update:expandedRowKeys')?.[1]).toEqual([[1, child.id]]);
  expect(controlled.emitted('row-expand')?.[1]).toEqual([{ expanded: true, rowData: child, rowIndex: 1, rowKey: child.id }]);
  expect(controlled.emitted('expanded-rows-change')?.[1]).toEqual([[1, child.id]]);
  expect(controlled.emitted('expanded-row-data-change')?.[1]).toEqual([[root], [1, child.id]]);
  await controlled.setProps({ expandedRowKeys: [1, child.id] });
  expect(controlled.text()).toContain('孙');
  await controlled.setProps({ expandedRowKeys: [] });
  expect(controlled.findAll('.i-table-v2__row.is-body')).toHaveLength(1);
});

test('正文窗口提供闭区间，滚动方法只改变指定的轴', async () => {
  const w = mount(TableV2, {
    props: { columns, data: rows(100), fixedData: [{ id: 0 }], height: 140, headerHeight: [15, 25], rowHeight: 20, cache: 1 }
  });
  const scroll = w.get<HTMLElement>('.i-table-v2__scroll');
  const table = w.vm as unknown as TableV2Instance;
  expect(w.emitted('rows-rendered')?.[0]).toEqual([{ rowCacheStart: 0, rowCacheEnd: 4, rowVisibleStart: 0, rowVisibleEnd: 3 }]);
  table.scrollTo({ top: 40, scrollTop: 60, left: 40, scrollLeft: 50 });
  expect([scroll.element.scrollTop, scroll.element.scrollLeft]).toEqual([60, 50]);
  await scroll.trigger('scroll');
  expect(w.emitted('rows-rendered')?.[1]).toEqual([{ rowCacheStart: 2, rowCacheEnd: 7, rowVisibleStart: 3, rowVisibleEnd: 6 }]);
  table.scrollToLeft(30);
  expect([scroll.element.scrollTop, scroll.element.scrollLeft]).toEqual([60, 30]);
  table.scrollToTop(80);
  expect([scroll.element.scrollTop, scroll.element.scrollLeft]).toEqual([80, 30]);
  table.scrollToRow(6, 'smart');
  expect(scroll.element.scrollTop).toBe(80);
  table.scrollToRow(50, 'smart');
  expect([scroll.element.scrollTop, scroll.element.scrollLeft]).toEqual([970, 30]);
  table.scrollToRow(50, 'end');
  expect(scroll.element.scrollTop).toBe(940);
});

test('列键映射支持异步加入列并在映射清空后恢复输入顺序', async () => {
  const sortState = reactive({ id: 'desc' as const });
  const w = mount(TableV2, { props: { columns: [], data: rows(3), sortState } });
  await w.setProps({ columns });
  expect(w.get('[role="columnheader"]').attributes('aria-sort')).toBe('descending');
  expect(w.get('.i-table-v2__row.is-body').text()).toContain('行3');
  await w.setProps({ sortState: {} });
  expect(w.get('[role="columnheader"]').attributes('aria-sort')).toBe('none');
  expect(w.get('.i-table-v2__row.is-body').text()).toContain('行1');
});

test('单列排序保留数字和字符串键的身份，排序映射按对象属性键匹配', async () => {
  const numericColumn = { ...columns[0], key: 1 };
  const stringColumn = { ...columns[1], key: '1', sortable: true };
  const w = mount(TableV2, {
    props: {
      columns: [numericColumn, stringColumn],
      data: [{ id: 1, name: 'Zulu' }, { id: 2, name: 'Alpha' }],
      sortBy: { key: '1', order: 'asc' }
    }
  });
  const headers = w.findAll('[role="columnheader"]');
  const directions = () => headers.map((header) => header.attributes('aria-sort'));
  const firstName = () => w.get('.is-body [role="gridcell"]:nth-child(2)').text();
  expect(directions()).toEqual(['none', 'ascending']);
  expect(firstName()).toBe('Alpha');

  await w.setProps({ sortState: { key: 1, order: 'asc' } });
  expect(directions()).toEqual(['ascending', 'none']);
  expect(firstName()).toBe('Zulu');
  await headers[1].trigger('click');
  expect(w.emitted('column-sort')?.[0]).toEqual([{ key: '1', order: 'asc' }]);
  expect(directions()).toEqual(['none', 'ascending']);

  await w.setProps({ sortState: { 1: 'desc' } });
  expect(directions()).toEqual(['descending', 'descending']);
  expect(firstName()).toBe('Alpha');
  await w.setProps({ columns: [stringColumn] });
  expect(w.get('[role="columnheader"]').attributes('aria-sort')).toBe('descending');
  expect(w.get('.is-body [role="gridcell"]').text()).toBe('Zulu');
});

test('多层表头和固定行下的 center 与 smart 居中位置贴合正文上下边界', () => {
  const w = mount(TableV2, {
    props: { columns, data: rows(100), fixedData: [{ id: 0 }], height: 184, headerHeight: [15, 25], rowHeight: 24 }
  });
  const table = w.vm as unknown as TableV2Instance;
  const scroll = w.get<HTMLElement>('.i-table-v2__scroll').element;
  table.scrollToRow(1, 'center');
  expect(scroll.scrollTop).toBe(0);
  table.scrollToRow(98, 'center');
  expect(scroll.scrollTop).toBe(2280);
  table.scrollToRow(1, 'smart');
  expect(scroll.scrollTop).toBe(0);
  table.scrollToRow(98, 'smart');
  expect(scroll.scrollTop).toBe(2280);
});

test('正文行附加样式保留颜色和组件管理的虚拟定位', () => {
  const w = mount(TableV2, {
    props: { columns, data: rows(100), rowProps: { style: { position: 'relative', color: 'red', left: '10px' } } }
  });
  const style = w.get<HTMLElement>('.i-table-v2__row.is-body').element.style;
  expect(style.color).toBe('red');
  expect(style.position).toBe('absolute');
  expect(style.top).toBe('0px');
  expect(style.left).toBe('0px');
});

test('sortState 同时含 key、order 和其他列时按映射解析', async () => {
  const sortableColumns = ['key', 'order', 'name'].map((key) => ({ key, dataKey: key, sortable: true, width: 90 }));
  const w = mount(TableV2, {
    props: {
      columns: sortableColumns,
      data: [{ id: 1, key: 'Z', order: 2, name: '北' }, { id: 2, key: 'A', order: 1, name: '南' }],
      sortState: { key: 'asc', order: 'desc', name: 'asc' }
    }
  });
  const directions = () => w.findAll('[role="columnheader"]').map((header) => header.attributes('aria-sort'));
  expect(directions()).toEqual(['ascending', 'descending', 'ascending']);
  expect(w.get('.is-body [role="gridcell"]').text()).toBe('A');

  await w.setProps({ sortState: { key: 'key', order: 'desc' } });
  expect(directions()).toEqual(['descending', 'none', 'none']);
  expect(w.get('.is-body [role="gridcell"]').text()).toBe('Z');
});

test('dataKey 的引号转义和空路径段应用于默认内容、渲染器和排序', () => {
  const quotePath = 'obj["a\\"b"]';
  const slashPath = "obj['a\\\\b']";
  const symbolKey = Symbol('列');
  const data = [
    { id: 1, obj: { 'a"b': '乙', 'a\\b': '反斜杠', '': { name: '中间空键' } }, '': { name: '起始空键' } },
    { id: 2, obj: { 'a"b': '甲', 'a\\b': '反斜杠', '': { name: '中间空键' } }, '': { name: '起始空键' },
      'obj.normal': '完整字段', 7: '数字键', [symbolKey]: '符号键' }
  ];
  const w = mount(TableV2, {
    props: {
      columns: [
        { dataKey: quotePath, width: 100, cellRenderer: ({ cellData }) => h('strong', String(cellData ?? '')) },
        { dataKey: slashPath, width: 100 },
        { dataKey: '.name', width: 100 },
        { dataKey: 'obj..name', width: 100 },
        { dataKey: 'obj.normal', width: 100 },
        { dataKey: 7, width: 100 },
        { dataKey: symbolKey, width: 100 },
        { key: 'empty', width: 100 }
      ],
      data,
      sortBy: { key: quotePath, order: 'desc' }
    }
  });
  expect(w.get('.is-body strong').text()).toBe('甲');
  expect(w.get('.is-body').findAll('[role="gridcell"]').map((cell) => cell.text()))
    .toEqual(['甲', '反斜杠', '起始空键', '中间空键', '完整字段', '数字键', '符号键', '']);
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
