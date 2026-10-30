import { getCurrentScope, onScopeDispose } from 'vue';
export function useTimeout() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const start = (callback: () => void, delay: number) => { if (timer) clearTimeout(timer); timer = setTimeout(callback, delay); };
  const stop = () => { if (timer) clearTimeout(timer); timer = undefined; };
  if (getCurrentScope()) onScopeDispose(stop);
  return { start, stop };
}
