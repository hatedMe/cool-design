import { defineComponent, inject, nextTick, onBeforeUnmount, provide, ref, watch } from "vue";
import { formKey, fieldKey, nextFieldId } from "../form/context";
export default defineComponent({
    name: "i-form-item",
    props: { prop: { type: String, required: true }, label: String },
    setup(props, { slots }) {
        const form = inject(formKey);
        const id = nextFieldId();
        const errorId = `${id}-error`;
        const error = ref("");
        const root = ref<HTMLElement>();
        let revision = 0;
        watch(
            () => form?.model()[props.prop!],
            () => {
                revision++;
            },
            { flush: "sync", deep: true }
        );
        const initial = form?.model()[props.prop!];
        const clear = () => {
            revision++;
            error.value = "";
        };
        const validate = async (trigger?: "blur" | "change") => {
            const value = form?.model()[props.prop!];
            const rules = (form?.rules()[props.prop!] || []).filter(
                (rule) => !trigger || !rule.trigger || rule.trigger === trigger
            );
            if (trigger && !rules.length) return !error.value;
            const current = ++revision;
            try {
                for (const rule of rules) {
                    if (
                        rule.required &&
                        (value == null ||
                            (typeof value === "string" && !value.trim()) ||
                            (Array.isArray(value) && !value.length))
                    )
                        throw new Error(rule.message || "请填写此项");
                    await rule.validator?.(value);
                }
                if (current !== revision) return false;
                error.value = "";
                return true;
            } catch (reason) {
                if (current !== revision) return false;
                error.value = reason instanceof Error ? reason.message : "校验失败";
                return false;
            }
        };
        provide(fieldKey, {
            id,
            errorId,
            invalid: () => !!error.value,
            validate: (trigger) => {
                nextTick(() => validate(trigger));
            }
        });
        const key = props.prop!;
        form?.register(key, {
            validate,
            clear,
            reset: () => {
                if (form) form.model()[key] = initial;
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
                    <label class="i-form-item__label" for={id}>
                        {props.label}
                    </label>
                )}
                <div class="i-form-item__content">
                    {slots.default?.()}
                    {error.value && (
                        <div class="i-form-item__error" id={errorId} role="alert">
                            {error.value}
                        </div>
                    )}
                </div>
            </div>
        );
    }
});
