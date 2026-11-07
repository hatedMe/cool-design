import { onScopeDispose, watch, type Ref } from 'vue';

export function useEscapeKeydown(enabled: Ref<boolean>, handler: (event: KeyboardEvent) => void) {
  const listener = (event: KeyboardEvent) => {
    if (enabled.value && event.key === 'Escape') handler(event);
  };
  if (typeof document !== 'undefined') {
    watch(enabled, (active) => active ? document.addEventListener('keydown', listener, true) : document.removeEventListener('keydown', listener, true), { immediate: true });
    onScopeDispose(() => document.removeEventListener('keydown', listener, true));
  }
  return { listener };
}
