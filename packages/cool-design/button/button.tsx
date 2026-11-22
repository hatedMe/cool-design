import {
  Text,
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  toRefs,
  type Component,
  type ComponentPublicInstance,
  type PropType
} from 'vue';
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
  setup(props, { slots, emit, attrs, expose }) {
    const config = useConfig();
    const group = inject(buttonGroupKey, undefined);
    const form = inject(formKey, undefined);
    const element = shallowRef<Element | ComponentPublicInstance>();
    const resolvedType = computed(() => props.type ?? group?.type ?? config.value.button?.type ?? 'default');
    const resolvedSize = computed(() =>
      props.size === 'normal' ? 'default' : props.size ?? group?.size ?? config.value.size
    );
    const resolvedDisabled = computed(() => !!(props.disabled || props.loading || form?.disabled?.()));
    const shouldAddSpace = ref(false);
    let renderedShouldAddSpace = false;
    const syncSpacing = () => {
      shouldAddSpace.value = renderedShouldAddSpace;
    };
    // The slot is evaluated by the render function. Publish its result after the render.
    onMounted(syncSpacing);
    onUpdated(syncSpacing);
    expose({
      ...toRefs(props),
      get ref() {
        return element.value ?? undefined;
      },
      get size() {
        return resolvedSize.value;
      },
      get type() {
        return resolvedType.value;
      },
      get disabled() {
        return resolvedDisabled.value;
      },
      get shouldAddSpace() {
        return shouldAddSpace.value;
      }
    });

    return () => {
      const defaults = config.value.button;
      const plain = props.plain ?? defaults?.plain;
      const text = props.text ?? defaults?.text;
      const round = props.round ?? defaults?.round;
      const dashed = props.dashed ?? defaults?.dashed;
      const autoInsertSpace = props.autoInsertSpace ?? defaults?.autoInsertSpace;
      const disabled = resolvedDisabled.value;
      const isText = text || resolvedType.value === 'text';
      const customStyle = props.color
        ? buttonCustomStyle(props.color, { dark: props.dark, plain, text: isText, link: props.link })
        : undefined;
      const classes = [
        'i-button',
        `i-button--${resolvedSize.value}`,
        `i-button--${resolvedType.value}`,
        disabled && 'is-disabled',
        props.loading && 'is-loading',
        plain && 'is-plain',
        isText && 'is-text',
        isText && props.bg && 'is-has-bg',
        props.link && 'is-link',
        round && 'is-round',
        props.circle && 'is-circle',
        dashed && 'is-dashed'
      ];
      const defaultSlot = slots.default?.();
      const textNode = defaultSlot?.[0];
      const spacedText =
        autoInsertSpace && defaultSlot?.length === 1 && textNode?.type === Text && typeof textNode.children === 'string'
          ? /^(\s*\p{Unified_Ideograph})(\p{Unified_Ideograph}\s*)$/u.exec(textNode.children)
          : null;
      renderedShouldAddSpace = spacedText !== null;
      const content = spacedText ? [spacedText[1], ' ', spacedText[2]] : defaultSlot;
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
          ref: element,
          class: [attrs.class, classes],
          style: [attrs.style, customStyle],
          type: props.tag === 'button' ? props.nativeType : undefined,
          autofocus: props.autofocus || undefined,
          disabled: props.tag === 'button' ? disabled : undefined,
          'aria-disabled': props.tag !== 'button' && disabled ? 'true' : undefined,
          'aria-busy': props.loading || undefined,
          onClick: (event: MouseEvent) => {
            if (disabled) {
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
