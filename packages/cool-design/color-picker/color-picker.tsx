import { computed, defineComponent, getCurrentInstance, inject, nextTick, ref, watch, Teleport, type PropType } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useConfig, type Size } from '../config-provider/context';
import { formKey, useField } from '../form/context';
import { useFloating } from '../../../src/utils/use-floating';

import { parseColor, formatColor, nativeColor, type ColorFormat } from './color';

export default defineComponent({
  name: 'i-color-picker',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean | null>, default: undefined },
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function], default: undefined },
    clearable: { type: Boolean, default: true },
    teleported: { type: Boolean, default: true },
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
    showAlpha: Boolean,
    disabled: Boolean,
    colorFormat: { type: String as () => ColorFormat, default: 'hex' },
    predefine: { type: Array as () => string[], default: () => [] },
    size: String as PropType<Size>,
    tabindex: { type: [String, Number], default: 0 },
    popperClass: { type: String, default: '' },
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'active-change', 'clear'],
  setup(props, { attrs, emit, slots, expose }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const size = computed(() => props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size);
    const isDisabled = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());
    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const instance = getCurrentInstance();
    const modelColor = () => {
      const supplied = instance?.vnode.props;
      const value = props.modelValue === undefined && !('modelValue' in (supplied ?? {})) &&
        !('model-value' in (supplied ?? {})) ? '#409eff' : props.modelValue;
      return typeof value === 'string' && !isEmptyValue(value) ? value : '';
    };
    const open = ref(false);
    const currentColor = ref(modelColor() || '#409eff');
    const alpha = ref(parseColor(modelColor() || '#409eff').alpha * 100);
    const trigger = ref<HTMLButtonElement>();
    const panel = ref<HTMLElement>();
    const position = useFloating({
      open,
      reference: trigger,
      floating: panel,
      placement: () => 'bottom-start',
      appendTo: () => props.appendTo,
      close: () => close()
    });
    const reset = () => {
      currentColor.value = modelColor() || '#409eff';
      alpha.value = parseColor(currentColor.value).alpha * 100;
    };
    watch(
      modelColor,
      () => {
        reset();
      }
    );
    const update = (value: string) => {
      currentColor.value = value;
      const formatted = formatColor(value, props.colorFormat, alpha.value / 100, props.showAlpha);
      emit('active-change', formatted);
    };
    const commit = (value: string | null) => {
      if (isDisabled()) return;
      const formatted = value === null ? getValueOnClear(null) : formatColor(value, props.colorFormat, alpha.value / 100, props.showAlpha);
      emit('update:modelValue', formatted);
      emit('change', formatted);
      if (value === null) emit('clear');
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      close();
    };
    const close = () => {
      open.value = false;
      reset();
      trigger.value?.focus();
    };
    watch(isDisabled, (disabled) => { if (disabled && open.value) close(); });
    const show = () => {
      if (isDisabled() || open.value) return;
      reset();
      open.value = true;
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    expose({ show, hide: close, focus: () => trigger.value?.focus(), blur: () => trigger.value?.blur() });
    // id 绑定在触发按钮上以关联表单标签，根节点不重复携带。
    const rootAttrs: Record<string, unknown> = { ...attrs };
    delete rootAttrs.id;
    return () => (
      <span
        {...rootAttrs}
        class={['i-color-picker', `i-color-picker--${size.value}`, { 'is-disabled': isDisabled() }]}
        aria-disabled={isDisabled() ? 'true' : undefined}
        onKeydown={onKeydown}
      >
        <button
          ref={trigger}
          type='button'
          class='i-color-picker__trigger'
          id={(attrs.id as string) || field?.id}
          disabled={isDisabled()}
          tabindex={props.tabindex}
          aria-label='选择颜色'
          aria-expanded={open.value}
          aria-haspopup='dialog'
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}
          style={{ backgroundColor: open.value ? currentColor.value : modelColor() || undefined }}
          onClick={() => open.value ? close() : show()}
        >
          {slots.default?.()}
        </button>
        {open.value && !isDisabled() && (
          <Teleport to={position.target.value} disabled={!props.teleported}>
          <div ref={panel} class={['i-color-picker__panel', props.popperClass]} style={position.style.value} role='dialog'>
            <input
              type='color'
              value={nativeColor(currentColor.value)}
              onInput={(event: Event) => update((event.target as HTMLInputElement).value)}
            />
            {props.showAlpha && (
              <input
                type='range'
                min='0'
                max='100'
                value={alpha.value}
                aria-label='透明度'
                onInput={(event: Event) => {
                  alpha.value = Number((event.target as HTMLInputElement).value);
                  update(currentColor.value);
                }}
              />
            )}
            {props.predefine.length > 0 && (
              <div class='i-color-picker__presets'>
                {props.predefine.map((color) => (
                  <button
                    type='button'
                    key={color}
                    disabled={isDisabled()}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                    onClick={() => {
                      alpha.value = parseColor(color).alpha * 100;
                      update(color);
                    }}
                  />
                ))}
              </div>
            )}
            <div class='i-color-picker__actions'>
              {props.clearable && <button type='button' class='i-color-picker__clear' onClick={() => commit(null)}>清空</button>}
              <button type='button' class='i-color-picker__confirm' onClick={() => commit(currentColor.value)}>确定</button>
            </div>
          </div>
          </Teleport>
        )}
      </span>
    );
  }
});
