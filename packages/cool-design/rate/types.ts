import type { Component } from 'vue';

export interface RateThresholdValue<T> {
  value: T;
  excluded?: boolean;
}
export type RateThresholdMap<T> = Record<number, T | RateThresholdValue<T>> & { excluded?: number[] };
export type RateColor = string | string[] | RateThresholdMap<string>;
export type RateIcon = string | Component;
export type RateIconMap = RateIcon[] | RateThresholdMap<RateIcon>;
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
  icons?: RateIconMap;
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
