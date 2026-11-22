import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, type PropType } from 'vue';
import { createBEM, createNamespace } from '../../../src/utils/create';

const [name] = createNamespace('skeleton-item');

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
    const ns = useNamespace('skeleton-item');
    const bem = createBEM(ns.b);
    return () => (
      <div class={[bem(), bem({ [props.variant]: true })]} aria-hidden='true'>
        {slots.default?.()}
      </div>
    );
  }
});
