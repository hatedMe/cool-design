import { defineComponent, onBeforeUnmount, watch } from 'vue';
import { lockScroll, unlockScroll } from './scroll-lock';
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
    watch(
      () => props.loading && props.fullscreen && props.lock,
      (shouldLock, wasLocked) => {
        if (shouldLock && !wasLocked) lockScroll();
        if (!shouldLock && wasLocked) unlockScroll();
      },
      { immediate: true }
    );
    onBeforeUnmount(() => {
      if (props.loading && props.fullscreen && props.lock) unlockScroll();
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
            class='i-loading__svg'
            viewBox={props.svgViewBox || undefined}
            width={props.svgSize || undefined}
            height={props.svgSize || undefined}
            innerHTML={props.svg}
            aria-hidden='true'
          />
        );
      }
      if (props.spinner) return <Icon class='i-loading__icon' icon={props.spinner} aria-hidden='true' />;
      return <span class='i-loading__spinner' aria-hidden='true' />;
    };
    return () => (
      <div
        class={[
          'i-loading',
          { 'i-loading--overlay': props.overlay, 'i-loading--fullscreen': props.fullscreen },
          props.customClass
        ]}
        style={props.background && props.loading ? { '--i-loading-background': props.background } : undefined}
        aria-busy={props.loading}>
        {slots.default && (
          <div
            class='i-loading__content'
            inert={props.loading && props.overlay ? true : undefined}
            {...{ onClickCapture: block, onKeydownCapture: block }}>
            {slots.default()}
          </div>
        )}
        {props.loading && (
          <div class='i-loading__status' role='status' aria-live='polite'>
            {spinnerNode()}
            <span>{props.text}</span>
          </div>
        )}
      </div>
    );
  }
});
