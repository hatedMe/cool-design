import { defineComponent, type PropType } from 'vue';
import type { TourPlacement, TourStep, TourTarget, TourType } from '../tour/types';

export default defineComponent({
  name: 'i-tour-step',
  props: {
    target: [String, Object, Function] as PropType<TourTarget>,
    title: String,
    description: String,
    type: String as PropType<TourType>,
    placement: String as PropType<TourPlacement>,
    mask: { type: [Boolean, Object] as PropType<TourStep['mask']>, default: undefined },
    closeIcon: [String, Object],
    showArrow: { type: Boolean, default: undefined },
    showClose: { type: Boolean, default: undefined },
    scrollIntoViewOptions: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
    nextButtonProps: Object as PropType<TourStep['nextButtonProps']>,
    prevButtonProps: Object as PropType<TourStep['prevButtonProps']>
  },
  emits: ['close'],
  setup: () => () => null
});
