import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, onBeforeUnmount, watch, type Component, type PropType, type VNode } from 'vue';
import { useConfig } from '../config-provider/context';
import Icon from '../icon';
export type MessageType = 'primary' | 'success' | 'warning' | 'info' | 'error';
export type MessageIcon = string | Component;
export default defineComponent({
  name: 'i-message',
  props: {
    type: { type: String as PropType<MessageType>, default: 'info' },
    message: { type: [String, Object] as PropType<string | VNode>, required: true },
    duration: { type: Number, default: undefined },
    showClose: { type: Boolean, default: undefined },
    dangerouslyUseHTMLString: Boolean,
    center: Boolean,
    plain: { type: Boolean, default: undefined },
    customClass: { type: String, default: '' },
    icon: [String, Object] as PropType<MessageIcon>,
    closeIcon: [String, Object] as PropType<MessageIcon>,
    repeatNum: { type: Number, default: undefined }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const ns = useNamespace('message');
    const config = useConfig();
    const duration = () => props.duration ?? config.value.message?.duration ?? 3000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let remaining = duration();
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
      () => [props.message, duration()],
      () => {
        clear();
        remaining = duration();
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
          class={[ns.b(), ns.m(props.type), { 'is-center': props.center, 'is-plain': props.plain ?? config.value.message?.plain }, props.customClass]}
          role={props.type === 'error' ? 'alert' : 'status'}
          onMouseenter={pause}
          onMouseleave={start}>
          {props.icon && <Icon class={ns.e('icon')} icon={props.icon} aria-hidden='true' />}
          {content}
          {props.repeatNum !== undefined && props.repeatNum > 1 && (
            <span class={ns.e('badge')} aria-label={`重复 ${props.repeatNum} 次`}>
              {props.repeatNum}
            </span>
          )}
          {(props.showClose ?? config.value.message?.showClose) &&
          (props.closeIcon ? (
            <button
              type='button'
              class={ns.e('close')}
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
