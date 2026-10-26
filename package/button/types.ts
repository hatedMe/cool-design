export type ButtonType = "default" | "primary" | "success" | "warning" | "danger";
export type ButtonSize = "small" | "default" | "normal" | "large";
export interface IButtonProps {
    type?: ButtonType;
    size?: ButtonSize;
    nativeType?: "button" | "submit" | "reset";
    loading?: boolean;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
}
