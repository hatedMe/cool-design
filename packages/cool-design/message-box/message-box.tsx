import { defineComponent, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import Dialog from '../dialog';
import Button from '../button';
import type { ButtonType } from '../button/types';
import type {
  MessageBoxAction,
  MessageBoxBeforeClose,
  MessageBoxOptions,
  MessageBoxType
} from './types';
export default defineComponent({
  name: 'i-message-box',
  props: {
    modelValue: Boolean,
    title: { type: String, default: '操作确认' },
    message: { type: String, default: '' },
    type: { type: String as PropType<MessageBoxType>, default: 'warning' },
    dangerouslyUseHTMLString: Boolean,
    center: Boolean,
    showConfirmButton: { type: Boolean, default: true },
    showCancelButton: { type: Boolean, default: true },
    confirmButtonText: { type: String, default: '确定' },
    cancelButtonText: { type: String, default: '取消' },
    confirmButtonType: { type: String as PropType<ButtonType>, default: 'primary' },
    cancelButtonType: { type: String as PropType<ButtonType>, default: 'default' },
    beforeClose: Function as PropType<MessageBoxBeforeClose>,
    beforeConfirm: Function as PropType<MessageBoxOptions['beforeConfirm']>,
    showInput: Boolean,
    inputValue: { type: String, default: '' },
    inputPlaceholder: { type: String, default: '' },
    inputType: { type: String as PropType<'text' | 'textarea' | 'password'>, default: 'text' },
    inputPattern: RegExp as PropType<RegExp>,
    inputValidator: Function as PropType<(value: string) => boolean | string>,
    inputErrorMessage: { type: String, default: '输入不合法' }
  },
  emits: ['update:modelValue', 'update:inputValue', 'confirm', 'cancel', 'close'],
  setup(props, { slots, emit }) {
    const pending = ref(false),
      error = ref('');
    const input = ref(props.inputValue);
    let version = 0,
      finished = false,
      alive = true;
    watch(
      () => props.modelValue,
      (open) => {
        version++;
        pending.value = false;
        error.value = '';
        finished = false;
        if (open) input.value = props.inputValue;
      }
    );
    watch(
      () => props.inputValue,
      (val) => {
        input.value = val;
      }
    );
    onBeforeUnmount(() => {
      alive = false;
      version++;
    });
    const validate = (): string => {
      if (!props.showInput) return '';
      const val = input.value;
      if (props.inputPattern && !props.inputPattern.test(val)) return props.inputErrorMessage;
      if (props.inputValidator) {
        const result = props.inputValidator(val);
        if (result === false) return props.inputErrorMessage;
        if (typeof result === 'string') return result;
      }
      return '';
    };
    const finish = (action: MessageBoxAction) => {
      if (finished) return;
      finished = true;
      if (action === 'confirm') {
        if (props.showInput) emit('confirm', input.value);
        else emit('confirm');
      } else if (action === 'cancel') emit('cancel');
      else emit('close');
      emit('update:modelValue', false);
    };
    const handleAction = async (action: MessageBoxAction) => {
      if (pending.value || finished || !props.modelValue) return;
      if (action === 'confirm' && props.showInput) {
        const msg = validate();
        if (msg) {
          error.value = msg;
          return;
        }
        error.value = '';
      }
      if (props.beforeClose) {
        pending.value = true;
        error.value = '';
        const current = ++version;
        try {
          await new Promise<void>((resolve) => {
            props.beforeClose!(action, { inputValue: props.showInput ? input.value : undefined }, () => resolve());
          });
          if (!alive || current !== version || !props.modelValue) return;
          finish(action);
        } finally {
          if (alive && current === version) pending.value = false;
        }
        return;
      }
      if (action === 'confirm' && props.beforeConfirm) {
        pending.value = true;
        error.value = '';
        const current = ++version;
        try {
          const accepted = await (props.beforeConfirm as (v?: string) => unknown)(
            props.showInput ? input.value : undefined
          );
          if (!alive || current !== version || !props.modelValue || accepted === false) return;
          finish('confirm');
        } catch (reason) {
          if (alive && current === version)
            error.value = reason instanceof Error ? reason.message : '操作失败，请重试';
        } finally {
          if (alive && current === version) pending.value = false;
        }
        return;
      }
      finish(action);
    };
    const cancel = () => handleAction('cancel');
    const close = () => handleAction('close');
    const confirm = () => handleAction('confirm');
    const onInput = (e: Event) => {
      const val = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
      input.value = val;
      emit('update:inputValue', val);
      if (error.value) error.value = '';
    };
    return () => (
      <Dialog
        modelValue={props.modelValue}
        title={props.title}
        closable={!pending.value}
        closeOnClickModal={false}
        closeOnPressEscape={!pending.value}
        onUpdate:modelValue={(open: boolean) => {
          if (!open) close();
        }}>
        {{
          default: () => (
            <div class={['i-message-box', `i-message-box--${props.type}`, { 'is-center': props.center }]}>
              <div class='i-message-box__message'>
                {slots.default?.() ??
                  (props.dangerouslyUseHTMLString ? (
                    <span innerHTML={props.message} />
                  ) : (
                    props.message
                  ))}
              </div>
              {props.showInput &&
                (props.inputType === 'textarea' ? (
                  <textarea
                    class='i-message-box__input'
                    placeholder={props.inputPlaceholder}
                    disabled={pending.value}
                    value={input.value}
                    onInput={onInput}
                  />
                ) : (
                  <input
                    class='i-message-box__input'
                    type={props.inputType}
                    placeholder={props.inputPlaceholder}
                    disabled={pending.value}
                    value={input.value}
                    onInput={onInput}
                  />
                ))}
              {error.value && (
                <p class='i-message-box__error' role='alert'>
                  {error.value}
                </p>
              )}
            </div>
          ),
          ...(props.showConfirmButton || props.showCancelButton
            ? {
                footer: () =>
                  props.center ? (
                    <div style='display:flex;justify-content:center;gap:10px;width:100%'>
                      {props.showCancelButton && (
                        <Button
                          type={props.cancelButtonType}
                          disabled={pending.value}
                          data-message-box-cancel
                          onClick={cancel}>
                          {props.cancelButtonText}
                        </Button>
                      )}
                      {props.showConfirmButton && (
                        <Button
                          type={props.confirmButtonType}
                          loading={pending.value}
                          data-message-box-confirm
                          onClick={confirm}>
                          {props.confirmButtonText}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {props.showCancelButton && (
                        <Button
                          type={props.cancelButtonType}
                          disabled={pending.value}
                          data-message-box-cancel
                          onClick={cancel}>
                          {props.cancelButtonText}
                        </Button>
                      )}
                      {props.showConfirmButton && (
                        <Button
                          type={props.confirmButtonType}
                          loading={pending.value}
                          data-message-box-confirm
                          onClick={confirm}>
                          {props.confirmButtonText}
                        </Button>
                      )}
                    </>
                  )
              }
            : {})
        }}
      </Dialog>
    );
  }
});
