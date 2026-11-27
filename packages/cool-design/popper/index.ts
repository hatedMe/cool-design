import type { Instance } from '@popperjs/core';
import type { StyleValue } from 'vue';
import { withInstall } from '../../../src/utils/with-install';
import Root from './popper';
import Trigger from './popper-trigger';
import Content from './popper-content';
import Arrow from './popper-arrow';
import type { PopperReference } from './context';
import './index.scss';

export interface PopperInstance {
  triggerRef?: PopperReference;
  referenceRef?: PopperReference;
  contentRef?: HTMLElement;
  popperInstanceRef?: Instance;
  readonly role: string;
}
export interface PopperContentInstance {
  popperContentRef?: HTMLElement;
  popperInstanceRef?: Instance;
  readonly contentStyle: StyleValue;
  updatePopper(shouldUpdateZIndex?: boolean): Promise<Partial<import('@popperjs/core').State>> | undefined;
}
export const Popper = withInstall<typeof Root, PopperInstance>(Root);
export const PopperTrigger = withInstall<typeof Trigger, { triggerRef?: PopperReference }>(Trigger);
export const PopperContent = withInstall<typeof Content, PopperContentInstance>(Content);
export const PopperArrow = withInstall<typeof Arrow, { arrowRef?: HTMLElement }>(Arrow);
export default Popper;
export { popperKey as POPPER_INJECTION_KEY, popperContentKey as POPPER_CONTENT_INJECTION_KEY } from './context';
export type { PopperReference } from './context';
