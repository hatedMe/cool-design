import type { CSSProperties } from 'vue';
import type { FloatingOptions, Placement } from '../../../src/utils/use-floating';

export interface SelectV2Option {
  label?: string;
  value?: unknown;
  disabled?: boolean;
  options?: SelectV2Option[];
  [key: string]: unknown;
}

export interface SelectV2PropsMapping {
  label?: string;
  value?: string;
  disabled?: string;
  options?: string;
}

export type SelectV2Value = unknown;

export type SelectV2OptionFilterMethod = (query: string, option: SelectV2Option) => boolean;
export type SelectV2FilterMethod = ((query: string) => void) | SelectV2OptionFilterMethod;
export type SelectV2RemoteMethod = (query: string) => void | SelectV2Option[] | Promise<void | SelectV2Option[]>;

export interface SelectV2TagTooltipOptions {
  teleported?: boolean;
  appendTo?: string | HTMLElement;
  effect?: string;
  popperClass?: string | string[] | Record<string, boolean>;
  popperStyle?: string | CSSProperties | CSSProperties[];
  popperOptions?: FloatingOptions;
  placement?: Placement;
  offset?: number;
  fallbackPlacements?: Placement[];
  showAfter?: number;
  hideAfter?: number;
  autoClose?: number;
}
