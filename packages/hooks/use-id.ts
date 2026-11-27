import { getCurrentInstance, inject, provide, readonly, toRef, type InjectionKey, type Ref, unref } from 'vue';
import { defaultNamespace, namespaceKey } from './use-namespace';

export interface IdInjection {
  prefix: number;
  current: number;
}

export const idKey: InjectionKey<IdInjection> = Symbol('id');

const serviceRoot = Symbol('service-root');
let nextServiceRoot = 0;

export function provideServiceIds() {
  const state = { prefix: useIdState().prefix, current: 0, [serviceRoot]: ++nextServiceRoot };
  provide(idKey, state);
}

const defaultStates = new WeakMap<object, IdInjection>();

export function useIdState(): IdInjection {
  const instance = getCurrentInstance();
  if (!instance) return { prefix: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER), current: 0 };

  const inherited = inject(idKey, undefined);
  if (inherited) return inherited;

  const owner = instance.appContext.app ?? instance.root;
  let state = defaultStates.get(owner);
  if (!state) {
    state = { prefix: 0, current: 0 };
    defaultStates.set(owner, state);
  }
  return state;
}

export function useId(deterministicId?: string | Ref<string>): Ref<string> {
  const state = useIdState();
  const namespace = getCurrentInstance() ? inject(namespaceKey, undefined) : undefined;
  const root = serviceRoot in state ? `service-${state[serviceRoot]}-` : '';
  const suffix = `${root}${state.prefix}-${state.current++}`;
  // Vue 3.2 SSR 可在渲染时复用 computed 的 setup 缓存，显式 ID 和命名空间都需要读取当前值。
  return readonly(toRef({
    get id() {
      return unref(deterministicId) || `${namespace?.value || defaultNamespace}-id-${suffix}`;
    }
  }, 'id'));
}
