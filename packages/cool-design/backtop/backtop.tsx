import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';

export default defineComponent({
  name: 'i-backtop',
  props: {
    target: { type: String, default: undefined },
    visibilityHeight: { type: Number, default: 200 },
    right: { type: Number, default: 40 },
    bottom: { type: Number, default: 40 }
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    const ns = useNamespace('backtop');
    const visible = ref(false);
    let container: HTMLElement | Window | null = null;
    let onScroll: (() => void) | null = null;

    const isWindowLike = (el: HTMLElement | Window | null) => {
      if (!el || el === window) return true;
      if (el instanceof HTMLElement) {
        return el === document.body || el === document.documentElement;
      }
      return false;
    };
    const getScrollTop = () => {
      if (isWindowLike(container)) {
        return window.scrollY ?? document.documentElement.scrollTop ?? document.body.scrollTop ?? 0;
      }
      return (container as HTMLElement).scrollTop;
    };
    const unbind = () => {
      if (container && onScroll) {
        container.removeEventListener('scroll', onScroll as EventListener);
      }
      container = null;
      onScroll = null;
    };
    const bind = () => {
      unbind();
      let next: HTMLElement | Window = window;
      if (props.target) {
        try {
          const el = document.querySelector(props.target) as HTMLElement | null;
          if (el) next = el;
        } catch {
          // 选择器非法时回退到 window，避免抛出异常。
        }
      }
      container = next;
      onScroll = () => {
        try {
          visible.value = getScrollTop() >= props.visibilityHeight;
        } catch {
          visible.value = false;
        }
      };
      container.addEventListener('scroll', onScroll as EventListener, { passive: true });
      onScroll();
    };

    onMounted(bind);
    watch(() => [props.target, props.visibilityHeight], bind);
    onBeforeUnmount(unbind);

    const scrollToTop = () => {
      try {
        if (isWindowLike(container)) {
          if (typeof window.scrollTo === 'function') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }
        } else if (container instanceof HTMLElement) {
          if (typeof container.scrollTo === 'function') {
            container.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            container.scrollTop = 0;
          }
        }
      } catch {
        try {
          if (container instanceof HTMLElement) container.scrollTop = 0;
          else {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }
        } catch {
          // 忽略测试环境不支持滚动的异常。
        }
      }
    };

    return () =>
      visible.value ? (
        <button
          type='button'
          class={ns.b()}
          style={{ right: `${props.right}px`, bottom: `${props.bottom}px` }}
          aria-label='回到顶部'
          onClick={(event: MouseEvent) => {
            scrollToTop();
            emit('click', event);
          }}>
          {slots.default?.() ?? <span class={ns.e('icon')} aria-hidden='true'>↑</span>}
        </button>
      ) : null;
  }
});
