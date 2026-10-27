import { defineComponent, h, inject, type PropType } from 'vue';
import { useConfig } from '../config-provider/context';
import type { ButtonType, ButtonSize } from './types';
import { buttonGroupKey } from './group';
export type { ButtonType } from './types';
export default defineComponent({
  name: 'i-button',
  props: {
    size: String as PropType<ButtonSize>,
    type: { type: String as PropType<ButtonType>, default: 'default' },
    disabled: Boolean,
    loading: Boolean,
    nativeType: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    plain: Boolean,
    text: Boolean,
    link: Boolean,
    round: Boolean,
    circle: Boolean,
    dashed: Boolean,
    icon: String,
    loadingIcon: String,
    color: String,
    dark: Boolean,
    tag: { type: String as PropType<'button' | 'a' | 'div'>, default: 'button' },
    autoInsertSpace: Boolean
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const config = useConfig();
    const group = inject(buttonGroupKey, undefined);
    return () => {
      const classes = [
        'i-button',
        `i-button--${props.size === 'normal' ? 'default' : props.size || group?.size || config.value.size}`,
        `i-button--${props.type !== 'default' ? props.type : group?.type || props.type}`,
        props.plain && 'is-plain',
        props.text && 'is-text',
        props.link && 'is-link',
        props.round && 'is-round',
        props.circle && 'is-circle',
        props.dashed && 'is-dashed'
      ];
      const content =
        props.autoInsertSpace &&
        !props.icon &&
        !props.loading &&
        slots.default?.()?.length === 1 &&
        typeof slots.default?.()[0]?.children === 'string' &&
        /^[\u4e00-\u9fff]{2}$/.test(String(slots.default?.()[0]?.children))
          ? [slots.default?.()[0], ' ']
          : slots.default?.();
      return h(
        props.tag,
        {
          ...attrs,
          class: [attrs.class, classes],
          style: [
            attrs.style,
            props.color || props.dark ? { '--i-button-color': props.color || '#626aef' } : undefined
          ],
          type: props.tag === 'button' ? props.nativeType : undefined,
          disabled: props.tag === 'button' ? props.disabled || props.loading : undefined,
          'aria-disabled': props.tag !== 'button' && (props.disabled || props.loading) ? 'true' : undefined,
          'aria-busy': props.loading || undefined,
          onClick: (event: MouseEvent) => {
            if (!props.disabled && !props.loading) emit('click', event);
          }
        },
        [
          props.loading &&
            h(
              'span',
              { class: 'i-button__loading', 'aria-hidden': 'true' },
              slots.loading?.() ?? h('i', { class: [props.loadingIcon, 'i-button__icon'] }, '...')
            ),
          !props.loading &&
            (slots.icon?.() ??
              (props.icon && h('i', { class: ['i-button__icon', props.icon], 'aria-hidden': 'true' }))),
          content
        ]
      );
    };
  }
});
