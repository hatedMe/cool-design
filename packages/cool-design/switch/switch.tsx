import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, nextTick, ref, watch, type PropType, type StyleValue } from 'vue';
import Icon from '../icon/icon';
import type { IconProp } from '../icon';
import { inject } from 'vue';
import { fieldDescription, formKey, useFieldControl } from '../form/context';
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
    const ns = useNamespace('switch');
    const field = useFieldControl((fallback) => (attrs.id as string) || fallback);
    const form = inject(formKey, undefined);
    const disabledOf = () => props.disabled || (field?.disabled?.() ?? form?.disabled?.()) || props.loading;
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
    const requestChange = (target: HTMLInputElement, nativeValue?: typeof props.modelValue) => {
      if (disabledOf()) return;
      const fromKeyboard = nativeValue === undefined;
      const restoreNativeChecked = () => {
        if (!fromKeyboard) target.checked = props.modelValue === props.activeValue;
      };
      const complete = (allowed: boolean) => {
        if (!allowed || disabledOf() || (fromKeyboard && input.value !== target)) {
          restoreNativeChecked();
          return;
        }
        const next = nativeValue ?? (props.modelValue === props.activeValue ? props.inactiveValue : props.activeValue);
        emit('update:modelValue', next);
        emit('input', next);
        emit('change', next);
        if (props.validateEvent) nextTick(() => {
          if (!fromKeyboard || input.value === target) field?.validate('change');
        });
      };
      let guard: boolean | Promise<boolean>;
      try {
        guard = props.beforeChange?.() ?? true;
      } catch {
        restoreNativeChecked();
        return;
      }
      // Enter may submit the form immediately after keydown.
      if (fromKeyboard && typeof guard === 'boolean') complete(guard);
      else Promise.resolve(guard).then(complete).catch(restoreNativeChecked);
    };
    expose({ focus: () => input.value?.focus() });
    return () => {
      const componentClass = attrs.class;
      const componentStyle = attrs.style as StyleValue;
      const validValue = props.modelValue === props.activeValue || props.modelValue === props.inactiveValue;
      const active = validValue && props.modelValue === props.activeValue;
      const size = props.size || field?.size?.() || form?.size?.() || config.value.size;
      const normalizedSize = size === 'small' || size === 'default' || size === 'large' ? size : undefined;
      const disabled = disabledOf();
      const text = active ? props.activeText : props.inactiveText;
      const icon = active ? props.activeIcon : props.inactiveIcon;
      const actionIcon = active ? props.activeActionIcon : props.inactiveActionIcon;
      const stateSlot = active ? slots.active : slots.inactive;
      const actionSlot = active ? slots['active-action'] : slots['inactive-action'];
      const promptContent = props.inlinePrompt ? stateSlot?.() ?? (icon ? <Icon icon={icon} class={ns.e('icon')} /> : text?.slice(0, 1)) : undefined;
      const stateContent = stateSlot ? stateSlot() : icon ? <Icon icon={icon} class={ns.e('icon')} /> : text;
      const activeContent = slots.active?.() ?? (active ? stateContent : props.activeIcon ? <Icon icon={props.activeIcon} class={ns.e('icon')} /> : props.activeText);
      const inactiveContent = slots.inactive?.() ?? (!active ? stateContent : props.inactiveIcon ? <Icon icon={props.inactiveIcon} class={ns.e('icon')} /> : props.inactiveText);
      const inputAttrs = Object.fromEntries(Object.entries(attrs).filter(([name]) => name !== 'class' && name !== 'style'));
      return (
        <label
          class={[ns.b(), componentClass, normalizedSize && ns.m(normalizedSize), disabled && 'is-disabled', props.loading && 'is-loading']}
          style={[
            componentStyle,
            {
            ...(props.width !== undefined ? {
              width: typeof props.width === 'number' ? `${props.width}px` : props.width,
              [ns.cssVarName('switch-width')]: typeof props.width === 'number' ? `${props.width}px` : props.width
            } : {}),
            ...(props.activeColor ? { [ns.cssVarName('switch-on')]: props.activeColor, [ns.cssVarName('switch-on-color')]: props.activeColor } : {}),
            ...(props.inactiveColor ? { [ns.cssVarName('switch-off')]: props.inactiveColor, [ns.cssVarName('switch-off-color')]: props.inactiveColor } : {}),
            ...(props.borderColor ? { [ns.cssVarName('switch-border')]: props.borderColor, [ns.cssVarName('switch-border-color')]: props.borderColor } : {})
            }
          ]}>
          <input
            {...inputAttrs}
            ref={input}
            style={props.width === undefined ? undefined : { width: typeof props.width === 'number' ? `${props.width}px` : props.width }}
            id={(attrs.id as string) || field?.id}
            type='checkbox'
            aria-describedby={fieldDescription(field, attrs['aria-describedby'])}
            role='switch'
            aria-checked={active}
            aria-disabled={disabled}
            aria-label={(attrs['aria-label'] as string) || props.label}
            checked={active}
            disabled={disabled}
            onChange={(event: Event) => {
              const target = event.target as HTMLInputElement;
              requestChange(target, target.checked ? props.activeValue : props.inactiveValue);
            }}
            onKeydown={(event: KeyboardEvent) => {
              if (event.key === 'Enter') requestChange(event.currentTarget as HTMLInputElement);
            }}
          />
          {!props.inlinePrompt && inactiveContent && (
            <span class={[ns.e('inactive'), !active && 'is-active']} aria-hidden={active && !slots.inactive ? 'true' : undefined}>
              {inactiveContent}
            </span>
          )}
          <span class={[ns.e('track'), active && 'is-active']} aria-hidden={actionSlot && !props.loading ? undefined : 'true'}>
            {props.inlinePrompt && <span class={ns.e('prompt')}>{promptContent}</span>}
            <span class={[ns.e('action'), active && 'is-active']}>
              {props.loading ? <span class={ns.e('loading')} aria-hidden='true' /> : actionSlot?.() ?? (actionIcon ? <Icon icon={actionIcon} class={ns.e('action-icon')} /> : undefined)}
            </span>
          </span>
          {!props.inlinePrompt && activeContent && (
            <span class={[ns.e('active'), active && 'is-active']} aria-hidden={!active && !slots.active ? 'true' : undefined}>
              {activeContent}
            </span>
          )}
          {slots.default?.()}
        </label>
      );
    };
  }
});
