import { computed, defineComponent, getCurrentInstance, inject, onBeforeUnmount, provide, ref, type PropType } from 'vue';
import { configKey, getThemeStyle, overlayKey, registerAppConfig, useConfig, type Config, type Language, type Size, type ValueOnClear } from './context';
import { idKey, namespaceKey, sizeKey, useNamespace } from '../../hooks/index.ts';
function mergeConfig<T extends object>(parent: T | undefined, local: T | undefined): T | undefined {
  if (!local) return parent;
  const defined = Object.fromEntries(Object.entries(local).filter(([, value]) => value !== undefined));
  return { ...parent, ...defined } as T;
}

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
    locale: Object as PropType<Language>,
    button: Object as PropType<Config['button']>,
    link: Object as PropType<Config['link']>,
    dialog: Object as PropType<Config['dialog']>,
    message: Object as PropType<Config['message']>,
    table: Object as PropType<Config['table']>
  },
  setup(props, { slots }) {
    const parent = useConfig();
    const { namespace: inheritedNamespace } = useNamespace('config-provider');
    const namespace = computed(() => props.namespace || inheritedNamespace.value);
    const ns = useNamespace('config-provider', namespace);
    const overlay = useNamespace('overlay-host', namespace);
    const config = computed(() => ({
      namespace: namespace.value,
      theme: props.theme ?? parent.value.theme,
      size: props.size ?? parent.value.size,
      themeVars: { ...parent.value.themeVars, ...props.themeVars },
      zIndex: props.zIndex ?? parent.value.zIndex,
      emptyValues: props.emptyValues ?? parent.value.emptyValues,
      valueOnClear: props.valueOnClear !== undefined ? props.valueOnClear : parent.value.valueOnClear,
      locale: props.locale ?? parent.value.locale,
      button: mergeConfig(parent.value.button, props.button),
      link: mergeConfig(parent.value.link, props.link),
      dialog: mergeConfig(parent.value.dialog, props.dialog),
      message: mergeConfig(parent.value.message, props.message),
      table: mergeConfig(parent.value.table, props.table)
    }));
    const host = ref<HTMLElement>();
    const instance = getCurrentInstance();
    if (instance && !inject(configKey, undefined)) onBeforeUnmount(registerAppConfig(instance.appContext, config));
    provide(configKey, config);
    provide(namespaceKey, namespace);
    provide(
      sizeKey,
      computed(() => config.value.size)
    );
    provide(idKey, { prefix: Math.floor(Math.random() * 10000), current: 0 });
    provide(overlayKey, host);
    return () => (
      <div
        class={ns.b()}
        data-theme={config.value.theme}
        style={getThemeStyle(config.value, ns.cssVarName)}>
        {slots.default?.()}
        <div ref={host} class={overlay.b()} />
      </div>
    );
  }
});
