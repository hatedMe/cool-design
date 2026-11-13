import { getCurrentScope, onScopeDispose, watch, type Ref } from 'vue';
let lockCount = 0;
let previousOverflow = '';
export function useLockscreen(trigger: Ref<boolean>) {
  const apply = (locked: boolean) => {
    if (typeof document === 'undefined') return;
    if (locked) {
      if (lockCount++ === 0) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    } else if (lockCount > 0 && --lockCount === 0) document.body.style.overflow = previousOverflow;
  };
  const stop = watch(trigger, apply, { immediate: true, flush: 'sync' });
  if (getCurrentScope()) onScopeDispose(() => { stop(); apply(false); });
}
