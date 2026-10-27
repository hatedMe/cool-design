export type MessageBoxAction = "confirm" | "cancel";
export interface MessageBoxOptions {
  confirmButtonText?: string;
  cancelButtonText?: string;
  beforeConfirm?: () => void | boolean | Promise<void | boolean>;
}
