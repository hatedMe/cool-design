import type { InjectionKey } from 'vue';

export type SplitterLayout = 'horizontal' | 'vertical';
export type SplitterSize = string | number | undefined;

export interface SplitterPanelMeta {
  size: SplitterSize;
  min: SplitterSize;
  max: SplitterSize;
  resizable: boolean;
  collapsible: boolean;
}

export interface SplitterContext {
  layout: () => SplitterLayout;
  lazy: () => boolean;
  register: (
    meta: () => SplitterPanelMeta,
    emitSize: (size: number) => void,
    slots: { start?: () => unknown; end?: () => unknown },
    element: () => HTMLElement | undefined
  ) => number;
  unregister: (index: number) => void;
  sizeStyle: (index: number) => Record<string, string> | undefined;
  startDrag: (index: number) => (event: MouseEvent) => void;
  collapse: (index: number, side: 'start' | 'end') => void;
}

export const splitterKey: InjectionKey<SplitterContext> = Symbol('splitter');
