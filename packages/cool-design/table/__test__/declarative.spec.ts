import { mount } from '@vue/test-utils';
import { Fragment, defineComponent, h, ref } from 'vue';
import { expect, test } from 'vitest';
import Table from '../index';
import TableColumn from '../../table-column';
import type { TableColumn as ColumnConfig } from '../types';

type Scope = { row: { name: string }; column: ColumnConfig; $index: number };

test('已排序声明式列更新比较函数后立即重新排序', async () => {
  const factor = ref(1);
  const w = mount(defineComponent({
    setup: () => () => h(Table, { data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] }, {
      default: () => {
        const direction = factor.value;
        return h(TableColumn, {
          prop: 'name', label: '姓名', sortable: true,
          sortMethod: (a: { name: string }, b: { name: string }) => direction * a.name.localeCompare(b.name)
        });
      }
    })
  }));
  await w.get('thead button').trigger('click');
  expect(w.findAll('tbody tr').map((row) => row.text())).toEqual(['A', 'B']);
  factor.value = -1;
  await w.vm.$nextTick();
  expect(w.findAll('tbody tr').map((row) => row.text())).toEqual(['B', 'A']);
  w.unmount();
});

test('声明式列支持 Element Plus 的属性、表头及单元格作用域插槽', () => {
  const w = mount(Table, {
    props: { data: [{ id: 1, name: '小明' }] },
    slots: {
      default: () => [
        h(TableColumn, { type: 'index', label: '序号' }),
        h(
          TableColumn,
          { prop: 'name', label: '姓名', width: '160' },
          {
            header: ({ column }: Scope) => h('strong', column.label),
            default: ({ row, column, $index }: Scope) => h('button', `${column.property}:${row.name}:${$index}`)
          }
        )
      ]
    }
  });
  expect(w.get('thead strong').text()).toBe('姓名');
  expect(w.get('tbody button').text()).toBe('name:小明:0');
  expect(w.findAll('tbody td')[1].attributes('style')).toContain('width: 160px');
  expect(w.findAll('tbody td')[0].text()).toBe('1');
});

test('分组列及动态列增删、属性和插槽更新', async () => {
  const visible = ref(true);
  const label = ref('姓名');
  const suffix = ref('甲');
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(
          Table,
          { data: [{ id: 1, name: '小明' }] },
          {
            default: () => [
              h(
                TableColumn,
                { label: '资料' },
                {
                  default: () => [
                    h(TableColumn, { prop: 'id', label: '编号' }),
                    visible.value
                      ? h(
                          TableColumn,
                          { prop: 'name', label: label.value },
                          {
                            default: ({ row }: Scope) => `${row.name}${suffix.value}`
                          }
                        )
                      : null
                  ]
                }
              )
            ]
          }
        )
    })
  );
  expect(w.findAll('thead tr')).toHaveLength(2);
  expect(w.get('thead th').attributes('colspan')).toBe('2');
  expect(w.text()).toContain('小明甲');
  label.value = '新姓名';
  suffix.value = '乙';
  await w.vm.$nextTick();
  expect(w.text()).toContain('新姓名');
  expect(w.text()).toContain('小明乙');
  visible.value = false;
  await w.vm.$nextTick();
  expect(w.findAll('tbody td')).toHaveLength(1);
  visible.value = true;
  await w.vm.$nextTick();
  expect(w.findAll('tbody td')).toHaveLength(2);
});

test('具名字段插槽和 columns 数组继续兼容', () => {
  const w = mount(Table, {
    props: { data: [{ name: '小明' }], columns: [{ prop: 'name', label: '姓名' }] },
    slots: { name: ({ row }: Scope) => `原有${row.name}` }
  });
  expect(w.get('tbody td').text()).toBe('原有小明');
});

test('Fragment 内的声明式列支持选择、排序及更新后的受控筛选', async () => {
  const value = ref('小明');
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(
          Table,
          {
            data: [
              { id: 1, name: '小明' },
              { id: 2, name: '小红' }
            ]
          },
          {
            default: () =>
              h(Fragment, null, [
                h(TableColumn, { type: 'selection' }),
                h(TableColumn, {
                  prop: 'name',
                  label: '姓名',
                  sortable: true,
                  filteredValue: [value.value],
                  filterMethod: (filter: unknown, row: { name: string }) => row.name === filter
                }),
                h(TableColumn, { label: '操作' }, { default: ({ row }: Scope) => h('button', row.name) })
              ])
          }
        )
    })
  );
  await w.vm.$nextTick();
  expect(w.findAll('tbody tr')).toHaveLength(1);
  await w.get('tbody input').setValue(true);
  expect(w.findComponent(Table).emitted('selection-change')?.[0][0]).toEqual([{ id: 1, name: '小明' }]);
  await w.get('thead button').trigger('click');
  expect(w.findComponent(Table).emitted('sort-change')).toHaveLength(1);
  value.value = '小红';
  await w.vm.$nextTick();
  expect(w.get('tbody button').text()).toBe('小红');
});
