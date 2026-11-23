import type { InjectionKey } from 'vue';
import type { AnchorDirection, AnchorType } from './anchor';

export interface AnchorContext {
  activeHref: () => string;
  register: (href: string) => void;
  unregister: (href: string) => void;
  handleClick: (event: MouseEvent, href: string) => void;
}
interface AnchorLinkContext extends AnchorContext {
  layout: { readonly direction: AnchorDirection; readonly type: AnchorType };
}

export const anchorKey: InjectionKey<AnchorLinkContext> = Symbol('anchor');
