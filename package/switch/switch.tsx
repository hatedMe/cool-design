import { defineComponent, nextTick, type PropType } from "vue";
import { useField } from "../form/context";
export default defineComponent({
  name: "i-switch",
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
    beforeChange: Function as PropType<() => boolean | Promise<boolean>>
  },
  emits: ["update:modelValue", "change"],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    return () => (
      <label
        class={["i-switch", props.size && `i-switch--${props.size}`]}
        style={{ "--i-switch-on": props.activeColor, "--i-switch-off": props.inactiveColor }}>
        <input
          {...attrs}
          id={(attrs.id as string) || field?.id}
          type="checkbox"
          role="switch"
          aria-checked={props.modelValue === props.activeValue}
          checked={props.modelValue === props.activeValue}
          disabled={props.disabled || field?.disabled?.() || props.loading}
          onChange={(event: Event) => {
            if (props.disabled || props.loading) return;
            const value = (event.target as HTMLInputElement).checked;
            const next = value ? props.activeValue : props.inactiveValue;
            Promise.resolve(props.beforeChange?.() ?? true).then((allowed) => {
              if (!allowed) return;
              emit("update:modelValue", next);
              emit("change", next);
              nextTick(() => field?.validate("change"));
            });
          }}
        />
        <span class="i-switch__track" aria-hidden="true" />
        {(props.activeText || props.inactiveText) && (
          <span class="i-switch__text">
            {props.modelValue === props.activeValue ? props.activeText : props.inactiveText}
          </span>
        )}
        {slots.default?.()}
      </label>
    );
  }
});
