import { defineComponent, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('skeleton-item');

export type SkeletonItemVariant =
  | 'p'
  | 'text'
  | 'h1'
  | 'h3'
  | 'h5'
  | 'caption'
  | 'button'
  | 'image'
  | 'circle'
  | 'rect'
  | 'paragraph';

export default defineComponent({
  name,
  props: {
    variant: { type: String as PropType<SkeletonItemVariant>, default: 'text' }
  },
  setup(props, { slots }) {
    return () => (
      <div class={[bem(), bem({ [props.variant]: true })]} aria-hidden='true'>
        {slots.default?.()}
      </div>
    );
  }
});
