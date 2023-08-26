

export type ButtonType = 'primary'| 'success'| 'warning'| 'danger'| 'info';
export type ButtonSize = 'large'| 'medium'| 'small'| 'mini';

export interface IButtonProps {
    type?: ButtonType;
    size?: ButtonSize;
    icon?: string;
    nativeType?: string;
    loading?: boolean;
    disabled?: boolean;
    /**
     * @description: 是否为朴素按钮
     */
    plain?: boolean;
    autofocus?: boolean;
    round?: boolean;
    circle?: boolean;
    onClick?: (event: MouseEvent) => void;
}