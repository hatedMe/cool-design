export interface TableColumn<T extends object = Record<string, unknown>> {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sortable?: boolean;
  formatter?: (row: T) => string;
}
export interface SortChange {
  key: string;
  order: 'asc' | 'desc' | null;
}
