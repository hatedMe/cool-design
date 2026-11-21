import { withInstall } from '../../../src/utils/with-install';
import type { Instance, State } from '@popperjs/core';
import Component from './tooltip';
import type { TooltipVirtualRef } from './tooltip';

export type { PopperOptions } from '../../../src/utils/use-floating';
export type { TooltipVirtualRef } from './tooltip';

export interface TooltipInstance {
  readonly popperRef: {
    readonly triggerRef: TooltipVirtualRef | undefined;
    readonly contentRef: HTMLElement | undefined;
    readonly popperInstanceRef: Instance | undefined;
  };
  readonly contentRef: {
    readonly popperContentRef: HTMLElement;
    isFocusInsideContent(event?: FocusEvent): boolean;
    updatePopper(): Promise<Partial<State>> | void;
  } | undefined;
  isFocusInsideContent(event?: FocusEvent): boolean;
  onOpen(event?: Event): void;
  onClose(event?: Event): void;
  show(): void;
  hide(event?: Event): void;
  update(): Promise<Partial<State>> | void;
  updatePopper(): Promise<Partial<State>> | void;
}
export const Tooltip = withInstall<typeof Component, TooltipInstance>(Component);
export default Tooltip;
