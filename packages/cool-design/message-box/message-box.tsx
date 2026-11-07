import { defineComponent, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import Dialog from '../dialog';
import Button from '../button';
import type { MessageBoxOptions } from './types';
export default defineComponent({
  name: 'i-message-box',
  props: {
    modelValue: Boolean,
    title: { type: String, default: '操作确认' },
    message: { type: String, default: '' },
    type: { type: String as PropType<'success' | 'warning' | 'info' | 'error'>, default: 'warning' },
    confirmButtonText: { type: String, default: '确定' },
    cancelButtonText: { type: String, default: '取消' },
    beforeConfirm: Function as PropType<MessageBoxOptions['beforeConfirm']>
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  setup(props, { slots, emit }) {
    const pending = ref(false),
      error = ref('');
    let version = 0,
      finished = false,
      alive = true;
    watch(
      () => props.modelValue,
      () => {
        version++;
        pending.value = false;
        error.value = '';
        finished = false;
      }
    );
    onBeforeUnmount(() => {
      alive = false;
      version++;
    });
    const cancel = () => {
      if (pending.value || finished || !props.modelValue) return;
      finished = true;
      emit('cancel');
      emit('update:modelValue', false);
    };
    const confirm = async () => {
      if (pending.value || finished || !props.modelValue) return;
      pending.value = true;
      error.value = '';
      const current = ++version;
      try {
        const accepted = await props.beforeConfirm?.();
        if (!alive || current !== version || !props.modelValue || accepted === false) return;
        finished = true;
        emit('confirm');
        emit('update:modelValue', false);
      } catch (reason) {
        if (alive && current === version) error.value = reason instanceof Error ? reason.message : '操作失败，请重试';
      } finally {
        if (alive && current === version) pending.value = false;
      }
    };
    return () => (
      <Dialog
        modelValue={props.modelValue}
        title={props.title}
        closable={!pending.value}
        closeOnClickModal={false}
        closeOnPressEscape={!pending.value}
        onUpdate:modelValue={(open: boolean) => {
          if (!open) cancel();
        }}>
        {{
          default: () => (
            <div class={['i-message-box', `i-message-box--${props.type}`]}>
              <div class='i-message-box__message'>{slots.default?.() ?? props.message}</div>
              {error.value && (
                <p class='i-message-box__error' role='alert'>
                  {error.value}
                </p>
              )}
            </div>
          ),
          footer: () => (
            <>
              <Button disabled={pending.value} data-message-box-cancel onClick={cancel}>
                {props.cancelButtonText}
              </Button>
              <Button type='primary' loading={pending.value} data-message-box-confirm onClick={confirm}>
                {props.confirmButtonText}
              </Button>
            </>
          )
        }}
      </Dialog>
    );
  }
});
