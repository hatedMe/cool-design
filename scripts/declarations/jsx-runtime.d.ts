import type { RenderElement } from '../../src/utils/render-element';
export namespace JSX {
  export type { RenderElement as Element };
  export interface IntrinsicElements extends globalThis.JSX.IntrinsicElements {
    img: globalThis.JSX.IntrinsicElements['img'] & { loading?: 'eager' | 'lazy' };
    div: globalThis.JSX.IntrinsicElements['div'] & { inert?: boolean };
  }
  export type IntrinsicAttributes = globalThis.JSX.IntrinsicAttributes;
  export type ElementAttributesProperty = globalThis.JSX.ElementAttributesProperty;
  export type ElementClass = globalThis.JSX.ElementClass;
}
