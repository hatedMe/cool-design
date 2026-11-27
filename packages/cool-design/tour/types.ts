import type { CSSProperties } from 'vue';
export type TourPlacement =
  | 'center'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type TourTarget = string | HTMLElement | (() => HTMLElement | null) | null;

export interface TourStep {
  contentStyle?: CSSProperties;
  target?: TourTarget;
  title?: string;
  type?: TourType;
  showArrow?: boolean;
  closeIcon?: string | import('vue').Component;
  nextButtonProps?: import('../button').IButtonProps & { children?: string; onClick?: () => void };
  prevButtonProps?: import('../button').IButtonProps & { children?: string; onClick?: () => void };
  description?: string;
  placement?: TourPlacement;
  nextButtonText?: string;
  prevButtonText?: string;
  mask?: boolean | { style?: Record<string, string>; color?: string };
  arrow?: boolean;
  showClose?: boolean;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
}

export type TourType = 'default' | 'primary';
