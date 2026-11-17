import type { ButtonType } from '../button/types';

export type MessageBoxAction = 'confirm' | 'cancel' | 'close';
export type MessageBoxType = 'success' | 'warning' | 'info' | 'error';
export interface MessageBoxInstance {
  inputValue?: string;
}
export type MessageBoxBeforeClose = (
  action: MessageBoxAction,
  instance: MessageBoxInstance,
  done: () => void
) => void;
export interface MessageBoxOptions {
  title?: string;
  message?: string;
  type?: MessageBoxType;
  dangerouslyUseHTMLString?: boolean;
  center?: boolean;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonType?: ButtonType;
  cancelButtonType?: ButtonType;
  beforeClose?: MessageBoxBeforeClose;
  beforeConfirm?: (value?: string) => void | boolean | Promise<void | boolean>;
  showInput?: boolean;
  inputValue?: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'textarea' | 'password';
  inputPattern?: RegExp;
  inputValidator?: (value: string) => boolean | string;
  inputErrorMessage?: string;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  distinguishCancelAndClose?: boolean;
  roundButton?: boolean;
  lockScroll?: boolean;
  container?: string | HTMLElement;
  customClass?: string;
}
export interface MessageBoxPromptResult {
  value: string;
  action: 'confirm';
}
