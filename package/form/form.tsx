import { defineComponent, nextTick, provide, watch, type PropType } from "vue";
import type { Size } from "../config-provider/context";
import { formKey, type Field } from "./context";
import type { FormRule } from "./types";
export default defineComponent({
    name: "i-form",
    props: {
        model: { type: Object as PropType<Record<string, unknown>>, required: true },
        rules: { type: Object as PropType<Record<string, FormRule[]>>, default: () => ({}) }
        ,inline: Boolean,
        labelPosition: { type: String as PropType<"left" | "right" | "top">, default: "right" },
        labelWidth: [String, Number],
        labelSuffix: String,
        disabled: Boolean,
        size: String as PropType<Size>,
        showMessage: { type: Boolean, default: true }
    },
    emits: ["submit"],
    setup(props, { slots, expose, emit }) {
        let modelVersion = 0;
        watch(
            () => props.model,
            () => {
                modelVersion++;
            },
            { flush: "sync", deep: true }
        );
        const fields = new Map<string, Field>();
        provide(formKey, {
            model: () => props.model!,
            rules: () => props.rules,
            register: (key, field) => fields.set(key, field),
            unregister: (key) => fields.delete(key)
            ,disabled: () => props.disabled,
            size: () => props.size
        });
        expose({
            async validate() {
                const version = modelVersion;
                const registered = [...fields.values()];
                const results = await Promise.all(registered.map((field) => field.validate()));
                const invalid = results.indexOf(false);
                if (invalid >= 0) {
                    await nextTick();
                    registered[invalid].focus();
                }
                return invalid < 0 && version === modelVersion;
            },
            async validateField(props?: string | string[]) {
                const keys = props ? (Array.isArray(props) ? props : [props]) : [...fields.keys()];
                const results = await Promise.all(keys.map((key) => fields.get(key)?.validate()));
                return results.every((result) => result !== false);
            },
            resetFields() {
                fields.forEach((field) => field.reset());
            },
            clearValidate() {
                fields.forEach((field) => field.clear());
            }
        });
        return () => (
            <form
                class={["i-form", props.inline && "is-inline", `i-form--label-${props.labelPosition}`]}
                style={{ "--i-form-label-width": typeof props.labelWidth === "number" ? `${props.labelWidth}px` : props.labelWidth }}
                novalidate
                onSubmit={(event: Event) => {
                    event.preventDefault();
                    emit("submit", event);
                }}>
                {slots.default?.()}
            </form>
        );
    }
});
