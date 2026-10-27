export type ButtonType = "default" | "primary" | "success" | "warning" | "danger" | "info";
export type ButtonSize = "small" | "default" | "normal" | "large";
export interface IButtonProps {
  type?: ButtonType;
  size?: ButtonSize;
  nativeType?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  plain?: boolean;
  text?: boolean;
  link?: boolean;
  round?: boolean;
  circle?: boolean;
  dashed?: boolean;
  icon?: string;
  color?: string;
  dark?: boolean;
  loadingIcon?: string;
  tag?: "button" | "a" | "div";
  autoInsertSpace?: boolean;
  onClick?: (event: MouseEvent) => void;
}
