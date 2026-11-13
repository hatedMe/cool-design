import { computed, defineComponent, h, type Component, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import Icon from '../icon';

const [name, bem] = createNamespace('result');

export type ResultStatus = 'success' | 'warning' | 'info' | 'error' | '404' | '403' | '500';
export type ResultIcon = string | Component;

const ICON_PATHS: Record<'success' | 'warning' | 'info' | 'error', string> = {
  success: 'M20 6 9 17l-5-5',
  warning: 'M12 8v5m0 4h.01',
  info: 'M12 11v6m0-10h.01',
  error: 'M9 9l6 6m0-6-6 6'
};

export default defineComponent({
  name,
  props: {
    title: { type: String, default: '' },
    subTitle: { type: String, default: '' },
    status: { type: String as PropType<ResultStatus>, default: 'info' },
    /** 自定义图标：图标类名或组件，优先级低于 icon 插槽 */
    icon: [String, Object, Function] as PropType<ResultIcon>
  },
  setup(props, { slots }) {
    const isHttpStatus = computed(() => props.status === '404' || props.status === '403' || props.status === '500');

    const renderDefaultIcon = () => {
      if (isHttpStatus.value) {
        return (
          <span class={bem('code')} aria-hidden='true'>
            {props.status}
          </span>
        );
      }
      const path = ICON_PATHS[props.status as 'success' | 'warning' | 'info' | 'error'] ?? ICON_PATHS.info;
      const circle = props.status === 'warning' ? 'M12 3 2.5 20h19L12 3Z' : undefined;
      return (
        <svg class={bem('svg')} width='64' height='64' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          {circle ? (
            <path d={circle} stroke='currentColor' stroke-width='1.8' stroke-linejoin='round' />
          ) : (
            <circle cx='12' cy='12' r='9' stroke='currentColor' stroke-width='1.8' />
          )}
          <path d={path} stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' />
        </svg>
      );
    };

    const renderCustomIcon = () => {
      if (!props.icon) return undefined;
      if (typeof props.icon !== 'string') return h(props.icon as Component);
      return <Icon icon={props.icon} size={64} />;
    };

    return () => (
      <section class={[name, `${name}--${props.status}`]} role='status'>
        <div class={bem('icon')}>{slots.icon?.() ?? renderCustomIcon() ?? renderDefaultIcon()}</div>
        {(props.title || slots.title) && (
          <h2 class={bem('title')}>{slots.title?.() ?? props.title}</h2>
        )}
        {(props.subTitle || slots['sub-title'] || slots.subTitle) && (
          <p class={bem('sub-title')}>{slots['sub-title']?.() ?? slots.subTitle?.() ?? props.subTitle}</p>
        )}
        {slots.extra && <div class={bem('extra')}>{slots.extra()}</div>}
      </section>
    );
  }
});
