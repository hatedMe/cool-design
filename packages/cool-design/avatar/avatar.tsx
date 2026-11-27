import { useNamespace } from '../../hooks/use-namespace';
import {
  PropType, computed, defineComponent, h, inject, ref, watch, type Component, type ComponentOptionsMixin,
  type DefineComponent
} from 'vue';
import { createBEM, createNamespace } from '../../../src/utils/create';
import Icon from '../icon';
import { avatarGroupKey } from './group-context';
const [name] = createNamespace('avatar');

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = '' | 'large' | 'default' | 'medium' | 'small' | number;
export type AvatarFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

const avatarProps = {
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
  shape: String as PropType<AvatarShape>,
  size: [String, Number] as PropType<AvatarSize>,
  icon: [String, Object, Function] as PropType<string | Component>,
  fit: {
    type: String as PropType<AvatarFit>,
    default: 'cover'
  }
};

// 公开声明使用 Vue 3.2 和 3.4 共有的构造泛型。
type EmptyOptions = Record<never, never>;
type AvatarComponent = DefineComponent<typeof avatarProps, EmptyOptions, EmptyOptions, EmptyOptions, EmptyOptions,
  ComponentOptionsMixin, ComponentOptionsMixin, 'error'[], 'error'>;
const Avatar: AvatarComponent = defineComponent({
  name,
  props: avatarProps,
  emits: ['error'],
  setup(props, { slots, emit }) {
    const ns = useNamespace('avatar');
    const bem = createBEM(ns.b);
    const group = inject(avatarGroupKey, undefined);
    const size = computed(() => {
      const value = props.size ?? group?.size ?? '';
      return value === '' ? 'default' : value;
    });
    const shape = computed(() => props.shape ?? group?.shape ?? 'circle');
    const imageError = ref(false);
    const src = computed(() => props.src || props.url);

    watch(src, () => {
      imageError.value = false;
    });

    const style = computed(() => {
      if (typeof size.value === 'number') {
        return {
          width: `${size.value}px`,
          height: `${size.value}px`
        };
      }
      return undefined;
    });

    const classLists = computed(() =>
      bem({
        [shape.value]: true,
        [size.value]: typeof size.value === 'string'
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

export default Avatar;
