import type { Component } from './component';

export type InputNumberSize = 'large' | 'default' | 'small';
export type InputNumberControlsPosition = '' | 'right';
export type InputNumberValueOnClear = number | null | 'min' | 'max';

export interface InputNumberProps {
  modelValue?: number | null;
  value?: number | null;
  min?: number;
  max?: number;
  step?: number;
  stepStrictly?: boolean;
  precision?: number;
  controls?: boolean;
  controlsPosition?: InputNumberControlsPosition;
  disabled?: boolean;
  readonly?: boolean;
  size?: InputNumberSize;
  placeholder?: string;
  name?: string;
  id?: string;
  inputmode?: string;
  tabindex?: string | number;
  ariaLabel?: string;
  formatter?: (value: number | null) => string;
  parser?: (value: string) => number | null;
  valueOnClear?: InputNumberValueOnClear;
}

export declare class InputNumber extends Component {
  focus(): void;
  blur(): void;
}
