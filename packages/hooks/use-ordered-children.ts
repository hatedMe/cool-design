import { computed, getCurrentInstance, inject, provide, ref, type InjectionKey, type Ref } from 'vue';
export interface OrderedChild { uid: number; vnode: object; index: number }
interface OrderedContext { register: (child: OrderedChild) => void; unregister: (uid: number) => void; children: Ref<OrderedChild[]> }
export const orderedChildrenKey: InjectionKey<OrderedContext> = Symbol('ordered-children');
let uid = 0;
export function useOrderedChildren() {
  const parent = getCurrentInstance() ? inject(orderedChildrenKey, undefined) : undefined;
  const children = parent?.children || ref<OrderedChild[]>([]);
  const own = !parent;
  const context = parent || { children, register: (child: OrderedChild) => children.value.push(child), unregister: (id: number) => { children.value = children.value.filter((child) => child.uid !== id); } };
  if (own && getCurrentInstance()) provide(orderedChildrenKey, context);
  const register = (vnode: object) => {
    const child = { uid: ++uid, vnode, index: children.value.length };
    context.register(child);
    return child;
  };
  const unregister = (child: OrderedChild) => context.unregister(child.uid);
  return { children: computed(() => children.value), register, unregister };
}
