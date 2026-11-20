import { defineComponent, h, inject, type Component, type PropType } from 'vue';
import { useConfig } from '../config-provider/context';
import { formKey } from '../form/context';
import type { ButtonType, ButtonSize, ButtonNativeType, IconProp } from './types';
import { buttonGroupKey } from './group';
import { buttonCustomStyle } from './custom-style';
import Icon from '../icon';
export type { ButtonType, ButtonSize, ButtonNativeType, ButtonGroupDirection, IButtonProps, IconProp } from './types';
export default defineComponent({
  name: 'i-button',
  props: {
    size: String as PropType<ButtonSize>,
    type: String as PropType<ButtonType>,
    disabled: Boolean,
    loading: Boolean,
    autofocus: Boolean,
    nativeType: { type: String as PropType<ButtonNativeType>, default: 'button' },
    plain: { type: Boolean, default: undefined },
    text: { type: Boolean, default: undefined },
    bg: Boolean,
    link: Boolean,
    round: { type: Boolean, default: undefined },
    circle: Boolean,
    dashed: { type: Boolean, default: undefined },
    icon: [String, Object, Function] as PropType<IconProp>,
    loadingIcon: [String, Object, Function] as PropType<IconProp>,
    color: String,
    dark: Boolean,
    tag: { type: [String, Object, Function] as PropType<string | Component>, default: 'button' },
    autoInsertSpace: { type: Boolean, default: undefined }
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const config = useConfig();
    const group = inject(buttonGroupKey, undefined);
    const form = inject(formKey, undefined);
    return () => {
      const defaults = config.value.button;
      const resolvedType = props.type ?? group?.type ?? defaults?.type ?? 'default';
      const plain = props.plain ?? defaults?.plain;
      const text = props.text ?? defaults?.text;
      const round = props.round ?? defaults?.round;
      const dashed = props.dashed ?? defaults?.dashed;
      const autoInsertSpace = props.autoInsertSpace ?? defaults?.autoInsertSpace;
      const resolvedSize = props.size === 'normal' ? 'default' : props.size ?? group?.size ?? config.value.size;
      const resolvedDisabled = !!(props.disabled || props.loading || form?.disabled?.());
      const isText = text || resolvedType === 'text';
      const customStyle = props.color
        ? buttonCustomStyle(props.color, { dark: props.dark, plain, text: isText, link: props.link })
        : undefined;
      const classes = [
        'i-button',
        `i-button--${resolvedSize}`,
        `i-button--${resolvedType}`,
        resolvedDisabled && 'is-disabled',
        props.loading && 'is-loading',
        plain && 'is-plain',
        isText && 'is-text',
        isText && props.bg && 'is-has-bg',
        props.link && 'is-link',
        round && 'is-round',
        props.circle && 'is-circle',
        dashed && 'is-dashed'
      ];
      const content =
        autoInsertSpace &&
        !props.icon &&
        !props.loading &&
        slots.default?.()?.length === 1 &&
        typeof slots.default?.()[0]?.children === 'string' &&
        /^[\u4e00-\u9fff]{2}$/.test(String(slots.default?.()[0]?.children))
          ? [String(slots.default?.()[0]?.children).slice(0, 1), ' ', String(slots.default?.()[0]?.children).slice(1)]
          : slots.default?.();
      const children = [
        props.loading &&
          h(
            'span',
            { class: 'i-button__loading', 'aria-hidden': 'true' },
            slots.loading?.() ??
              h(Icon, { icon: props.loadingIcon || 'icon-refresh', class: ['i-button__icon', 'is-loading'] })
          ),
        !props.loading &&
          (slots.icon?.() ??
            (props.icon && h(Icon, { icon: props.icon, class: 'i-button__icon', 'aria-hidden': 'true' }))),
        content
      ];
      return h(
        props.tag,
        {
          ...attrs,
          class: [attrs.class, classes],
          style: [attrs.style, customStyle],
          type: props.tag === 'button' ? props.nativeType : undefined,
          autofocus: props.autofocus || undefined,
          disabled: props.tag === 'button' ? resolvedDisabled : undefined,
          'aria-disabled': props.tag !== 'button' && resolvedDisabled ? 'true' : undefined,
          'aria-busy': props.loading || undefined,
          onClick: (event: MouseEvent) => {
            if (resolvedDisabled) {
              event.stopPropagation();
              return;
            }
            if (props.tag === 'button' && props.nativeType === 'reset') form?.resetFields?.();
            emit('click', event);
          }
        },
        typeof props.tag === 'string' ? children : { default: () => children }
      );
    };
  }
});
