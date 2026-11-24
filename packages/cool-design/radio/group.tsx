import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, inject, nextTick, provide, type InjectionKey, type PropType } from 'vue';
import Radio, { type RadioValue } from './radio';
import RadioButton from '../radio-button/radio-button';
import { fieldDescription, formKey, useFieldControl } from '../form/context';

export interface RadioItem {
  uid: number;
  get value(): RadioValue | undefined;
  get disabled(): boolean;
  focus: () => void;
}

export interface RadioGroupContext {
  modelValue: RadioValue | undefined;
  name?: string;
  disabled: boolean;
  size?: string;
  namespace: string;
  fill?: string;
  textColor?: string;
  update: (value: RadioValue) => void;
  register: (item: RadioItem) => void;
  unregister: (uid: number) => void;
  tabstopFor: (uid: number) => 0 | -1;
}
export const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('radio-group');

export default defineComponent({
  name: 'i-radio-group',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean] as PropType<RadioValue>,
    name: String,
    options: Array as PropType<Record<string, unknown>[]>,
    props: Object as PropType<{ value?: string; label?: string; disabled?: string }>,
    type: { type: String as PropType<'radio' | 'button'>, default: 'radio' },
    disabled: Boolean,
    size: String,
    fill: String,
    textColor: String,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const ns = useNamespace('radio-group');
    const field = useFieldControl();
    const form = inject(formKey, undefined);
    const items: RadioItem[] = [];
    const register: RadioGroupContext['register'] = (item) => {
      if (!items.some((existing) => existing.uid === item.uid)) items.push(item);
    };
    const unregister: RadioGroupContext['unregister'] = (uid) => {
      const index = items.findIndex((item) => item.uid === uid);
      if (index >= 0) items.splice(index, 1);
    };
    const update: RadioGroupContext['update'] = (value) => {
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };
    // 键盘停靠点：选中项；无选中时第一个可用项。
    const tabstopFor: RadioGroupContext['tabstopFor'] = (uid) => {
      const enabled = items.filter((item) => !item.disabled);
      if (!enabled.length) return -1;
      const anchor = enabled.find((item) => item.value !== undefined && item.value === props.modelValue) ?? enabled[0];
      return anchor.uid === uid ? 0 : -1;
    };
    // 手动 roving tabindex：方向键在可用项间移动选择并聚焦，跳过禁用项。
    const move = (step: 1 | -1) => {
      const enabled = items.filter((item) => !item.disabled);
      if (enabled.length <= 1) return;
      const currentIndex = enabled.findIndex((item) => item.value !== undefined && item.value === props.modelValue);
      const target = enabled[(currentIndex + step + enabled.length) % enabled.length];
      if (target && target.value !== undefined) {
        update(target.value);
        target.focus();
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (props.disabled || (field?.disabled?.() ?? form?.disabled?.())) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        move(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        move(-1);
      }
    };
    provide(radioGroupKey, {
      get modelValue() {
        return props.modelValue;
      },
      get name() {
        return props.name;
      },
      get disabled() {
        return props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());
      },
      get size() {
        return props.size;
      },
      get namespace() {
        return ns.namespace.value;
      },
      get fill() {
        return props.fill;
      },
      get textColor() {
        return props.textColor;
      },
      update,
      register,
      unregister,
      tabstopFor
    });
    return () => (
      <div
        class={ns.b()}
        role='radiogroup'
        aria-labelledby={attrs['aria-label'] ? undefined : field?.getLabelId?.()}
        onKeydown={onKeydown}
        style={{
          [ns.cssVarName('radio-button-checked-bg-color')]: props.fill,
          [ns.cssVarName('radio-button-checked-text-color')]: props.textColor
        }}
        {...attrs}
        aria-describedby={fieldDescription(field, attrs['aria-describedby'])}>
        {slots.default ? slots.default() : props.options?.map((option, index) => {
          const { value = 'value', label = 'label', disabled = 'disabled' } = props.props ?? {};
          const Component = props.type === 'button' ? RadioButton : Radio;
          const { [value]: rawValue, [label]: rawLabel, [disabled]: rawDisabled, ...attributes } = option;
          const optionValue = rawValue as RadioValue | undefined;
          const optionLabel = rawLabel as RadioValue | undefined;
          return <Component {...attributes} value={optionValue} label={optionLabel}
            key={index} disabled={Boolean(rawDisabled)}>{String(optionLabel ?? '')}</Component>;
        })}
      </div>
    );
  }
});
