import { Fragment, camelize, isVNode, type Slots, type VNode } from 'vue';
import type { TableColumn } from './types';

export const columnSlots = new WeakMap<TableColumn, Slots>();
const booleanProps = new Set([
  'fixed',
  'sortable',
  'filterMultiple',
  'showOverflowTooltip',
  'reserveSelection',
  'resizable',
  'editable',
  'visible'
]);

export function resolveColumns(nodes: VNode[], path = ''): TableColumn[] {
  return nodes.flatMap((node, index): TableColumn[] => {
    if (!isVNode(node)) return [];
    const id = `${path}.${String(node.key ?? index)}`;
    if (node.type === Fragment) return resolveColumns(node.children as VNode[], id);
    if (!(node.type as { __iTableColumn?: boolean }).__iTableColumn) return [];
    const column: TableColumn = {};
    for (const [name, value] of Object.entries(node.props ?? {})) {
      if (name === 'key' || name === 'ref') continue;
      const prop = camelize(name);
      (column as Record<string, unknown>)[prop] = booleanProps.has(prop) && value === '' ? true : value;
    }
    column.property ??= column.prop;
    for (const prop of ['width', 'minWidth'] as const) {
      const value = column[prop];
      if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
        column[prop] = Number(value);
      }
    }
    column.columnKey ??= column.prop ?? column.property ?? `$declarative${id}`;
    const slots = (node.children && !Array.isArray(node.children) ? node.children : {}) as Slots;
    // 有字段或展开类型的默认插槽用于单元格；无字段列也可以声明分组。
    if (!column.prop && !column.property && !column.type && slots.default) {
      try {
        const children = resolveColumns(slots.default({ row: {}, column, $index: -1 }), id);
        if (children.length) column.children = children;
      } catch {
        // 无字段操作列的作用域插槽可能读取行数据，延迟至渲染单元格时执行。
      }
    }
    columnSlots.set(column, slots);
    return [column];
  });
}
