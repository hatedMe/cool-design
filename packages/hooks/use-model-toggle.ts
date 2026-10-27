import { getCurrentInstance, onMounted, watch, type Ref } from 'vue';

export interface ModelToggleOptions {
  modelValue?: Ref<boolean | null | undefined>;
  disabled?: Ref<boolean | undefined>;
  indicator: Ref<boolean>;
  onUpdate?: (value: boolean) => void;
  shouldProceed?: () => boolean;
}

export function useModelToggle(options: ModelToggleOptions) {
  const controlled = () => options.modelValue?.value !== null && options.modelValue?.value !== undefined;
  const canProceed = () => !options.disabled?.value && options.shouldProceed?.() !== false;
  const sync = (value: boolean) => {
    if (options.indicator.value !== value) options.indicator.value = value;
  };
  const show = () => {
    if (!canProceed()) return;
    options.onUpdate?.(true);
    if (!controlled()) sync(true);
  };
  const hide = () => {
    if (!canProceed()) return;
    options.onUpdate?.(false);
    if (!controlled()) sync(false);
  };
  const toggle = () => (options.indicator.value ? hide() : show());
  if (options.modelValue) {
    watch(options.modelValue, (value) => {
      if (typeof value === 'boolean') sync(value);
    });
    if (getCurrentInstance()) {
      onMounted(() => {
        if (typeof options.modelValue?.value === 'boolean') sync(options.modelValue.value);
      });
    }
  }
  return { show, hide, toggle };
}
