import { defineComponent, type PropType } from 'vue';
import type { TableColumn } from '../table/types';

// 列由 Table 读取声明；组件本身不产生 DOM。
const columnProps = {
  type: String as PropType<TableColumn['type']>,
  prop: String,
  property: String,
  label: String,
  key: String,
  title: String,
  columnKey: String,
  width: [String, Number],
  minWidth: [String, Number],
  index: [Number, Function] as PropType<TableColumn['index']>,
  fixed: [Boolean, String] as PropType<TableColumn['fixed']>,
  sortable: [Boolean, String] as PropType<TableColumn['sortable']>,
  sortMethod: Function as PropType<TableColumn['sortMethod']>,
  sortBy: [String, Array, Function] as PropType<TableColumn['sortBy']>,
  sortOrders: Array as PropType<TableColumn['sortOrders']>,
  formatter: Function as PropType<TableColumn['formatter']>,
  filters: Array as PropType<TableColumn['filters']>,
  filterMultiple: Boolean,
  filterMethod: Function as PropType<TableColumn['filterMethod']>,
  filteredValue: Array,
  filterPlacement: String as PropType<TableColumn['filterPlacement']>,
  filterClassName: String,
  filterIcon: Function as PropType<TableColumn['filterIcon']>,
  showOverflowTooltip: [Boolean, Object] as PropType<TableColumn['showOverflowTooltip']>,
  className: String,
  labelClassName: String,
  selectable: Function as PropType<TableColumn['selectable']>,
  reserveSelection: Boolean,
  align: String as PropType<TableColumn['align']>,
  headerAlign: String as PropType<TableColumn['headerAlign']>,
  resizable: Boolean,
  tooltipFormatter: Function as PropType<TableColumn['tooltipFormatter']>,
  editable: Boolean,
  editor: Function as PropType<TableColumn['editor']>,
  visible: Boolean
};

export default Object.assign(
  defineComponent({
    name: 'i-table-column',
    props: columnProps,
    setup: () => () => null
  }),
  { __iTableColumn: true }
);
