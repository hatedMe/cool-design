import { computed, defineComponent, provide, ref, type PropType } from 'vue';
import { configKey, overlayKey, useConfig, type Size } from './context';
import { idKey, namespaceKey, sizeKey } from '../../hooks/index.ts';
export default defineComponent({
  name: 'i-config-provider',
  props: {
    theme: String as PropType<'light' | 'dark'>,
    size: String as PropType<Size>,
    themeVars: Object as PropType<Record<string, string>>,
    namespace: String
  },
  setup(props, { slots }) {
    const parent = useConfig();
    const config = computed(() => ({
      theme: props.theme ?? parent.value.theme,
      size: props.size ?? parent.value.size,
      themeVars: { ...parent.value.themeVars, ...props.themeVars }
    }));
    const host = ref<HTMLElement>();
    provide(configKey, config);
    provide(
      namespaceKey,
      computed(() => props.namespace || 'i')
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
