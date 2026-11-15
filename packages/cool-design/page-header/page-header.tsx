import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'i-page-header',
  props: {
    icon: { type: String, default: '‹' },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    /** 兼容旧属性：返回按钮文字，未提供 title 时生效 */
    backText: { type: String, default: '' }
  },
  emits: ['back'],
  setup(props, { slots, emit }) {
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
      const iconContent = slots.icon?.() ?? (props.icon !== '' ? props.icon : null);
      const titleContent = slots.title?.() ?? backLabel.value;
      const contentContent = slots.content?.() ?? props.content;
      const extraContent = slots.extra?.();
      const breadcrumbContent = slots.breadcrumb?.();
      const defaultContent = slots.default?.();
      const hasContent = !!(contentContent && (Array.isArray(contentContent) ? contentContent.length > 0 : contentContent));

      return (
        <header class='i-page-header'>
          <div class='i-page-header__header'>
            <div class='i-page-header__left'>
              {showBack.value && (
                <button type='button' class='i-page-header__back' aria-label={backLabel.value} onClick={handleBack}>
                  <span class='i-page-header__icon'>{iconContent}</span>
                  <span class='i-page-header__title'>{titleContent}</span>
                </button>
              )}
              {hasContent && showBack.value && <span class='i-page-header__divider' aria-hidden='true' />}
              {hasContent && <div class='i-page-header__content'>{contentContent}</div>}
            </div>
            {extraContent && <div class='i-page-header__extra'>{extraContent}</div>}
          </div>
          {(breadcrumbContent || defaultContent) && (
            <div class='i-page-header__main'>
              {breadcrumbContent && <div class='i-page-header__breadcrumb'>{breadcrumbContent}</div>}
              {defaultContent && <div class='i-page-header__detail'>{defaultContent}</div>}
            </div>
          )}
        </header>
      );
    };
  }
});
