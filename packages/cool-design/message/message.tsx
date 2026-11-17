import { defineComponent, onBeforeUnmount, watch, type Component, type PropType } from 'vue';
import Icon from '../icon';
export type MessageType = 'primary' | 'success' | 'warning' | 'info' | 'error';
export type MessageIcon = string | Component;
export default defineComponent({
  name: 'i-message',
  props: {
    type: { type: String as PropType<MessageType>, default: 'info' },
    message: { type: String, required: true },
    duration: { type: Number, default: 3000 },
    showClose: { type: Boolean, default: false },
    dangerouslyUseHTMLString: Boolean,
    center: Boolean,
    customClass: { type: String, default: '' },
    icon: [String, Object] as PropType<MessageIcon>,
    closeIcon: [String, Object] as PropType<MessageIcon>
  },
  emits: ['close'],
  setup(props, { emit }) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => {
      if (timer) clearTimeout(timer);
    };
    watch(
      () => [props.message, props.duration],
      () => {
        clear();
        if (props.duration > 0) timer = setTimeout(() => emit('close'), props.duration);
      },
      { immediate: true }
    );
    onBeforeUnmount(clear);
    return () => (
      <div
        class={['i-message', `i-message--${props.type}`, { 'is-center': props.center }, props.customClass]}
        role={props.type === 'error' ? 'alert' : 'status'}>
        {props.icon && <Icon class='i-message__icon' icon={props.icon} aria-hidden='true' />}
        {props.dangerouslyUseHTMLString ? <span innerHTML={props.message} /> : <span>{props.message}</span>}
        {props.showClose &&
          (props.closeIcon ? (
            <button
              type='button'
              class='i-message__close'
              aria-label='关闭提示'
              onClick={() => {
                clear();
                emit('close');
              }}>
              <Icon icon={props.closeIcon} aria-hidden='true' />
            </button>
          ) : (
            <button
              type='button'
              aria-label='关闭提示'
              onClick={() => {
                clear();
                emit('close');
              }}>
              ×
            </button>
          ))}
      </div>
    );
  }
});
