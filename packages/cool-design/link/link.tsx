import { defineComponent, type PropType } from 'vue';
import { useConfig, type Size } from '../config-provider/context';
import Icon from '../icon';
export type LinkType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type LinkUnderline = 'always' | 'hover' | 'never';
export default defineComponent({
  name: 'i-link',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<LinkType>, default: 'default' },
    size: String as PropType<Size>,
    href: String,
    target: { type: String, default: '_self' },
    disabled: Boolean,
    underline: { type: [String, Boolean] as PropType<LinkUnderline | boolean>, default: 'hover' },
    icon: [String, Object, Function] as PropType<string | import('vue').Component>
  },
  emits: ['click'],
  setup(props, { slots, attrs, emit }) {
    const config = useConfig();
    return () => {
      const underline = typeof props.underline === 'boolean' ? (props.underline ? 'hover' : 'never') : props.underline;
      const rel =
        props.target === '_blank'
          ? [
              ...new Set([String(attrs.rel || ''), 'noopener', 'noreferrer'].join(' ').split(/\s+/).filter(Boolean))
            ].join(' ')
          : (attrs.rel as string | undefined);
      return (
        <a
          {...attrs}
          class={[
            'i-link',
            `i-link--${props.type}`,
            `i-link--${props.size || config.value.size}`,
            `i-link--underline-${underline}`,
            { 'i-link--disabled': props.disabled },
            attrs.class
          ]}
          href={props.disabled ? undefined : props.href}
          target={props.disabled ? undefined : props.target}
          rel={rel}
          role={props.href ? undefined : 'button'}
          tabindex={props.disabled ? -1 : (attrs.tabindex as number | undefined) ?? (props.href ? undefined : 0)}
          aria-disabled={props.disabled || undefined}
          onClick={(event: MouseEvent) => {
            if (props.disabled) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            emit('click', event);
          }}
          onKeydown={(event: KeyboardEvent) => {
            if (
              !event.defaultPrevented &&
              !props.href &&
              !props.disabled &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              (event.currentTarget as HTMLElement).click();
            }
          }}>
          {slots.icon?.() ??
            (props.icon ? (
              <Icon icon={props.icon} type={typeof props.icon === 'string' ? props.icon : undefined} />
            ) : null)}
          {slots.default?.()}
        </a>
      );
    };
  }
});
