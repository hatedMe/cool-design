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
  target?: TourTarget;
  title?: string;
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
