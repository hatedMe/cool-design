import { defineComponent, onBeforeUnmount, watch } from 'vue';
import { lockScroll, unlockScroll } from './scroll-lock';
import { useNamespace } from '../../hooks/use-namespace';
import Icon from '../icon';
export default defineComponent({
  name: 'i-loading',
  props: {
    loading: { type: Boolean, default: true },
    text: { type: String, default: '正在加载…' },
    overlay: Boolean,
    fullscreen: Boolean,
    background: { type: String, default: '' },
    lock: Boolean,
    customClass: { type: String, default: '' },
    spinner: { type: String, default: '' },
    svg: { type: String, default: '' },
    svgViewBox: { type: String, default: '' },
    svgSize: { type: Number, default: 0 }
  },
  setup(props, { slots }) {
    const ns = useNamespace('loading');
    let locked = false;
    watch(
      () => props.loading && props.fullscreen && props.lock,
      (shouldLock) => {
        if (typeof document === 'undefined') return;
        if (shouldLock) lockScroll();
        else if (locked) unlockScroll();
        locked = shouldLock;
      },
      { immediate: true }
    );
    onBeforeUnmount(() => {
      if (locked) unlockScroll();
    });
    const block = (event: Event) => {
      if (props.loading && props.overlay) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const spinnerNode = () => {
      if (props.svg) {
        return (
          <svg
            class={ns.e('svg')}
            viewBox={props.svgViewBox || undefined}
            width={props.svgSize || undefined}
            height={props.svgSize || undefined}
            innerHTML={props.svg}
            aria-hidden='true'
          />
        );
      }
      if (props.spinner) return <Icon class={ns.e('icon')} icon={props.spinner} aria-hidden='true' />;
      return <span class={ns.e('spinner')} aria-hidden='true' />;
    };
    return () => (
      <div
        class={[
          ns.b(),
          { [ns.m('overlay')]: props.overlay, [ns.m('fullscreen')]: props.fullscreen },
          props.customClass
        ]}
        style={props.background && props.loading ? { [ns.cssVarName('loading-background')]: props.background } : undefined}
        aria-busy={props.loading}>
        {slots.default && (
          <div
            class={ns.e('content')}
            inert={props.loading && props.overlay ? true : undefined}
            {...{ onClickCapture: block, onKeydownCapture: block }}>
            {slots.default()}
          </div>
        )}
        {props.loading && (
          <div class={ns.e('status')} role='status' aria-live='polite'>
            {spinnerNode()}
            <span>{props.text}</span>
          </div>
        )}
      </div>
    );
  }
});
