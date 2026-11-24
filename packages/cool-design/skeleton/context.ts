import type { ComputedRef, InjectionKey } from 'vue';

type SkeletonContext = {
  namespace: string;
  animated: boolean;
};

export const skeletonKey: InjectionKey<ComputedRef<SkeletonContext | undefined>> = Symbol('skeleton');
