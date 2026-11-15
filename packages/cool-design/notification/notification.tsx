import { defineComponent, onBeforeUnmount, onMounted, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import type { NotificationType } from './types';
const [name, bem] = createNamespace('notification');

export default defineComponent({
  name,
  props: {
    title: String,
    message: String,
    size: { type: String as PropType<'large' | 'normal' | 'small'>, default: 'normal' },
    type: { type: String as PropType<NotificationType>, default: 'warning' },
    duration: { type: Number, default: 4500 },
    showClose: { type: Boolean, default: true },
    dangerouslyUseHTMLString: Boolean,
    customClass: { type: String, default: '' }
  },
  emits: ['click', 'close'],
  setup(props, { emit, slots }) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let startAt = 0;
    let remaining = props.duration;
    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
    };
    const start = (ms: number) => {
      clear();
      if (ms <= 0) return;
      remaining = ms;
      startAt = Date.now();
      timer = setTimeout(() => emit('close'), ms);
    };
    const pause = () => {
      if (!timer) return;
      clear();
      remaining = Math.max(0, remaining - (Date.now() - startAt));
    };
    const resume = () => {
      if (props.duration <= 0 || timer) return;
      start(remaining);
    };
    onMounted(() => start(props.duration));
    onBeforeUnmount(clear);
    const normalizedType = () => (props.type === 'error' ? 'danger' : props.type);
    return () => (
      <section
        class={[bem(), bem({ [normalizedType()]: true, [props.size]: true }), props.customClass]}
        role='status'
        onClick={(event: MouseEvent) => emit('click', event)}
        onMouseenter={pause}
        onMouseleave={resume}>
        <div class={bem('content')}>
          {props.title && <h3 class={bem('title')}>{props.title}</h3>}
          <div class={bem('message')}>
            {slots.default?.() ??
              (props.dangerouslyUseHTMLString ? (
                <span innerHTML={props.message ?? ''} />
              ) : (
                props.message
              ))}
          </div>
        </div>
        {props.showClose && (
          <button
            type='button'
            aria-label='关闭通知'
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              emit('close');
            }}>
            ×
          </button>
        )}
      </section>
    );
  }
});
