import { defineComponent, ref, type PropType } from 'vue';
export type AlertType = 'primary' | 'success' | 'warning' | 'info' | 'error';
export type AlertEffect = 'light' | 'dark';
const icons: Record<AlertType, string> = { primary: 'ⓘ', success: '✓', warning: '⚠', info: 'ⓘ', error: '✕' };
export default defineComponent({
  name: 'i-alert',
  props: {
    title: String,
    description: String,
    type: { type: String as PropType<AlertType>, default: 'info' },
    effect: { type: String as PropType<AlertEffect>, default: 'light' },
    closable: { type: Boolean, default: true },
    closeText: String,
    showIcon: Boolean,
    center: Boolean
  },
  emits: ['close'],
  setup(props, { slots, emit }) {
    const visible = ref(true);
    const onClose = () => {
      visible.value = false;
      emit('close');
    };
    return () => {
      if (!visible.value) return null;
      const hasTitle = props.title || slots.title;
      const hasDesc = props.description || slots.default;
      const hasIcon = props.showIcon || slots.icon;
      return (
        <div
          class={{
            'i-alert': true,
            [`i-alert--${props.type}`]: true,
            'is-dark': props.effect === 'dark',
            'is-center': props.center,
            'is-with-description': !!hasDesc
          }}
          role='alert'>
          {hasIcon && <span class='i-alert__icon'>{slots.icon?.() ?? icons[props.type]}</span>}
          <div class='i-alert__content'>
            {hasTitle && <span class='i-alert__title'>{slots.title?.() ?? props.title}</span>}
            {hasDesc && <p class='i-alert__description'>{slots.default?.() ?? props.description}</p>}
          </div>
          {props.closable && (
            <button type='button' class='i-alert__close' aria-label='关闭提示' onClick={onClose}>
              {props.closeText ?? '×'}
            </button>
          )}
        </div>
      );
    };
  }
});
