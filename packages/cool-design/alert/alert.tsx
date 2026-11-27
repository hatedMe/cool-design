import { defineComponent, ref, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
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
    const ns = useNamespace('alert');
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
            [ns.b()]: true,
            [ns.m(props.type)]: true,
            'is-dark': props.effect === 'dark',
            'is-center': props.center,
            'is-with-description': !!hasDesc
          }}
          role='alert'>
          {hasIcon && <span class={ns.e('icon')}>{slots.icon?.() ?? icons[props.type]}</span>}
          <div class={ns.e('content')}>
            {hasTitle && <span class={ns.e('title')}>{slots.title?.() ?? props.title}</span>}
            {hasDesc && <p class={ns.e('description')}>{slots.default?.() ?? props.description}</p>}
          </div>
          {props.closable && (
            <button type='button' class={ns.e('close')} aria-label='关闭提示' onClick={onClose}>
              {props.closeText ?? '×'}
            </button>
          )}
        </div>
      );
    };
  }
});
