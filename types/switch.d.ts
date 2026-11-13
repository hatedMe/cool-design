import type { Component } from 'vue';

export type SwitchValue = string | boolean | number;
export type SwitchIcon = string | Component;

export declare class Switch extends Component {
  modelValue: SwitchValue;
  disabled: boolean;
  loading: boolean;
  size: 'small' | 'default' | 'large';
  width: string | number;
  inlinePrompt: boolean;
  activeText: string;
  inactiveText: string;
  activeValue: SwitchValue;
  inactiveValue: SwitchValue;
  activeIcon: SwitchIcon;
  inactiveIcon: SwitchIcon;
  activeActionIcon: SwitchIcon;
  inactiveActionIcon: SwitchIcon;
  activeColor: string;
  inactiveColor: string;
  borderColor: string;
  validateEvent: boolean;
  label: string;
  beforeChange: () => boolean | Promise<boolean>;
  id: string;
  name: string;
  tabindex: string | number;
  'aria-label': string;
  focus(): void;
}
