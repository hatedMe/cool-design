import Input, { type InputInstance } from '../input';
import { TinyColor } from '@ctrl/tinycolor';
import { computed, defineComponent, inject, nextTick, ref, watch, type CSSProperties, type PropType, type ExtractPropTypes } from 'vue';
import { createBEM } from '../../../src/utils/create';
import { useNamespace } from '../../hooks/use-namespace';
import { formKey, useField } from '../form/context';
import { nativeColor, type ColorFormat } from '../color-picker/color';

export const colorPickerPanelProps = {
    modelValue: { type: String as PropType<string | null>, default: '' },
    popupEditor: Boolean,
    border: { type: Boolean, default: true },
    disabled: Boolean,
    showAlpha: Boolean,
    colorFormat: String as PropType<ColorFormat>,
    predefine: { type: Array as PropType<string[]>, default: () => [] },
    validateEvent: { type: Boolean, default: true },
    hueSliderClass: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    hueSliderStyle: [String, Object, Array] as PropType<string | CSSProperties | CSSProperties[]>
};
export const colorPickerPanelEmits = { 'update:modelValue': (value: string) => typeof value === 'string' };
export type ColorPickerPanelProps = Partial<ExtractPropTypes<typeof colorPickerPanelProps>>;
export type ColorPickerPanelEmits = typeof colorPickerPanelEmits;

export default defineComponent({
  name: 'i-color-picker-panel',
  props: colorPickerPanelProps,
  emits: colorPickerPanelEmits,
  setup(props, { emit, slots, expose }) {
    const ns = useNamespace('color-picker-editor');
    const bem = createBEM(ns.b);
    const pickerNs = useNamespace('color-picker');
    const field = useField();
    const form = inject(formKey, undefined);
    const disabled = computed(() => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.()));
    const inputRef = ref<InputInstance>();
    const text = ref(props.modelValue ?? '');
    const hue = ref(0);
    const saturation = ref(0);
    const brightness = ref(0);
    const alpha = ref(1);
    const current = () => new TinyColor({ h: hue.value, s: saturation.value / 100, v: brightness.value / 100, a: alpha.value });
    const serialize = (color: TinyColor) => {
      const format = props.colorFormat ?? (props.showAlpha ? 'rgb' : 'hex');
      return color.toString(format === 'hex' && props.showAlpha ? 'hex8' : format);
    };
    let synchronizedText: string | undefined;
    const load = (value: string | null) => {
      const parsed = new TinyColor(value ?? '');
      const { h, s, v, a } = parsed.isValid ? parsed.toHsv() : new TinyColor('red').toHsv();
      hue.value = h;
      saturation.value = s * 100;
      brightness.value = v * 100;
      alpha.value = a;
      text.value = parsed.isValid ? serialize(parsed) : '';
    };
    load(props.modelValue);
    watch(() => props.modelValue, (value) => {
      if (value === text.value) return;
      load(value);
      if (props.popupEditor) synchronizedText = text.value;
    });
    watch(text, (value) => {
      if (props.popupEditor && value === synchronizedText) {
        synchronizedText = undefined;
        return;
      }
      synchronizedText = undefined;
      emit('update:modelValue', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    });
    const choose = (value: string) => {
      if (disabled.value) return;
      if (props.popupEditor && !new TinyColor(value).isValid) {
        if (inputRef.value?.input) inputRef.value.input.value = text.value;
        return;
      }
      load(value);
    };
    const changeChannels = () => { if (!disabled.value) text.value = serialize(current()); };
    watch(() => [props.colorFormat, props.showAlpha], () => { if (text.value) text.value = serialize(current()); });
    const channel = { hue, saturation, value: brightness, alpha };
    const color = {
      get value() { return text.value; },
      get(key: keyof typeof channel) { return Math.round(channel[key].value * (key === 'alpha' ? 100 : 1)); },
      set(key: keyof typeof channel | Partial<Record<keyof typeof channel, number>>, value?: number) {
        if (disabled.value) return;
        const settings = typeof key === 'string' ? { [key]: value } : key;
        (Object.keys(settings) as Array<keyof typeof channel>).forEach((name) => {
          const next = settings[name];
          if (next !== undefined) channel[name].value = name === 'alpha' ? next / 100 : next;
        });
        changeChannels();
      },
      fromString: choose,
      clear: () => choose(''),
      compare: (other: { toRgb(): { r: number; g: number; b: number; a: number } }) => current().equals(other.toRgb()),
      toRgb: () => text.value ? current().toRgb() : { r: 255, g: 255, b: 255, a: 0 }
    };
    const update = async () => { await nextTick(); };
    const pickPlane = (event: PointerEvent) => {
      if (disabled.value) return;
      const element = event.currentTarget as HTMLElement;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const clamp = (value: number) => Math.min(100, Math.max(0, value));
      saturation.value = clamp((event.clientX - bounds.left) * 100 / bounds.width);
      brightness.value = clamp((bounds.bottom - event.clientY) * 100 / bounds.height);
      changeChannels();
    };
    expose({ color, inputRef, update });
    return () => (
      <section class={[bem(), props.border && 'has-border']} onFocusout={(event: FocusEvent) => {
        if (props.validateEvent && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) field?.validate('blur');
      }}>
        <div class={bem('plane')} role='slider' tabindex={disabled.value ? -1 : 0}
          aria-label='饱和度与亮度' aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(saturation.value)}
          aria-valuetext={`饱和度 ${Math.round(saturation.value)}%，亮度 ${Math.round(brightness.value)}%`}
          onKeydown={(event: KeyboardEvent) => {
            if (disabled.value || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'ArrowLeft') saturation.value = Math.max(0, saturation.value - 1);
            if (event.key === 'ArrowRight') saturation.value = Math.min(100, saturation.value + 1);
            if (event.key === 'ArrowDown') brightness.value = Math.max(0, brightness.value - 1);
            if (event.key === 'ArrowUp') brightness.value = Math.min(100, brightness.value + 1);
            changeChannels();
          }}
          style={{ backgroundColor: `hsl(${hue.value}, 100%, 50%)` }}
          onPointerdown={(event: PointerEvent) => {
            if (disabled.value) return;
            (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
            pickPlane(event);
          }}
          onPointermove={(event: PointerEvent) => { if (event.buttons === 1) pickPlane(event); }}>
          <span style={{ left: `${saturation.value}%`, top: `${100 - brightness.value}%` }} />
        </div>
        <input type='range' min='0' max='360' value={hue.value} aria-label='色相' disabled={disabled.value}
          class={[bem('hue'), props.hueSliderClass]} style={props.hueSliderStyle}
          onInput={(event: Event) => { hue.value = Number((event.target as HTMLInputElement).value); changeChannels(); }} />
        <input type='color' value={nativeColor(text.value || '#409eff')} aria-label='颜色' disabled={disabled.value}
          onInput={(event: Event) => {
            const selected = new TinyColor((event.target as HTMLInputElement).value);
            if (props.popupEditor) selected.setAlpha(alpha.value);
            choose(selected.toRgbString());
          }} />
        {props.showAlpha && <input type='range' min='0' max='100' value={alpha.value * 100} aria-label='透明度' disabled={disabled.value}
          onInput={(event: Event) => { alpha.value = Number((event.target as HTMLInputElement).value) / 100; changeChannels(); }} />}
        <div class={[bem('presets'), pickerNs.e('presets')]}>
          {props.predefine.map((value) => <button type='button' key={value} aria-label={value}
            disabled={disabled.value} style={{ backgroundColor: value }} onClick={() => choose(value)} />)}
        </div>
        <Input ref={inputRef} modelValue={text.value} aria-label='颜色文本' disabled={disabled.value} validateEvent={false}
          {...{ onChangeCapture: (event: Event) => choose((event.target as HTMLInputElement).value) }} />
        {slots.footer?.()}
      </section>
    );
  }
});
