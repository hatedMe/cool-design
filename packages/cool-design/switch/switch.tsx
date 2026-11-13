import { defineComponent, nextTick, ref, watch, type PropType, type StyleValue } from 'vue';
import Icon from '../icon/icon';
import type { IconProp } from '../icon';
import { useField } from '../form/context';
import { useConfig } from '../config-provider/context';
export default defineComponent({
  name: 'i-switch',
  inheritAttrs: false,
  props: {
    modelValue: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: false },
    disabled: Boolean,
    loading: Boolean,
    size: String,
    activeText: String,
    inactiveText: String,
    inlinePrompt: Boolean,
    activeValue: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: true },
    inactiveValue: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: false },
    activeColor: String,
    inactiveColor: String,
    borderColor: String,
    activeIcon: [String, Object, Function] as PropType<IconProp>,
    inactiveIcon: [String, Object, Function] as PropType<IconProp>,
    activeActionIcon: [String, Object, Function] as PropType<IconProp>,
    inactiveActionIcon: [String, Object, Function] as PropType<IconProp>,
    label: String,
    width: { type: [String, Number] as PropType<string | number>, default: undefined },
    validateEvent: { type: Boolean, default: true },
    beforeChange: Function as PropType<() => boolean | Promise<boolean>>
  },
  emits: ['update:modelValue', 'change', 'input'],
  setup(props, { attrs, emit, slots, expose }) {
    const field = useField();
    const config = useConfig();
    const input = ref<HTMLInputElement>();
    let invalidValueWarned = false;
    watch(
      () => props.modelValue,
      (value) => {
        const valid = value === props.activeValue || value === props.inactiveValue;
        if (!valid && !invalidValueWarned) {
          invalidValueWarned = true;
          console.warn('[Switch] modelValue does not match activeValue or inactiveValue.');
          emit('update:modelValue', props.inactiveValue);
          emit('input', props.inactiveValue);
          emit('change', props.inactiveValue);
        }
        if (valid) invalidValueWarned = false;
      },
      { immediate: true }
    );
    expose({ focus: () => input.value?.focus() });
    return () => {
      const componentClass = attrs.class;
      const componentStyle = attrs.style as StyleValue;
      const validValue = props.modelValue === props.activeValue || props.modelValue === props.inactiveValue;
      const active = validValue && props.modelValue === props.activeValue;
      const size = props.size || field?.size?.() || config.value.size;
      const normalizedSize = size === 'small' || size === 'default' || size === 'large' ? size : undefined;
      const disabled = props.disabled || field?.disabled?.() || props.loading;
      const text = active ? props.activeText : props.inactiveText;
      const icon = active ? props.activeIcon : props.inactiveIcon;
      const actionIcon = active ? props.activeActionIcon : props.inactiveActionIcon;
      const stateSlot = active ? slots.active : slots.inactive;
      const actionSlot = active ? slots['active-action'] : slots['inactive-action'];
      const promptContent = props.inlinePrompt ? stateSlot?.() ?? (icon ? <Icon icon={icon} class='i-switch__icon' /> : text?.slice(0, 1)) : undefined;
      const stateContent = stateSlot ? stateSlot() : icon ? <Icon icon={icon} class='i-switch__icon' /> : text;
      const activeContent = slots.active?.() ?? (active ? stateContent : props.activeIcon ? <Icon icon={props.activeIcon} class='i-switch__icon' /> : props.activeText);
      const inactiveContent = slots.inactive?.() ?? (!active ? stateContent : props.inactiveIcon ? <Icon icon={props.inactiveIcon} class='i-switch__icon' /> : props.inactiveText);
      const inputAttrs = Object.fromEntries(Object.entries(attrs).filter(([name]) => name !== 'class' && name !== 'style'));
      return (
        <label
          class={['i-switch', componentClass, normalizedSize && `i-switch--${normalizedSize}`, disabled && 'is-disabled', props.loading && 'is-loading']}
          style={[
            componentStyle,
            {
            ...(props.width !== undefined ? {
              width: typeof props.width === 'number' ? `${props.width}px` : props.width,
              '--i-switch-width': typeof props.width === 'number' ? `${props.width}px` : props.width
            } : {}),
            ...(props.activeColor ? { '--i-switch-on': props.activeColor, '--i-switch-on-color': props.activeColor } : {}),
            ...(props.inactiveColor ? { '--i-switch-off': props.inactiveColor, '--i-switch-off-color': props.inactiveColor } : {}),
            ...(props.borderColor ? { '--i-switch-border': props.borderColor, '--i-switch-border-color': props.borderColor } : {})
            }
          ]}>
          <input
            {...inputAttrs}
            ref={input}
            style={props.width === undefined ? undefined : { width: typeof props.width === 'number' ? `${props.width}px` : props.width }}
            id={(attrs.id as string) || field?.id}
            type='checkbox'
            role='switch'
            aria-checked={active}
            aria-disabled={disabled}
            aria-label={(attrs['aria-label'] as string) || props.label}
            checked={active}
            disabled={disabled}
            onChange={(event: Event) => {
              if (disabled) return;
              const target = event.target as HTMLInputElement;
              const value = target.checked;
              const next = value ? props.activeValue : props.inactiveValue;
              let guard: boolean | Promise<boolean>;
              try {
                guard = props.beforeChange?.() ?? true;
              } catch {
                target.checked = active;
                return;
              }
              Promise.resolve(guard)
                .then((allowed) => {
                  if (!allowed) {
                    target.checked = active;
                    return;
                  }
                  emit('update:modelValue', next);
                  emit('input', next);
                  emit('change', next);
                  if (props.validateEvent) nextTick(() => field?.validate('change'));
                })
                .catch(() => {
                  target.checked = active;
                });
            }}
          />
          {!props.inlinePrompt && inactiveContent && (
            <span class={['i-switch__inactive', !active && 'is-active']} aria-hidden={active && !slots.inactive ? 'true' : undefined}>
              {inactiveContent}
            </span>
          )}
          <span class={['i-switch__track', active && 'is-active']} aria-hidden={actionSlot && !props.loading ? undefined : 'true'}>
            {props.inlinePrompt && <span class='i-switch__prompt'>{promptContent}</span>}
            <span class={['i-switch__action', active && 'is-active']}>
              {props.loading ? <span class='i-switch__loading' aria-hidden='true' /> : actionSlot?.() ?? (actionIcon ? <Icon icon={actionIcon} class='i-switch__action-icon' /> : undefined)}
            </span>
          </span>
          {!props.inlinePrompt && activeContent && (
            <span class={['i-switch__active', active && 'is-active']} aria-hidden={!active && !slots.active ? 'true' : undefined}>
              {activeContent}
            </span>
          )}
          {slots.default?.()}
        </label>
      );
    };
  }
});
