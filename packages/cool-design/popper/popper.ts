import { computed, defineComponent, provide, shallowRef } from 'vue';
import type { Instance } from '@popperjs/core';
import { popperKey, type PopperReference } from './context';

export default defineComponent({
  name: 'i-popper',
  inheritAttrs: false,
  props: { role: { type: String, default: 'tooltip' } },
  setup(props, { slots, expose }) {
    const context = {
      triggerRef: shallowRef<PopperReference>(),
      contentRef: shallowRef<HTMLElement>(),
      referenceRef: shallowRef<PopperReference>(),
      popperInstanceRef: shallowRef<Instance>(),
      role: computed(() => props.role)
    };
    provide(popperKey, context);
    expose(context);
    return () => slots.default?.();
  }
});
