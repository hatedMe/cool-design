import { Component } from './component';
import type { Component as VueComponent } from 'vue';

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
  icon?: string | VueComponent;
  color?: string;
  dark?: boolean;
  loadingIcon?: string | VueComponent;
  tag?: string | VueComponent;
  autoInsertSpace?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export declare class Button extends Component {
  type: ButtonType;
  size: ButtonSize;
  plain: boolean;
  text: boolean;
  bg: boolean;
  link: boolean;
  round: boolean;
  circle: boolean;
  dashed: boolean;
  loading: boolean;
  disabled: boolean;
  autofocus: boolean;
  icon: string | VueComponent;
  color: string;
  dark: boolean;
  loadingIcon: string | VueComponent;
  tag: string | VueComponent;
  nativeType: ButtonNativeType;
  autoInsertSpace: boolean;
}

export declare class ButtonGroup extends Component {
  type: ButtonType;
  size: ButtonSize;
  direction: ButtonGroupDirection;
}
