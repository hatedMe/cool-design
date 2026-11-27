import { Transition, defineComponent, h, mergeProps, onBeforeUnmount, type TransitionProps } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';

export default defineComponent({
  name: 'i-collapse-transition',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ns = useNamespace('collapse-transition');
    const saved = new Map<HTMLElement, { paddingTop: string; paddingBottom: string; overflow: string; maxHeight: string }>();
    const frames = new Map<HTMLElement, number>();
    const cancel = (element: HTMLElement) => {
      const frame = frames.get(element);
      if (frame !== undefined) { cancelAnimationFrame(frame); frames.delete(element); }
    };
    const remember = (element: HTMLElement) => {
      cancel(element);
      if (!saved.has(element)) {
        const { paddingTop, paddingBottom, overflow, maxHeight } = element.style;
        saved.set(element, { paddingTop, paddingBottom, overflow, maxHeight });
      }
    };
    const restore = (node: Element) => {
      const element = node as HTMLElement;
      cancel(element);
      const style = saved.get(element);
      if (style) Object.assign(element.style, style);
      saved.delete(element);
    };
    const hooks: TransitionProps = {
      onBeforeEnter(node) {
        const element = node as HTMLElement;
        remember(element);
        Object.assign(element.style, { maxHeight: '0px', paddingTop: '0px', paddingBottom: '0px' });
      },
      onEnter(node) {
        const element = node as HTMLElement;
        frames.set(element, requestAnimationFrame(() => {
          frames.delete(element);
          const style = saved.get(element);
          if (style) Object.assign(element.style, { paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, maxHeight: element.style.height || `${element.scrollHeight}px`, overflow: 'hidden' });
        }));
      },
      onAfterEnter: restore,
      onEnterCancelled: restore,
      onBeforeLeave(node) {
        const element = node as HTMLElement;
        remember(element);
        Object.assign(element.style, { maxHeight: `${element.scrollHeight}px`, overflow: 'hidden' });
      },
      onLeave(node) { Object.assign((node as HTMLElement).style, { maxHeight: '0px', paddingTop: '0px', paddingBottom: '0px' }); },
      onAfterLeave: restore,
      onLeaveCancelled: restore
    };
    onBeforeUnmount(() => [...saved.keys()].forEach(restore));
    return () => h(Transition, mergeProps({ name: ns.b(), ...hooks }, attrs), slots);
  }
});
