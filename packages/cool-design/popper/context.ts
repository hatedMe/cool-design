import type { ComputedRef, InjectionKey, Ref, CSSProperties } from 'vue';
import type { Instance, VirtualElement } from '@popperjs/core';

export type PopperReference = HTMLElement | VirtualElement;
export interface PopperContext {
  triggerRef: Ref<PopperReference | undefined>;
  referenceRef: Ref<PopperReference | undefined>;
  contentRef: Ref<HTMLElement | undefined>;
  popperInstanceRef: Ref<Instance | undefined>;
  role: ComputedRef<string>;
}
export interface PopperArrowContext {
  arrowRef: Ref<HTMLElement | undefined>;
  arrowStyle: ComputedRef<CSSProperties>;
}
export const popperKey: InjectionKey<PopperContext> = Symbol('popper');
export const popperContentKey: InjectionKey<PopperArrowContext> = Symbol('popper-content');
