import { computed, defineComponent, provide, ref, type PropType } from 'vue';
import { configKey, overlayKey, useConfig, type Language, type Size, type ValueOnClear } from './context';
import { idKey, namespaceKey, sizeKey, useNamespace } from '../../hooks/index.ts';
export default defineComponent({
  name: 'i-config-provider',
  props: {
    theme: String as PropType<'light' | 'dark'>,
    size: String as PropType<Size>,
    themeVars: Object as PropType<Record<string, string>>,
    namespace: String,
    zIndex: Number,
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function] as PropType<ValueOnClear>, default: undefined },
    locale: Object as PropType<Language>
  },
  setup(props, { slots }) {
    const parent = useConfig();
    const { namespace } = useNamespace('config-provider');
    const config = computed(() => ({
      theme: props.theme ?? parent.value.theme,
      size: props.size ?? parent.value.size,
      themeVars: { ...parent.value.themeVars, ...props.themeVars },
      zIndex: props.zIndex ?? parent.value.zIndex,
      emptyValues: props.emptyValues ?? parent.value.emptyValues,
      valueOnClear: props.valueOnClear !== undefined ? props.valueOnClear : parent.value.valueOnClear,
      locale: props.locale ?? parent.value.locale
    }));
    const host = ref<HTMLElement>();
    provide(configKey, config);
    provide(
      namespaceKey,
      computed(() => props.namespace || namespace.value)
    );
    provide(
      sizeKey,
      computed(() => config.value.size)
    );
    provide(idKey, { prefix: Math.floor(Math.random() * 10000), current: 0 });
    provide(overlayKey, host);
    return () => (
      <div
        class='i-config-provider'
        data-theme={config.value.theme}
        style={{
          '--i-control-height': { small: '28px', default: '32px', large: '40px' }[config.value.size],
          ...config.value.themeVars
        }}>
        {slots.default?.()}
        <div ref={host} class='i-overlay-host' />
      </div>
    );
  }
});
