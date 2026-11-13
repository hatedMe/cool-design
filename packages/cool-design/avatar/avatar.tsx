import { PropType, computed, defineComponent, h, ref, watch, type Component } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import Icon from '../icon';
const [name, bem] = createNamespace('avatar');

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'large' | 'default' | 'medium' | 'small' | number;
export type AvatarFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

const isNumber = (value: unknown): boolean => typeof value === 'number';

export default defineComponent({
  name,
  props: {
    /** 兼容别名，等价于 `src` */
    url: {
      type: String,
      default: ''
    },
    src: {
      type: String,
      default: ''
    },
    srcSet: String,
    alt: { type: String, default: '' },
    /**
     * @description 形状
     * - `circle` 圆形
     * - `square` 方形
     */
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle'
    },
    size: {
      type: [String, Number] as PropType<AvatarSize>,
      default: 'large'
    },
    icon: [String, Object, Function] as PropType<string | Component>,
    fit: {
      type: String as PropType<AvatarFit>,
      default: 'cover'
    }
  },
  emits: ['error'],
  setup(props, { slots, emit }) {
    const imageError = ref(false);
    const src = computed(() => props.src || props.url);

    watch(src, () => {
      imageError.value = false;
    });

    const style = computed(() => {
      if (isNumber(props.size)) {
        return {
          width: `${props.size}px`,
          height: `${props.size}px`
        };
      }
      return undefined;
    });

    const classLists = computed(() =>
      bem({
        [props.shape]: true,
        [props.size]: !isNumber(props.size)
      })
    );

    const renderIcon = () => {
      if (!props.icon) return undefined;
      if (typeof props.icon !== 'string') return h(props.icon);
      return <Icon type={props.icon} />;
    };

    return () => {
      const showImage = !imageError.value && !!src.value;
      return (
        <div class={classLists.value} style={style.value}>
          {showImage && (
            <img
              class={[bem('img'), bem('img', { [props.fit]: true })]}
              src={src.value}
              srcset={props.srcSet}
              alt={props.alt}
              onError={(event: Event) => {
                imageError.value = true;
                emit('error', event);
              }}
            />
          )}
          {!showImage &&
            (imageError.value
              ? (slots.fallback?.() ?? renderIcon() ?? slots.default?.())
              : (renderIcon() ?? slots.default?.()))}
        </div>
      );
    };
  }
});
