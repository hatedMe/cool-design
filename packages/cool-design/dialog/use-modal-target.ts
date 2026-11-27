import { computed, getCurrentInstance, inject, onMounted, ref } from 'vue';
import { overlayKey } from '../config-provider/context';

export function useModalTarget(props: { appendTo?: string | HTMLElement; appendToBody: boolean }) {
  const host = inject(overlayKey, undefined);
  const hydrating = getCurrentInstance()?.vnode.el != null;
  const mounted = ref(false);
  onMounted(() => { mounted.value = true; });

  const target = computed(() => {
    const value = props.appendTo;
    if (typeof document === 'undefined') {
      if (typeof value === 'string' && value && value !== 'body') return value;
      return props.appendToBody && (!value || value === 'body') ? 'body' : undefined;
    }
    if (value && typeof value === 'string' && value !== 'body') {
      try {
        return document.querySelector(value) ?? undefined;
      } catch {
        return undefined;
      }
    }
    if (props.appendToBody && (!value || value === 'body')) return document.body;
    // 客户端首帧沿用服务端没有元素引用时的宿主。
    if (hydrating && !mounted.value) return props.appendToBody ? document.body : undefined;
    if (value && typeof value !== 'string') return value;
    return value === undefined ? host?.value : undefined;
  });
  const initiallyInline = !target.value;
  let previousTarget: Element | string = 'body';
  const teleportProps = () => {
    const current = target.value;
    // 只记录渲染交给 Teleport 的目标，避免同次 props 更新的中间值。
    if (current) previousTarget = current;
    return { to: previousTarget, disabled: !current };
  };

  return { target, teleportProps, initiallyInline };
}
