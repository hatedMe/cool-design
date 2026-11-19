import { defineComponent, onBeforeUnmount, watch, type Component, type PropType, type VNode } from 'vue';
import Icon from '../icon';
export type MessageType = 'primary' | 'success' | 'warning' | 'info' | 'error';
export type MessageIcon = string | Component;
export default defineComponent({
  name: 'i-message',
  props: {
    type: { type: String as PropType<MessageType>, default: 'info' },
    message: { type: [String, Object] as PropType<string | VNode>, required: true },
    duration: { type: Number, default: 3000 },
    showClose: { type: Boolean, default: false },
    dangerouslyUseHTMLString: Boolean,
    center: Boolean,
    plain: Boolean,
    customClass: { type: String, default: '' },
    icon: [String, Object] as PropType<MessageIcon>,
    closeIcon: [String, Object] as PropType<MessageIcon>,
    repeatNum: { type: Number, default: undefined }
  },
  emits: ['close'],
  setup(props, { emit }) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let remaining = props.duration;
    let deadline = 0;
    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
    };
    const start = () => {
      clear();
      if (remaining > 0) {
        deadline = Date.now() + remaining;
        timer = setTimeout(() => emit('close'), remaining);
      }
    };
    // 悬停暂停倒计时，移开后按剩余时长继续。
    const pause = () => {
      if (!timer) return;
      remaining = Math.max(0, deadline - Date.now());
      clear();
    };
    watch(
      () => [props.message, props.duration],
      () => {
        clear();
        remaining = props.duration;
        start();
      },
      { immediate: true }
    );
    onBeforeUnmount(clear);
    return () => {
      const content =
        typeof props.message === 'string' ? (
          props.dangerouslyUseHTMLString ? <span innerHTML={props.message} /> : <span>{props.message}</span>
        ) : (
          props.message
        );
      return (
        <div
          class={['i-message', `i-message--${props.type}`, { 'is-center': props.center, 'is-plain': props.plain }, props.customClass]}
          role={props.type === 'error' ? 'alert' : 'status'}
          onMouseenter={pause}
          onMouseleave={start}>
          {props.icon && <Icon class='i-message__icon' icon={props.icon} aria-hidden='true' />}
          {content}
          {props.repeatNum !== undefined && props.repeatNum > 1 && (
            <span class='i-message__badge' aria-label={`重复 ${props.repeatNum} 次`}>
              {props.repeatNum}
            </span>
          )}
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
    };
  }
});
