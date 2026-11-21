import type { InjectionKey } from 'vue';

export interface AnchorContext {
  activeHref: () => string;
  register: (href: string) => void;
  unregister: (href: string) => void;
  handleClick: (event: MouseEvent, href: string) => void;
}
export const anchorKey: InjectionKey<AnchorContext> = Symbol('anchor');
