import { withInstall } from '../../../src/utils/with-install';
import Component from './carousel';
import Item from './carousel-item';

export const Carousel = withInstall(Component);
export const CarouselItem = withInstall(Item);
export default Carousel;
export type {
  CarouselArrow,
  CarouselDirection,
  CarouselIndicatorPosition,
  CarouselTrigger,
  CarouselType
} from './carousel';
