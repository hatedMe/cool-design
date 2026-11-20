import { computed, defineComponent, getCurrentInstance, inject, nextTick, ref, watch, Teleport, type PropType } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useConfig, type Size } from '../config-provider/context';
import { formKey, useField } from '../form/context';
import { useFloating } from '../../../src/utils/use-floating';

type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';
interface RgbaColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const parseHex = (value: string): RgbaColor => {
  const hex = value.replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((part) => `${part}${part}`).join('') : hex;
  const numeric = Number.parseInt(normalized.slice(0, 6), 16);
  if (!Number.isFinite(numeric)) return { red: 64, green: 158, blue: 255, alpha: 1 };
  return {
    red: (numeric >> 16) & 255,
    green: (numeric >> 8) & 255,
    blue: numeric & 255,
    alpha: normalized.length === 8 ? Number.parseInt(normalized.slice(6), 16) / 255 : 1
  };
};

const parseRgb = (value: string): RgbaColor => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return parseHex(value);
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  return {
    red: parts[0] || 0,
    green: parts[1] || 0,
    blue: parts[2] || 0,
    alpha: parts[3] ?? 1
  };
};

const parseHsl = (value: string): RgbaColor | undefined => {
  const match = value.match(/hsla?\(([^)]+)\)/i);
  if (!match) return undefined;
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  const hue = ((parts[0] % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(1, parts[1] / 100));
  const lightness = Math.max(0, Math.min(1, parts[2] / 100));
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const matchRgb = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  const offset = lightness - chroma / 2;
  return { red: (matchRgb[0] + offset) * 255, green: (matchRgb[1] + offset) * 255, blue: (matchRgb[2] + offset) * 255, alpha: parts[3] ?? 1 };
};

const parseHsv = (value: string): RgbaColor | undefined => {
  const match = value.match(/hsv\(([^)]+)\)/i);
  if (!match) return undefined;
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  const hue = ((parts[0] % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(1, parts[1] / 100));
  const brightness = Math.max(0, Math.min(1, parts[2] / 100));
  const chroma = brightness * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const matchRgb = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  const offset = brightness - chroma;
  return { red: (matchRgb[0] + offset) * 255, green: (matchRgb[1] + offset) * 255, blue: (matchRgb[2] + offset) * 255, alpha: parts[3] ?? 1 };
};

const parseColor = (value: string): RgbaColor => parseHsl(value) ?? parseHsv(value) ?? parseRgb(value);

const toHex = (color: RgbaColor, includeAlpha: boolean): string => {
  const value = [color.red, color.green, color.blue]
    .map((part) => Math.round(Math.max(0, Math.min(255, part))).toString(16).padStart(2, '0'))
    .join('');
  if (!includeAlpha || color.alpha >= 1) return `#${value}`;
  return `#${value}${Math.round(color.alpha * 255).toString(16).padStart(2, '0')}`;
};

const toHsv = ({ red, green, blue }: RgbaColor): [number, number, number] => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  return [Math.round((hue + 360) % 360), Math.round((max ? (delta / max) * 100 : 0) * 100) / 100, Math.round(max * 10000) / 100];
};

const toHsl = ({ red, green, blue }: RgbaColor): [number, number, number] => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  return [Math.round((hue + 360) % 360), Math.round(saturation * 100), Math.round(lightness * 100)];
};

const formatColor = (value: string, format: ColorFormat, alpha: number, showAlpha: boolean): string => {
  const parsed = { ...parseColor(value), alpha };
  if (format === 'hex') return toHex(parsed, showAlpha);
  if (format === 'hsl') {
    const [hue, saturation, lightness] = toHsl(parsed);
    return `${showAlpha ? 'hsla' : 'hsl'}(${hue}, ${saturation}%, ${lightness}%${showAlpha ? `, ${alpha}` : ''})`;
  }
  if (format === 'hsv') {
    const [hue, saturation, brightness] = toHsv(parsed);
    return `hsv(${hue}, ${saturation}%, ${brightness}%${showAlpha ? `, ${alpha}` : ''})`;
  }
  return `${showAlpha ? 'rgba' : 'rgb'}(${parsed.red}, ${parsed.green}, ${parsed.blue}${showAlpha ? `, ${alpha}` : ''})`;
};

const nativeColor = (value: string): string => toHex(parseColor(value), false);

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
    const isDisabled = () => props.disabled || !!field?.disabled?.();
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
