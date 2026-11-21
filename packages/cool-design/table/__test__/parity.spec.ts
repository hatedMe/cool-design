import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive } from 'vue';
import { expect, test } from 'vitest';
import ConfigProvider from '../../config-provider';
import Table, { type TableInstance } from '../index';
import TableColumn from '../../table-column';

test('renderHeader 优先渲染配置列及分组表头并保留排序、筛选和全选', async () => {
  const wrapper = mount(Table, {
    props: {
      data: [{ id: 1, name: '乙' }, { id: 2, name: '甲' }],
      columns: [
        { type: 'selection', renderHeader: () => h('i', '选择') },
        {
          label: '分组标题',
          renderHeader: ({ column, $index }) => h('strong', `${column.label}${$index}`),
          children: [
            {
              prop: 'name',
              label: '默认标题',
              renderHeader: ({ column, $index }) => h('em', `${column.prop}${$index}`),
              sortable: true,
              filters: [{ text: '甲', value: '甲' }]
            }
          ]
        }
      ]
    },
    slots: { 'name-header': () => h('span', '字段插槽') }
  });
  try {
    expect(wrapper.get('thead strong').text()).toBe('分组标题1');
    expect(wrapper.get('thead em').text()).toBe('name0');
    expect(wrapper.text()).not.toContain('字段插槽');
    await wrapper.get('thead input').setValue(true);
    expect(wrapper.emitted('select-all')).toHaveLength(1);
    await wrapper.get('thead button:not(.i-table__filter-trigger)').trigger('click');
    expect(wrapper.emitted('sort-change')?.[0][0]).toMatchObject({ prop: 'name', order: 'ascending' });
    expect(wrapper.get('.i-table__filter-trigger').attributes('aria-expanded')).toBe('false');
  } finally {
    wrapper.unmount();
  }
});

test('声明式分组和叶子使用 renderHeader、header 插槽、label 的优先级', () => {
  const wrapper = mount(Table, {
    slots: {
      default: () => [
        h(TableColumn, { label: '分组' }, {
          header: () => h('strong', '分组插槽'),
          default: () => [
            h(TableColumn, { prop: 'left', label: '左', renderHeader: () => h('em', '列回调') }, {
              header: () => '列插槽'
            }),
            h(TableColumn, { prop: 'right', label: '右' })
          ]
        })
      ]
    }
  });
  try {
    expect(wrapper.get('thead strong').text()).toBe('分组插槽');
    expect(wrapper.findAll('thead tr')[1].findAll('th').map((header) => header.text())).toEqual(['列回调', '右']);
  } finally {
    wrapper.unmount();
  }
});

test('固定分组和直接子列随声明列增减保留固定方向与偏移', async () => {
  const wrapper = mount(Table, {
    props: { data: [{ id: 1, first: '甲', last: '乙' }] },
    slots: {
      default: () => [
        h(TableColumn, { label: '分组', fixed: 'right' }, {
          default: () => [
            h(TableColumn, { prop: 'first', width: 100 }),
            h(TableColumn, { prop: 'last', width: 100 })
          ]
        }),
        h(TableColumn, { prop: 'id', fixed: 'right', width: 90 })
      ]
    }
  });
  try {
    const group = wrapper.get('th[scope=colgroup]').element as HTMLElement;
    expect(group.style.position).toBe('sticky');
    expect(group.style.right).toBe('90px');
    expect((wrapper.findAll('tbody td')[0].element as HTMLElement).style.right).toBe('190px');
    await (wrapper.vm as TableInstance).setColumnVisibility('last', false);
    expect(group.hasAttribute('colspan')).toBe(false);
    expect((wrapper.findAll('tbody td')[0].element as HTMLElement).style.right).toBe('90px');
  } finally {
    wrapper.unmount();
  }
});

test('列解析跳过组件包装并仅在真实行上调用有参数的操作列插槽', () => {
  const visited: number[] = [];
  let wrapped = 0;
  const Wrapper = defineComponent({
    setup() {
      wrapped += 1;
      return () => h(TableColumn, { prop: 'hidden', label: '包装列' });
    }
  });
  const wrapper = mount(Table, {
    props: { data: [{ id: 1 }] },
    slots: {
      default: () => [
        h(Wrapper),
        h(TableColumn, { label: '操作' }, {
          default: ({ $index }: { $index: number }) => {
            visited.push($index);
            return h('button', `行${$index}`);
          }
        })
      ]
    }
  });
  try {
    expect(wrapped).toBe(0);
    expect(wrapper.get('tbody button').text()).toBe('行0');
    expect(visited).toEqual([0]);
  } finally {
    wrapper.unmount();
  }
});

test('appendFilterPanelTo 挂载面板到给定宿主并支持确认、清空和外部关闭', async () => {
  const host = document.createElement('div');
  host.id = 'table-filter-host';
  document.body.appendChild(host);
  const wrapper = mount(Table, {
    attachTo: document.body,
    props: {
      appendFilterPanelTo: '#table-filter-host',
      data: [{ id: 1, name: '甲' }, { id: 2, name: '乙' }],
      columns: [{
        prop: 'name',
        filters: [{ text: '甲', value: '甲' }],
        filterMethod: (value, row) => row.name === value
      }]
    }
  });
  try {
    const trigger = wrapper.get('.i-table__filter-trigger');
    const click = (selector: string) => host.querySelector<HTMLElement>(selector)!.click();
    await trigger.trigger('click');
    expect(host.querySelector('[role=dialog]')).not.toBeNull();
    expect(wrapper.find('[role=dialog]').exists()).toBe(false);
    click('input');
    await nextTick();
    click('.is-primary');
    await nextTick();
    expect(wrapper.findAll('tbody tr').map((row) => row.text())).toEqual(['甲']);
    expect(host.querySelector('[role=dialog]')).toBeNull();
    await trigger.trigger('click');
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(host.querySelector('[role=dialog]')).toBeNull();
    await trigger.trigger('click');
    click('.i-table__filter-actions button');
    await nextTick();
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    await trigger.trigger('click');
    wrapper.unmount();
    expect(host.querySelector('[role=dialog]')).toBeNull();
  } finally {
    if (wrapper.exists()) wrapper.unmount();
    host.remove();
  }
});

test('表格溢出 Tooltip 消费分层对象选项并保留未覆盖的样式属性', async () => {
  const wrapper = mount(ConfigProvider, {
    props: {
      table: {
        showOverflowTooltip: true,
        tooltipEffect: 'dark',
        tooltipOptions: { offset: 0, popperStyle: { color: 'red', fontSize: '13px' } }
      }
    },
    slots: {
      default: () => h(Table, {
        data: [{ name: '甲', other: '乙' }],
        tooltipEffect: 'dark',
        tooltipOptions: { effect: 'light', popperStyle: { color: 'blue' } },
        columns: [
          { prop: 'name', showOverflowTooltip: { showArrow: false, popperStyle: { fontWeight: '700' } } },
          { prop: 'other', showOverflowTooltip: false }
        ]
      })
    }
  });
  try {
    const trigger = wrapper.get('.i-tooltip__trigger');
    expect(wrapper.findAll('.i-tooltip__trigger')).toHaveLength(1);
    await trigger.trigger('mouseenter');
    expect(wrapper.find('[role=tooltip]').exists()).toBe(false);
    Object.defineProperty(trigger.element, 'scrollWidth', { value: 100 });
    await trigger.trigger('mouseenter');
    const tip = wrapper.get('.i-tooltip--light');
    expect(tip.text()).toBe('甲');
    expect(tip.find('.i-tooltip__arrow').exists()).toBe(false);
    expect((tip.element as HTMLElement).style).toMatchObject({ color: 'blue', fontSize: '13px', fontWeight: '700' });
  } finally {
    wrapper.unmount();
  }
});

test('rowExpandable 约束默认、外部键和实例调用并使用过滤排序后的行索引', async () => {
  const rows = [{ id: 1, label: 'A' }, { id: 2, label: 'B' }, { id: 3, label: 'C' }];
  const wrapper = mount(Table, {
    props: {
      data: rows,
      columns: [
        { type: 'expand', prop: 'label', columnKey: 'detail' },
        { prop: 'label', sortable: true, filterMethod: (value, row) => row.label !== value }
      ],
      defaultExpandAll: true,
      defaultSort: { prop: 'label', order: 'descending' },
      rowExpandable: (_row, index) => index === 0
    }
  });
  const details = () => wrapper.findAll('.i-table__expanded-row').map((row) => row.text());
  try {
    expect(details()).toEqual(['C']);
    expect(wrapper.findAll('tbody button').map((button) => button.attributes('disabled') !== undefined)).toEqual([
      false, true, true
    ]);
    await wrapper.setProps({ expandRowKeys: [1, 2] });
    expect(details()).toEqual([]);
    (wrapper.vm as TableInstance).toggleRowExpansion({ ...rows[0] }, true);
    await nextTick();
    expect(wrapper.emitted('expand-change')).toBeUndefined();
    (wrapper.vm as TableInstance).toggleRowExpansion({ ...rows[2] }, true);
    await nextTick();
    expect(details()).toEqual(['C']);
    await wrapper.setProps({ columns: [
      { type: 'expand', prop: 'label', columnKey: 'detail' },
      { prop: 'label', sortable: true, filteredValue: ['C'], filterMethod: (value, row) => row.label !== value }
    ] });
    expect(details()).toEqual(['B']);
    await wrapper.setProps({ rowExpandable: () => false, data: [{ id: 2, label: '更新' }, rows[0]] });
    expect(details()).toEqual([]);
  } finally {
    wrapper.unmount();
  }
});

test('rowExpandable 禁用展开列时树节点仍可独立展开', async () => {
  const wrapper = mount(Table, {
    props: {
      data: [{ id: 1, name: '父', children: [{ id: 2, name: '子' }] }],
      columns: [{ type: 'expand', prop: 'name', columnKey: 'detail' }, { prop: 'name' }],
      rowExpandable: () => false,
      preserveExpandedContent: true
    }
  });
  try {
    expect(wrapper.get('[aria-label="展开行"]').attributes('disabled')).toBeDefined();
    await wrapper.get('[aria-label="展开子行"]').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.findAll('tbody tr')[1].text()).toContain('子');
    expect(wrapper.find('.i-table__expanded-row').exists()).toBe(false);
  } finally {
    wrapper.unmount();
  }
});

test('默认展开随排序资格和原地追加更新，无行键时按行对象区分', async () => {
  const rows = reactive([{ name: 'B' }, { name: 'A' }]);
  const wrapper = mount(Table, {
    props: {
      data: rows,
      columns: [{ type: 'expand', prop: 'name', columnKey: 'detail' }, { prop: 'name', sortable: true }],
      defaultExpandAll: true,
      rowExpandable: (row, index) => 'name' in row && (row.name === 'C' || index === 0)
    }
  });
  const details = () => wrapper.findAll('.i-table__expanded-row').map((row) => row.text());
  try {
    expect(details()).toEqual(['B']);
    await wrapper.get('thead button').trigger('click');
    expect(details()).toEqual(['A']);
    rows.push({ name: 'C' });
    await nextTick();
    expect(details()).toEqual(['A', 'C']);
    (wrapper.vm as TableInstance).toggleRowExpansion(rows[0], true);
    await nextTick();
    expect(details()).toEqual(['A', 'C']);
  } finally {
    wrapper.unmount();
  }
});

test('详情展开事件保留折叠树中的已展开详情', async () => {
  const child = { id: 2, name: '子' };
  const parent = { id: 1, name: '父', children: [child] };
  const wrapper = mount(Table, {
    props: {
      data: [parent],
      columns: [{ type: 'expand', prop: 'name', columnKey: 'detail' }, { prop: 'name' }],
      expandRowKeys: [1, 2],
      rowExpandable: (_row, index) => index < 2
    }
  });
  try {
    await wrapper.get('[aria-label="收起子行"]').trigger('click');
    await wrapper.get('[aria-label="收起行"]').trigger('click');
    expect(wrapper.emitted('expand-change')?.at(-1)).toEqual([parent, [child]]);
    await wrapper.get('[aria-label="展开子行"]').trigger('click');
    expect(wrapper.get('.i-table__expanded-row').text()).toBe('子');
  } finally {
    wrapper.unmount();
  }
});

test('详情展开事件保留被筛选的行和排除仍可见但不符合资格的行', async () => {
  const [first, hidden, disabled] = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }];
  const columns: NonNullable<InstanceType<typeof Table>['$props']['columns']> = [
    { type: 'expand', prop: 'name', columnKey: 'detail' },
    { prop: 'name', filterMethod: (value, row) => row.name !== value }
  ];
  const wrapper = mount(Table, { props: {
    data: [first, hidden, disabled], columns, expandRowKeys: [1, 2, 3],
    rowExpandable: (row, index) => 'id' in row && row.id !== disabled.id && index < 2
  } });
  try {
    expect(wrapper.findAll('.i-table__expanded-row').map((row) => row.text())).toEqual(['A', 'B']);
    await wrapper.setProps({ columns: [columns[0], { ...columns[1], filteredValue: ['B'] }] });
    await wrapper.get('[aria-label="收起行"]').trigger('click');
    expect(wrapper.emitted('expand-change')?.at(-1)).toEqual([first, [hidden]]);
  } finally {
    wrapper.unmount();
  }
});

test('详情展开事件排除从未出现或满足资格的受控子行', async () => {
  const child = { id: 2, name: '子' };
  const parent = { id: 1, name: '父', children: [child] };
  const wrapper = mount(Table, {
    props: {
      data: [parent],
      columns: [{ type: 'expand', prop: 'name', columnKey: 'detail' }, { prop: 'name' }],
      expandRowKeys: [2],
      rowExpandable: (_row, index) => index === 0
    }
  });
  try {
    await wrapper.get('[aria-label="展开行"]').trigger('click');
    expect(wrapper.emitted('expand-change')?.at(-1)).toEqual([parent, [parent]]);
    await wrapper.get('[aria-label="展开子行"]').trigger('click');
    expect(wrapper.findAll('.i-table__expanded-row').map((row) => row.text())).toEqual(['父']);
  } finally {
    wrapper.unmount();
  }
});

test('详情展开事件按隐藏行最近的正文索引重新检查资格和数据', async () => {
  const hidden = { id: 2, name: '原子行', allowed: true };
  const parent = { id: 1, name: '父', allowed: true, children: [hidden] };
  const canExpandHidden = reactive({ value: true });
  const wrapper = mount(Table, {
    props: {
      data: [parent],
      columns: [{ type: 'expand', prop: 'name', columnKey: 'detail' }, { prop: 'name' }],
      expandRowKeys: [1, 2],
      rowExpandable: (row: { id: number; allowed: boolean }, index) =>
        row.allowed && (row.id === 1 || (canExpandHidden.value && index === 1))
    }
  });
  try {
    expect(wrapper.findAll('.i-table__expanded-row').map((row) => row.text())).toEqual(['父', '原子行']);
    await wrapper.get('[aria-label="收起子行"]').trigger('click');
    canExpandHidden.value = false;
    await nextTick();
    await wrapper.get('[aria-label="收起行"]').trigger('click');
    expect(wrapper.emitted('expand-change')?.at(-1)).toEqual([parent, []]);

    canExpandHidden.value = true;
    await wrapper.get('[aria-label="展开子行"]').trigger('click');
    expect(wrapper.get('.i-table__expanded-row').text()).toBe('原子行');
    await wrapper.get('[aria-label="收起子行"]').trigger('click');
    const replacement = { ...parent, children: [{ ...hidden, name: '新子行', allowed: false }] };
    await wrapper.setProps({ data: [replacement] });
    await wrapper.get('[aria-label="展开行"]').trigger('click');
    expect(wrapper.emitted('expand-change')?.at(-1)).toEqual([replacement, [replacement]]);

    await wrapper.get('[aria-label="展开子行"]').trigger('click');
    await wrapper.setProps({ data: [parent] });
    await wrapper.get('[aria-label="收起子行"]').trigger('click');
    const withoutChild = { ...parent, children: [] };
    await wrapper.setProps({ data: [withoutChild] });
    await wrapper.get('[aria-label="收起行"]').trigger('click');
    expect(wrapper.emitted('expand-change')?.at(-1)).toEqual([withoutChild, []]);
  } finally {
    wrapper.unmount();
  }
});

test('renderHeader 的 _self 可从表头按钮清除实际过滤条件', async () => {
  const wrapper = mount(Table, {
    props: {
      data: [{ id: 1, name: '甲' }, { id: 2, name: '乙' }],
      columns: [{
        prop: 'name',
        filteredValue: ['甲'],
        filterMethod: (value, row) => row.name === value,
        renderHeader: ({ _self }) => h('button', { onClick: () => _self?.clearFilter?.() }, '清除')
      }]
    }
  });
  try {
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    await wrapper.get('thead button').trigger('click');
    expect(wrapper.findAll('tbody tr').map((row) => row.text())).toEqual(['甲', '乙']);
    expect(wrapper.emitted('filter-change')?.at(-1)).toEqual([{}]);
  } finally {
    wrapper.unmount();
  }
});
