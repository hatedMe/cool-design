import { provideServiceIds } from '../../packages/hooks/use-id';
import { computed, createVNode, defineComponent, h, provide, render, watchEffect, type AppContext, type VNode } from 'vue';
import { configKey, defaultConfig, getAppConfig, getThemeStyle } from '../../packages/cool-design/config-provider/context';
import { namespaceKey, useNamespace } from '../../packages/hooks/use-namespace';
import { sizeKey } from '../../packages/hooks/use-size';
import { nextOverlayZIndex } from '../../packages/hooks/use-z-index';

export function renderService(
  container: HTMLElement,
  context: AppContext | null,
  block: string,
  placement: string,
  zIndex: number | undefined,
  content: () => VNode
) {
  const Root = defineComponent({
    props: { revision: Number },
    setup() {
      provideServiceIds();
      const owner = computed(() => getAppConfig(context));
      const config = computed(() => owner.value ?? defaultConfig);
      const ns = useNamespace(block, computed(() => config.value.namespace));
      provide(configKey, config);
      provide(namespaceKey, ns.namespace);
      provide(sizeKey, computed(() => config.value.size));

      const layer = zIndex === undefined ? nextOverlayZIndex(0) : 0;
      watchEffect(() => {
        container.className = [ns.b('container'), ns.bm('container', placement)].join(' ');
        container.style.zIndex = String(zIndex ?? config.value.zIndex + layer);
      });
      return () => h('div', owner.value && {
        class: ns.namespace.value + '-theme-scope',
        'data-theme': owner.value.theme,
        style: getThemeStyle(owner.value, ns.cssVarName)
      }, content());
    }
  });
  let revision = 0;
  const draw = () => {
    const vnode = createVNode(Root, { revision: ++revision });
    vnode.appContext = context;
    render(vnode, container);
  };
  draw();
  return draw;
}
