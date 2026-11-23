import { computed, createVNode, defineComponent, getCurrentInstance, getCurrentScope, inject, provide, render, type AppContext } from 'vue';
import { configKey, defaultConfig, getAppConfig, getThemeStyle } from '../config-provider/context';
import { namespaceKey, useNamespace } from '../../hooks/use-namespace';
import { sizeKey } from '../../hooks/use-size';
import LoadingComponent from './loading';
import { lockScroll, retainPosition, unlockScroll } from './scroll-lock';

export interface LoadingServiceOptions {
  target?: HTMLElement | string;
  body?: boolean;
  fullscreen?: boolean;
  lock?: boolean;
  text?: string;
  background?: string;
  customClass?: string;
  spinner?: string;
  svg?: string;
  svgViewBox?: string;
  svgSize?: number;
}

export interface LoadingInstance {
  close(): void;
  setText(text: string): void;
}

const fullscreenInstances = new Map<AppContext | null, LoadingInstance>();

function resolveTarget(target?: HTMLElement | string): HTMLElement {
  if (typeof target === 'string') return (document.querySelector(target) as HTMLElement) ?? document.body;
  if (target instanceof HTMLElement) return target;
  return document.body;
}

export function service(
  options: LoadingServiceOptions = {},
  appContext?: AppContext | null
): LoadingInstance {
  const fullscreen = options.fullscreen ?? true;
  const caller = getCurrentInstance();
  const context = appContext === undefined ? caller?.appContext ?? null : appContext;
  const localConfig = caller && caller.appContext === context ? inject(configKey, undefined) : undefined;
  const callerScope = localConfig && getCurrentScope();
  const existing = fullscreen && fullscreenInstances.get(context);
  if (existing) return existing;
  const target = resolveTarget(options.target);
  const useBody = fullscreen || options.body || target === document.body;
  const parent = useBody ? document.body : target;
  const releasePosition = useBody ? undefined : retainPosition(target);
  const locked = options.lock;
  if (locked) lockScroll();
  const container = document.createElement('div');
  if (!useBody) {
    container.style.position = 'absolute';
    container.style.inset = '0';
    container.style.zIndex = '1000';
  } else if (!fullscreen && options.body && target !== document.body) {
    const rect = target.getBoundingClientRect();
    container.style.position = 'fixed';
    container.style.top = `${rect.top}px`;
    container.style.left = `${rect.left}px`;
    container.style.width = `${rect.width}px`;
    container.style.height = `${rect.height}px`;
    container.style.zIndex = '1000';
  }
  parent.appendChild(container);
  let currentText = options.text ?? '正在加载…';
  const Root = defineComponent({
    props: { text: String },
    setup(props) {
      const owner = computed(() => {
        const root = getAppConfig(context);
        return callerScope?.active && localConfig ? localConfig.value : root;
      });
      const config = computed(() => owner.value ?? defaultConfig);
      const ns = useNamespace('loading', computed(() => config.value.namespace));
      provide(configKey, config);
      provide(namespaceKey, ns.namespace);
      provide(sizeKey, computed(() => config.value.size));
      return () => {
        container.className = ns.b('service');
        return createVNode(LoadingComponent, {
          class: owner.value && ns.namespace.value + '-theme-scope',
          'data-theme': owner.value?.theme,
          style: owner.value && {
            ...getThemeStyle(owner.value, ns.cssVarName),
            ...(options.background && ns.cssVarBlock({ background: options.background }))
          },
          loading: true,
          text: props.text,
          background: options.background ?? '',
          fullscreen,
          overlay: !fullscreen,
          customClass: options.customClass ?? '',
          spinner: options.spinner ?? '',
          svg: options.svg ?? '',
          svgViewBox: options.svgViewBox ?? '',
          svgSize: options.svgSize ?? 0
        });
      };
    }
  });
  const draw = () => {
    const vnode = createVNode(Root, { text: currentText });
    vnode.appContext = context;
    render(vnode, container);
  };
  draw();
  let closed = false;
  const instance: LoadingInstance = {
    close() {
      if (closed) return;
      closed = true;
      render(null, container);
      container.remove();
      releasePosition?.();
      if (locked) unlockScroll();
      if (fullscreen) fullscreenInstances.delete(context);
    },
    setText(text: string) {
      currentText = text;
      if (closed) return;
      draw();
    }
  };
  if (fullscreen) fullscreenInstances.set(context, instance);
  return instance;
}
