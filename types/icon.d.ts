import type { Component, DefineComponent } from 'vue';

export type IconProp = string | Component;

export interface IconProps {
  type?: string;
  icon?: IconProp;
  size?: string | number;
  color?: string;
  label?: string;
}

export declare const Icon: DefineComponent<IconProps>;
export default Icon;
