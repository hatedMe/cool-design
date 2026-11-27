import { computed } from 'vue';
import type { MaybeRef } from './maybe-ref';
export function useTeleport(to?: MaybeRef<string | HTMLElement | undefined>) {
  return computed(() => to || 'body');
}
