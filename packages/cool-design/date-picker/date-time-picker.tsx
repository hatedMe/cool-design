import { defineComponent, type PropType } from 'vue';
import DatePicker from './date-picker';
import type { DateValue } from './date';
import type { Size } from '../config-provider/context';
export default defineComponent({
  name: 'i-date-time-picker',
  props: {
    modelValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    format: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
    valueFormat: String,
    placeholder: String,
    startPlaceholder: String,
    endPlaceholder: String,
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    editable: { type: Boolean, default: true },
    range: Boolean,
    disabledDate: Function as PropType<(date: Date) => boolean>,
    size: String as PropType<Size>
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear'],
  setup(props, { attrs, emit }) {
    return () => (
      <DatePicker
        {...attrs}
        {...props}
        type='datetime'
        value-format={props.valueFormat}
        range={props.range}
        onUpdate:modelValue={(value: DateValue | DateValue[] | null) => emit('update:modelValue', value)}
        onChange={(value: DateValue | DateValue[] | null) => emit('change', value)}
        onBlur={(event: FocusEvent) => emit('blur', event)}
        onFocus={(event: FocusEvent) => emit('focus', event)}
        onClear={() => emit('clear')}
      />
    );
  }
});
