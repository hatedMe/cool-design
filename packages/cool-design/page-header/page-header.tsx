import { computed, defineComponent, type Component, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import Icon from '../icon';

export default defineComponent({
  name: 'i-page-header',
  props: {
    icon: { type: [String, Object] as PropType<string | Component>, default: undefined },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    /** 兼容旧属性：返回按钮文字，未提供 title 时生效 */
    backText: { type: String, default: '' }
  },
  emits: ['back'],
  setup(props, { slots, emit }) {
    const ns = useNamespace('page-header');
    const showBack = computed(() => {
      // icon="" 且无 icon 插槽时隐藏返回按钮
      if (props.icon === '' && !slots.icon) return false;
      return true;
    });

    const backLabel = computed(() => props.title || props.backText || '返回');

    const handleBack = (event: MouseEvent) => {
      emit('back', event);
    };

    return () => {
      // 字符串按图标类名经 Icon 渲染；未配置时回退默认箭头文本。
      const iconContent =
        slots.icon?.() ?? (props.icon === '' ? null : props.icon ? <Icon icon={props.icon} aria-hidden='true' /> : '‹');
      const titleContent = slots.title?.() ?? backLabel.value;
      const contentContent = slots.content?.() ?? props.content;
      const extraContent = slots.extra?.();
      const breadcrumbContent = slots.breadcrumb?.();
      const defaultContent = slots.default?.();
      const hasContent = !!(contentContent && (Array.isArray(contentContent) ? contentContent.length > 0 : contentContent));

      return (
        <header class={ns.b()}>
          <div class={ns.e('header')}>
            <div class={ns.e('left')}>
              {showBack.value && (
                <button type='button' class={ns.e('back')} aria-label={backLabel.value} onClick={handleBack}>
                  <span class={ns.e('icon')}>{iconContent}</span>
                  <span class={ns.e('title')}>{titleContent}</span>
                </button>
              )}
              {hasContent && showBack.value && <span class={ns.e('divider')} aria-hidden='true' />}
              {hasContent && <div class={ns.e('content')}>{contentContent}</div>}
            </div>
            {extraContent && <div class={ns.e('extra')}>{extraContent}</div>}
          </div>
          {(breadcrumbContent || defaultContent) && (
            <div class={ns.e('main')}>
              {breadcrumbContent && <div class={ns.e('breadcrumb')}>{breadcrumbContent}</div>}
              {defaultContent && <div class={ns.e('detail')}>{defaultContent}</div>}
            </div>
          )}
        </header>
      );
    };
  }
});
