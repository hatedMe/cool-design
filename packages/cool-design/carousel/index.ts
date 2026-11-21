import { withInstall } from '../../../src/utils/with-install';
import Component from './carousel';
import Item from './carousel-item';

export interface CarouselInstance {
  readonly activeIndex: number;
  setActiveItem(target: number | string): void;
  prev(): void;
  next(): void;
}
export const Carousel = withInstall<typeof Component, CarouselInstance>(Component);
export const CarouselItem = withInstall(Item);
export default Carousel;
export type {
  CarouselArrow,
  CarouselDirection,
  CarouselIndicatorPosition,
  CarouselTrigger,
  CarouselType
} from './carousel';
