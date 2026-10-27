import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'i-color-picker',
  props: {
    modelValue: { type: String, default: '#409eff' },
    showAlpha: Boolean,
    disabled: Boolean,
    colorFormat: { type: String, default: 'hex' },
    predefine: { type: Array as () => string[], default: () => [] }
  },
  emits: ['update:modelValue', 'change', 'active-change'],
  setup(props, { emit }) {
    const open = ref(false);
    const update = (value: string) => {
      emit('update:modelValue', value);
      emit('change', value);
      emit('active-change', value);
    };
    return () => (
      <span class='i-color-picker'>
        <button
          type='button'
          class='i-color-picker__trigger'
          disabled={props.disabled}
          aria-label='选择颜色'
          style={{ backgroundColor: props.modelValue }}
          onClick={() => (open.value = !open.value)}
        />
        {open.value && (
          <div class='i-color-picker__panel'>
            <input
              type='color'
              value={props.modelValue}
              disabled={props.disabled}
              onInput={(e: Event) => update((e.target as HTMLInputElement).value)}
            />
            {props.showAlpha && <input type='range' min='0' max='100' aria-label='透明度' />}
            {props.predefine.length > 0 && (
              <div class='i-color-picker__presets'>
                {props.predefine.map((color) => (
                  <button
                    type='button'
                    key={color}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                    onClick={() => update(color)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </span>
    );
  }
});
