import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type PropType
} from 'vue';
import { anchorKey } from './context';

export type AnchorType = 'default' | 'underline';
export type AnchorDirection = 'vertical' | 'horizontal';
export type AnchorContainer = string | HTMLElement | Window;

export default defineComponent({
  name: 'i-anchor',
  props: {
    container: [String, Object] as PropType<AnchorContainer>,
    offset: { type: Number, default: 0 },
    bound: { type: Number, default: 15 },
    duration: { type: Number, default: 300 },
    marker: { type: Boolean, default: true },
    type: { type: String as PropType<AnchorType>, default: 'default' },
    direction: { type: String as PropType<AnchorDirection>, default: 'vertical' },
    selectScrollTop: Boolean
  },
  emits: ['change', 'click'],
  setup(props, { slots, emit, expose }) {
    const links: string[] = [];
    const activeHref = ref('');

    const resolveContainer = (): HTMLElement | Window | undefined => {
      const value = props.container;
      if (!value || value === window) return window;
      if (typeof value === 'string') return document.querySelector<HTMLElement>(value) ?? window;
      return value;
    };
    const containerScrollTop = (container: HTMLElement | Window | undefined) => {
      if (container && container !== window) return (container as HTMLElement).scrollTop;
      return window.scrollY || document.documentElement.scrollTop || 0;
    };
    const targetOf = (href: string) =>
      href.startsWith('#') ? document.getElementById(href.slice(1)) : document.querySelector<HTMLElement>(href);
    const targetAbsTop = (href: string, container: HTMLElement | Window | undefined) => {
      const target = targetOf(href);
      if (!target) return Number.POSITIVE_INFINITY;
      const rect = target.getBoundingClientRect();
      if (container && container !== window) {
        const containerRect = (container as HTMLElement).getBoundingClientRect();
        return rect.top - containerRect.top + (container as HTMLElement).scrollTop;
      }
      return rect.top + (window.scrollY || document.documentElement.scrollTop || 0);
    };

    const updateActive = () => {
      const container = resolveContainer();
      const line = containerScrollTop(container) + props.offset + props.bound;
      let current = '';
      links.forEach((href) => {
        if (targetAbsTop(href, container) <= line) current = href;
      });
      if (!current && props.selectScrollTop && links.length) current = links[0];
      if (current && current !== activeHref.value) {
        activeHref.value = current;
        emit('change', current);
      } else if (!current && activeHref.value && !props.selectScrollTop) {
        activeHref.value = '';
        emit('change', '');
      }
    };

    const scrollTo = (href: string) => {
      const container = resolveContainer();
      const destination = Math.max(0, targetAbsTop(href, container) - props.offset);
      const from = containerScrollTop(container);
      const move = (value: number) => {
        if (container && container !== window) (container as HTMLElement).scrollTop = value;
        else if (typeof window.scrollTo === 'function') window.scrollTo({ top: value });
      };
      if (props.duration <= 0 || from === destination) {
        move(destination);
        return;
      }
      const startTime = Date.now();
      const step = () => {
        const progress = Math.min(1, (Date.now() - startTime) / props.duration);
        const eased = 1 - (1 - progress) ** 3;
        move(from + (destination - from) * eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const handleClick = (event: MouseEvent, href: string) => {
      emit('click', event, href);
      const prevented = event.defaultPrevented;
      event.preventDefault();
      scrollTo(href);
      if (!prevented && href.startsWith('#')) {
        window.location.hash = href;
      }
    };

    const register = (href: string) => {
      if (!links.includes(href)) links.push(href);
      nextTickUpdate();
    };
    const unregister = (href: string) => {
      const index = links.indexOf(href);
      if (index >= 0) links.splice(index, 1);
    };
    const nextTickUpdate = () => {
      void Promise.resolve().then(() => updateActive());
    };

    provide(anchorKey, {
      activeHref: () => activeHref.value,
      register,
      unregister,
      handleClick
    });

    const onScroll = () => updateActive();
    onMounted(() => {
      const container = resolveContainer();
      container?.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      updateActive();
    });
    onBeforeUnmount(() => {
      const container = resolveContainer();
      container?.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });
    watch(() => props.container, () => {
      const container = resolveContainer();
      container?.addEventListener('scroll', onScroll, { passive: true });
      updateActive();
    });

    expose({ scrollTo });

    return () => (
      <div
        class={[
          'i-anchor',
          `i-anchor--${props.direction}`,
          `i-anchor--${props.type}`,
          props.marker && 'has-marker'
        ]}>
        <div class='i-anchor__list'>{slots.default?.()}</div>
      </div>
    );
  }
});
