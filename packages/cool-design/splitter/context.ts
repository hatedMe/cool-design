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
  /** 注册面板，返回面板唯一 id */
  register: (
    meta: () => SplitterPanelMeta,
    emitSize: (size: number) => void,
    slots: { start?: () => unknown; end?: () => unknown },
    element: () => HTMLElement | undefined
  ) => number;
  /** 按面板 id 注销 */
  unregister: (id: number) => void;
  /** 按面板 id 获取尺寸样式 */
  sizeStyle: (id: number) => Record<string, string> | undefined;
  /** 按分隔条位置（左侧面板序号）发起拖拽 */
  startDrag: (position: number) => (event: MouseEvent) => void;
  /** 按分隔条位置折叠相邻面板 */
  collapse: (position: number, side: 'start' | 'end') => void;
}

export const splitterKey: InjectionKey<SplitterContext> = Symbol('splitter');
