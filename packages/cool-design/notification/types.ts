export type NotificationType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'error';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export interface NotificationOptions {
  title?: string;
  message?: string;
  size?: 'large' | 'normal' | 'small';
  type?: NotificationType;
  duration?: number;
  position?: NotificationPosition;
  offset?: number;
  showClose?: boolean;
  dangerouslyUseHTMLString?: boolean;
  customClass?: string;
  onClick?: (event: MouseEvent) => void;
  onClose?: () => void;
}
export interface NotificationHandle {
  close(): void;
}
