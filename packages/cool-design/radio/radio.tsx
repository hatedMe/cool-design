import { defineComponent, getCurrentInstance, inject, nextTick, onBeforeUnmount, ref, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import { useField, formKey } from '../form/context';
import { useConfig } from '../config-provider/context';
import { radioGroupKey } from './group';
const [name, bem] = createNamespace('radio');
export type RadioValue = string | number | boolean;

export default defineComponent({
  name,
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean] as PropType<RadioValue>,
    value: { type: [String, Number, Boolean] as PropType<RadioValue>, default: undefined },
    label: { type: [String, Number, Boolean] as PropType<RadioValue>, default: undefined },
    disabled: Boolean,
    name: String,
    border: Boolean,
    size: String
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    const config = useConfig();
    const form = inject(formKey, undefined);
    const group = inject(radioGroupKey, undefined);
    const input = ref<HTMLInputElement>();
    const uid = getCurrentInstance()?.uid ?? 0;
    if (group) {
      // 登记到组以支持 roving tabindex 与方向键导航。
      group.register({
        uid,
        get value() {
          return props.value !== undefined ? props.value : props.label;
        },
        get disabled() {
          return props.disabled;
        },
        focus: () => input.value?.focus()
      });
    }
    onBeforeUnmount(() => group?.unregister(uid));
    return () => {
      const value = props.value !== undefined ? props.value : props.label;
      const disabled = props.disabled || field?.disabled?.() || form?.disabled?.() || group?.disabled || false;
      const size = props.size ?? group?.size ?? field?.size?.() ?? config.value.size;
      return (
      <label class={[bem({ 'is-disabled': disabled, 'is-bordered': props.border }), size && size !== 'default' ? `i-radio--${size}` : undefined]}>
        <input
          {...attrs}
          id={(attrs.id as string) || field?.id}
          ref={input}
          type='radio'
          value={String(value ?? '')}
          name={props.name || group?.name || (attrs.name as string | undefined)}
          checked={(group?.modelValue ?? props.modelValue) === value}
          disabled={disabled}
          tabindex={group ? group.tabstopFor(uid) : undefined}
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}
          onChange={() => {
            if (disabled || value === undefined) return;
            if (group) {
              group.update(value);
              return;
            }
            emit('update:modelValue', value);
            emit('change', value);
            nextTick(() => field?.validate('change'));
          }}
        />
        <span class={bem('text')}>{slots.default?.()}</span>
      </label>
      );
    };
  }
});
