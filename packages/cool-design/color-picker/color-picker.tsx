import { computed, defineComponent, getCurrentInstance, inject, nextTick, ref, watch, Teleport, type PropType, type CSSProperties } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useNamespace } from '../../hooks/use-namespace';
import { useConfig, type Size } from '../config-provider/context';
import { fieldDescription, formKey, useFieldControl } from '../form/context';
import { createBEM } from '../../../src/utils/create';
import { useFloating, useFloatingTheme } from '../../../src/utils/use-floating';

import ColorPickerPanel from '../color-picker-panel';
import { parseColor, formatColor, type ColorFormat } from './color';

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
    persistent: { type: Boolean, default: true },
    popperStyle: [String, Object, Array] as PropType<string | CSSProperties | CSSProperties[]>,
    popperClass: { type: String, default: '' },
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'active-change', 'clear'],
  setup(props, { attrs, emit, slots, expose }) {
    const field = useFieldControl((fallback) => (attrs.id as string) || fallback);
    const form = inject(formKey, undefined);
    const config = useConfig();
    const ns = useNamespace('color-picker');
    const bem = createBEM(ns.b);
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
    const shown = ref(false);
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
    const panelTheme = useFloatingTheme(position.target, () => props.teleported);
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
      if (!open.value || isDisabled() || currentColor.value === value) return;
      currentColor.value = value;
      alpha.value = parseColor(value).alpha * 100;
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
      shown.value = true;
      open.value = true;
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    expose({ show, hide: close, focus: () => trigger.value?.focus(), blur: () => trigger.value?.blur() });
    // id 绑定在触发按钮上以关联表单标签，根节点不重复携带。
    return () => {
      const { id, 'aria-label': label, 'aria-labelledby': labelledBy, ...rootAttrs } = attrs;
      return (
      <span
        {...rootAttrs}
        class={[bem(), ns.m(size.value), ns.is('disabled', isDisabled())]}
        aria-disabled={isDisabled() ? 'true' : undefined}
        onKeydown={onKeydown}
      >
        <button
          ref={trigger}
          type='button'
          class={bem('trigger')}
          id={(id as string) || field?.id}
          disabled={isDisabled()}
          tabindex={props.tabindex}
          aria-labelledby={(labelledBy as string) || (label ? undefined : field?.getLabelId?.())}
          aria-label={(label as string) || (labelledBy || field?.getLabelId?.() ? undefined : '选择颜色')}
          aria-expanded={open.value}
          aria-haspopup='dialog'
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={fieldDescription(field, attrs['aria-describedby'])}
          style={{ backgroundColor: open.value ? currentColor.value : modelColor() || undefined }}
          onClick={() => open.value ? close() : show()}
        >
          {slots.default?.()}
        </button>
        {(open.value || (shown.value && props.persistent)) && (
          <Teleport to={position.target.value} disabled={!props.teleported}>
          <div ref={panel} class={[bem('panel'), panelTheme.value.scopeClass, props.popperClass]}
            data-theme={panelTheme.value.theme}
            style={[panelTheme.value.style, position.style.value, props.popperStyle, !open.value ? { display: 'none' } : undefined]}
            aria-hidden={!open.value || undefined} role='dialog'>
            <ColorPickerPanel popupEditor modelValue={currentColor.value} border={false} disabled={isDisabled()}
              showAlpha={props.showAlpha} colorFormat={props.colorFormat} predefine={props.predefine}
              validateEvent={false} onUpdate:modelValue={update} />
            <div class={bem('actions')}>
              {props.clearable && <button type='button' class={bem('clear')} onClick={() => commit(null)}>清空</button>}
              <button type='button' class={bem('confirm')} onClick={() => commit(currentColor.value)}>确定</button>
            </div>
          </div>
          </Teleport>
        )}
      </span>
      );
    };
  }
});
