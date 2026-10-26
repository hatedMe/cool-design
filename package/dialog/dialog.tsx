import { Teleport, defineComponent, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { overlayKey } from "../config-provider/context";
import { isTopDialog, lockDialog, unlockDialog } from "./stack";
let dialogId = 0;
export default defineComponent({
    name: "i-dialog",
    props: {
        modelValue: Boolean,
        title: { type: String, default: "对话框" },
        closeOnClickModal: { type: Boolean, default: true },
        closeOnPressEscape: { type: Boolean, default: true },
        closable: { type: Boolean, default: true }
    },
    emits: ["update:modelValue"],
    setup(props, { slots, emit }) {
        const host = inject(overlayKey, undefined);
        const root = ref<HTMLElement>();
        const titleId = `i-dialog-title-${++dialogId}`;
        const token = Symbol("dialog");
        let active = false;
        let previous: HTMLElement | null = null;
        const focusable = () =>
            Array.from(
                root.value?.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
                ) || []
            );
        const focusFirst = () => (focusable()[0] || root.value)?.focus();
        const close = () => {
            if (props.closable) emit("update:modelValue", false);
        };
        const cleanup = () => {
            if (!active) return;
            const wasTop = isTopDialog(token);
            active = false;
            unlockDialog(token);
            document.removeEventListener("keydown", onKeydown);
            document.removeEventListener("focusin", onFocus);
            if (wasTop && previous?.isConnected) previous.focus();
        };
        const onFocus = (event: FocusEvent) => {
            if (active && isTopDialog(token) && root.value && !root.value.contains(event.target as Node)) focusFirst();
        };
        const onKeydown = (event: KeyboardEvent) => {
            if (!active || !isTopDialog(token)) return;
            if (event.key === "Escape" && props.closeOnPressEscape && props.closable) {
                event.preventDefault();
                close();
            }
            if (event.key !== "Tab") return;
            const items = focusable();
            const first = items[0];
            const last = items[items.length - 1];
            if (!items.length) {
                event.preventDefault();
                root.value?.focus();
            } else if (event.shiftKey && (document.activeElement === first || document.activeElement === root.value)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root.value)) {
                event.preventDefault();
                first.focus();
            }
        };
        onMounted(() => {
            watch(
                () => props.modelValue,
                async (open) => {
                    if (!open) {
                        cleanup();
                        return;
                    }
                    if (active) return;
                    previous = document.activeElement as HTMLElement;
                    active = true;
                    lockDialog(token);
                    document.addEventListener("keydown", onKeydown);
                    document.addEventListener("focusin", onFocus);
                    await nextTick();
                    if (active) focusFirst();
                },
                { immediate: true }
            );
        });
        onBeforeUnmount(cleanup);
        const content = () => (
            <div
                class="i-dialog__mask"
                onClick={(event: MouseEvent) => {
                    if (event.target === event.currentTarget && props.closeOnClickModal) close();
                }}>
                <section
                    ref={root}
                    class="i-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    tabindex={-1}>
                    <header class="i-dialog__header">
                        <h2 id={titleId}>{props.title}</h2>
                        <button type="button" aria-label="关闭对话框" disabled={!props.closable} onClick={close}>
                            ×
                        </button>
                    </header>
                    <div class="i-dialog__body">{slots.default?.()}</div>
                    {slots.footer && <footer class="i-dialog__footer">{slots.footer()}</footer>}
                </section>
            </div>
        );
        return () =>
            !props.modelValue ? null : host?.value ? <Teleport to={host.value}>{content()}</Teleport> : content();
    }
});
