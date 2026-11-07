import type { Component } from 'vue';

export type RateColor = string | string[];
export type RateIcon = string | Component;
export type RateSize = 'large' | 'default' | 'small' | string | number;

export interface RateProps {
  modelValue?: number;
  max?: number;
  size?: RateSize;
  disabled?: boolean;
  allowHalf?: boolean;
  lowThreshold?: number;
  highThreshold?: number;
  colors?: RateColor;
  voidColor?: string;
  disabledVoidColor?: string;
  icons?: RateIcon[];
  voidIcon?: RateIcon;
  disabledVoidIcon?: RateIcon;
  showText?: boolean;
  showScore?: boolean;
  textColor?: string;
  texts?: string[];
  scoreTemplate?: string;
  clearable?: boolean;
  id?: string;
  ariaLabel?: string;
  label?: string;
}

export interface RateExposed {
  setCurrentValue: (value: number) => void;
  resetCurrentValue: () => void;
}
