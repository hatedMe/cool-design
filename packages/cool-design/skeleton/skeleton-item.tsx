import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, inject, type PropType } from 'vue';
import { createBEM, createNamespace } from '../../../src/utils/create';
import { skeletonKey } from './context';

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
    const skeleton = inject(skeletonKey, undefined);
    return () => {
      const owner = skeleton?.value;
      const crossNamespace = owner && owner.namespace !== ns.namespace.value;
      return (
        <div
          class={[bem(), bem({ [props.variant]: true })]}
          aria-hidden='true'
          data-skeleton-cross-namespace={crossNamespace || undefined}
          data-skeleton-animated={crossNamespace ? owner.animated : undefined}>
          {slots.default?.()}
        </div>
      );
    };
  }
});
