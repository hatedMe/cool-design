import type { ComputedRef, InjectionKey, Ref } from 'vue';

export interface CarouselItemProps {
  name?: string | number;
  label?: string | number;
}

export interface CarouselContext {
  active: Ref<number>;
  order: Ref<number[]>;
  states: Map<number, CarouselItemProps>;
  card: ComputedRef<boolean>;
  cardScale: ComputedRef<number>;
  register: (uid: number, props: CarouselItemProps) => void;
  unregister: (uid: number) => void;
}

export const carouselKey: InjectionKey<CarouselContext> = Symbol('carousel');
