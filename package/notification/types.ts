export type NotificationType = "primary" | "success" | "warning" | "danger" | "info";
export interface NotificationOptions {
  title?: string;
  message?: string;
  size?: "large" | "normal" | "small";
  type?: NotificationType;
  onClick?: (event: MouseEvent) => void;
  onClose?: () => void;
}
