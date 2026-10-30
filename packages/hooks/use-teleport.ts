import { computed, type MaybeRef } from 'vue';
export function useTeleport(to?: MaybeRef<string | HTMLElement | undefined>) {
  return computed(() => to || 'body');
}
