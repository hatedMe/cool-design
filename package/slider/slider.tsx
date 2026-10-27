import { defineComponent, type PropType } from "vue";
export default defineComponent({
  name: "i-slider",
  props: {
    modelValue: { type: [Number, Array] as PropType<number | number[]>, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: Boolean,
    range: Boolean,
    vertical: Boolean,
    showInput: Boolean,
    showStops: Boolean
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { emit }) {
    const update = (value: number | number[]) => {
      emit("update:modelValue", value);
      emit("input", value);
      emit("change", value);
    };
    const clamp = (value: number) => Math.min(props.max, Math.max(props.min, value));
    return () => (
      <div class={{ "i-slider": true, "is-vertical": props.vertical, "is-disabled": props.disabled }}>
        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step}
          value={Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue}
          disabled={props.disabled}
          onInput={(e: Event) => update(clamp(Number((e.target as HTMLInputElement).value)))}
        />
        {props.range && (
          <input
            type="range"
            min={props.min}
            max={props.max}
            step={props.step}
            value={Array.isArray(props.modelValue) ? props.modelValue[1] : props.max}
            disabled={props.disabled}
            onInput={(e: Event) => {
              const values = Array.isArray(props.modelValue) ? [...props.modelValue] : [props.min, props.max];
              values[1] = clamp(Number((e.target as HTMLInputElement).value));
              update(values);
            }}
          />
        )}
        {props.showInput && (
          <input
            class="i-slider__number"
            type="number"
            min={props.min}
            max={props.max}
            step={props.step}
            value={Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue}
            disabled={props.disabled}
            onChange={(e: Event) => update(clamp(Number((e.target as HTMLInputElement).value)))}
          />
        )}
      </div>
    );
  }
});
