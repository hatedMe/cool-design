import { computed, defineComponent, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('empty');

export default defineComponent({
  name,
  props: {
    description: { type: String, default: '' },
    image: String,
    imageSize: { type: [String, Number] as PropType<string | number>, default: undefined }
  },
  setup(props, { slots }) {
    const imageStyle = computed(() => {
      const size = typeof props.imageSize === 'number' ? `${props.imageSize}px` : props.imageSize;
      return size ? { width: size, height: size } : undefined;
    });
    return () => (
      <div class={name}>
        <div class={bem('image')} aria-hidden='true'>
          {slots.image?.() ??
            (props.image ? (
              <img src={props.image} alt={props.description} style={imageStyle.value} />
            ) : (
              <svg
                viewBox='0 0 64 48'
                fill='none'
                role='img'
                aria-label={props.description}
                style={imageStyle.value}>
                <path d='M8 18 20 6h24l12 12v24H8Z' stroke='currentColor' stroke-width='2' />
                <path d='M8 22h15l4 7h10l4-7h15M20 6l3 16m21-16-3 16' stroke='currentColor' stroke-width='2' />
              </svg>
            ))}
        </div>
        <div class={bem('description')}>{slots.description?.() ?? props.description}</div>
        {slots.default && <div class={bem('action')}>{slots.default()}</div>}
      </div>
    );
  }
});
