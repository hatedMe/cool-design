import { defineComponent, inject, nextTick, onBeforeUnmount, provide, ref, watch } from "vue";
import Schema from "async-validator";
import { formKey, fieldKey, nextFieldId } from "../form/context";
export default defineComponent({
    name: "i-form-item",
    props: { prop: { type: String, required: true }, label: String, required: Boolean, labelPosition: String, labelWidth: [String, Number], showMessage: { type: Boolean, default: true } },
    setup(props, { slots }) {
        const form = inject(formKey);
        const id = nextFieldId();
        const errorId = `${id}-error`;
        const error = ref("");
        const root = ref<HTMLElement>();
        let revision = 0;
        const pathParts = (path: string) => path.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean);
        const getValue = () => pathParts(props.prop!).reduce<unknown>((value, part) => (value as Record<string, unknown> | undefined)?.[part], form?.model());
        const setValue = (value: unknown) => {
            const parts = pathParts(props.prop!);
            const last = parts.pop();
            if (!last || !form) return;
            let target = form.model() as Record<string, unknown>;
            parts.forEach((part) => {
                if (!target[part] || typeof target[part] !== "object") target[part] = {};
                target = target[part] as Record<string, unknown>;
            });
            target[last] = value;
        };
        watch(
            getValue,
            () => {
                revision++;
            },
            { flush: "sync", deep: true }
        );
        const initialValue = getValue();
        const initial = initialValue && typeof initialValue === "object" ? JSON.parse(JSON.stringify(initialValue)) : initialValue;
        const clear = () => {
            revision++;
            error.value = "";
        };
        const validate = async (trigger?: "blur" | "change") => {
            const value = getValue();
            const rules = (form?.rules()[props.prop!] || []).filter(
                (rule) => !trigger || !rule.trigger || rule.trigger === trigger
            );
            if (trigger && !rules.length) return !error.value;
            const current = ++revision;
            try {
                const descriptor = {
                    value: rules.map((rule) => ({
                        ...rule,
                        whitespace: rule.whitespace ?? (rule.required ? true : undefined),
                        validator: rule.validator
                            ? (_rule: unknown, ruleValue: unknown, callback: (error?: string | Error) => void) =>
                                  Promise.resolve(rule.validator?.(ruleValue)).then(() => callback()).catch((reason) => callback(reason instanceof Error ? reason : "校验失败"))
                            : undefined
                    }))
                };
                await new Schema(descriptor as any).validate({ value }, { suppressWarning: true });
                if (current !== revision) return false;
                error.value = "";
                return true;
            } catch (reason) {
                if (current !== revision) return false;
                const first = (reason as { errors?: Array<{ message?: string }> })?.errors?.[0];
                error.value = first?.message || (reason instanceof Error ? reason.message : "校验失败");
                return false;
            }
        };
        provide(fieldKey, {
            id,
            errorId,
            invalid: () => !!error.value,
            disabled: () => !!form?.disabled?.(),
            size: () => form?.size?.(),
            validate: (trigger) => {
                nextTick(() => validate(trigger));
            }
        });
        const key = props.prop!;
        form?.register(key, {
            validate,
            clear,
            reset: () => {
                setValue(initial);
                clear();
            },
            focus: () =>
                root.value
                    ?.querySelector<HTMLElement>(
                        "input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)"
                    )
                    ?.focus()
        });
        onBeforeUnmount(() => {
            clear();
            form?.unregister(key);
        });
        return () => (
            <div ref={root} class={["i-form-item", { "i-form-item--error": !!error.value }]}>
                {props.label && (
                    <label class="i-form-item__label" for={id} style={{ width: typeof props.labelWidth === "number" ? `${props.labelWidth}px` : props.labelWidth }}>
                        {props.required && <span aria-hidden="true" class="i-form-item__required">*</span>}{props.label}
                    </label>
                )}
                <div class="i-form-item__content">
                    {slots.default?.()}
                    {error.value && props.showMessage && (
                        <div class="i-form-item__error" id={errorId} role="alert">
                            {slots.error?.({ error: error.value }) ?? error.value}
                        </div>
                    )}
                </div>
            </div>
        );
    }
});
