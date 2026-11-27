import { cloneVNode, computed, defineComponent, inject, onBeforeUnmount, watch, type ComponentPublicInstance, type PropType } from 'vue';
import { popperKey, type PopperReference } from './context';

const events = ['mouseenter', 'mouseleave', 'click', 'keydown', 'focus', 'blur', 'contextmenu'] as const;
const eventNames = { mouseenter: 'onMouseenter', mouseleave: 'onMouseleave', click: 'onClick', keydown: 'onKeydown', focus: 'onFocus', blur: 'onBlur', contextmenu: 'onContextmenu' } as const;
const eventProps = {
  onMouseenter: Function as PropType<(event: MouseEvent) => void>,
  onMouseleave: Function as PropType<(event: MouseEvent) => void>,
  onClick: Function as PropType<(event: MouseEvent) => void>,
  onKeydown: Function as PropType<(event: KeyboardEvent) => void>,
  onFocus: Function as PropType<(event: FocusEvent) => void>,
  onBlur: Function as PropType<(event: FocusEvent) => void>,
  onContextmenu: Function as PropType<(event: MouseEvent) => void>
};

export default defineComponent({
  name: 'i-popper-trigger',
  inheritAttrs: false,
  props: { ...eventProps, virtualRef: Object as PropType<PopperReference>, virtualTriggering: Boolean, id: String, open: Boolean },
  setup(props, { slots, attrs, expose }) {
    const context = inject(popperKey)!;
    const aria = computed(() => context.role.value === 'tooltip'
      ? { 'aria-describedby': props.open ? props.id : undefined }
      : { 'aria-haspopup': context.role.value, 'aria-expanded': String(props.open), 'aria-controls': props.id });
    watch([() => props.virtualRef, () => props.virtualTriggering], ([value, virtual]) => {
      context.triggerRef.value = virtual ? value : undefined;
    }, { immediate: true });
    watch([context.triggerRef, aria, () => ({ ...props })], ([element], _, cleanup) => {
      if (typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement)) return;
      const previous = new Map<string, string | null>();
      Object.entries(aria.value).forEach(([key, value]) => {
        previous.set(key, element.getAttribute(key));
        if (value !== undefined) element.setAttribute(key, key === 'aria-describedby' && previous.get(key) ? `${previous.get(key)} ${value}` : value);
        else element.removeAttribute(key);
      });
      const listeners = events.flatMap(event => {
        const handler = props[eventNames[event]];
        if (typeof handler !== 'function') return [];
        const callback = handler as EventListener;
        const capture = event === 'focus' || event === 'blur';
        element.addEventListener(event, callback, capture);
        return [() => element.removeEventListener(event, callback, capture)];
      });
      cleanup(() => {
        listeners.forEach(remove => remove());
        previous.forEach((value, key) => value === null ? element.removeAttribute(key) : element.setAttribute(key, value));
      });
    }, { immediate: true, flush: 'post' });
    onBeforeUnmount(() => { context.triggerRef.value = undefined; });
    expose({ triggerRef: context.triggerRef });
    return () => {
      if (props.virtualTriggering) return null;
      const child = slots.default?.().find(node => typeof node.type !== 'symbol');
      if (!child) return null;
      return cloneVNode(child, {
        ...attrs,
        onVnodeMounted: (node) => { context.triggerRef.value = (node.component?.proxy as ComponentPublicInstance | undefined)?.$el ?? node.el; },
        onVnodeUpdated: (node) => { context.triggerRef.value = (node.component?.proxy as ComponentPublicInstance | undefined)?.$el ?? node.el; }
      }, true);
    };
  }
});
