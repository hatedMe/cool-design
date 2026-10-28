import type { Component } from 'vue';

export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
export type ButtonSize = 'small' | 'default' | 'normal' | 'large';
export type ButtonNativeType = 'button' | 'submit' | 'reset';
export type ButtonGroupDirection = 'horizontal' | 'vertical';
export interface IButtonProps {
  type?: ButtonType;
  size?: ButtonSize;
  nativeType?: ButtonNativeType;
  loading?: boolean;
  autofocus?: boolean;
  disabled?: boolean;
  plain?: boolean;
  text?: boolean;
  bg?: boolean;
  link?: boolean;
  round?: boolean;
  circle?: boolean;
  dashed?: boolean;
  icon?: IconProp;
  color?: string;
  dark?: boolean;
  loadingIcon?: IconProp;
  tag?: string | Component;
  autoInsertSpace?: boolean;
  onClick?: (event: MouseEvent) => void;
}
export type IconProp = string | Component;
