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
    // 仅在无字段、无类型的列中读取直接子列或无参默认插槽。
    if (!column.prop && !column.property && !column.type) {
      try {
        const nodes = Array.isArray(node.children) ? node.children : slots.default?.length === 0 ? slots.default() : [];
        const children = resolveColumns(nodes as VNode[], id);
        if (children.length) column.children = children;
      } catch {
        // Vue 编译的插槽包装函数隐藏参数个数，作用域由正文渲染提供。
      }
    }
    columnSlots.set(column, slots);
    return [column];
  });
}
