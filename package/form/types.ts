export interface FormRule {
    required?: boolean;
    message?: string;
    trigger?: "blur" | "change";
    validator?: (value: unknown) => void | Promise<void>;
}
export interface FormInstance {
    validate(): Promise<boolean>;
    resetFields(): void;
    clearValidate(): void;
}
