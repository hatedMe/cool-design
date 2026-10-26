import { Teleport, cloneVNode, computed, defineComponent, onBeforeUnmount, ref, type PropType } from "vue";
import { useFloating, type Placement } from "../../src/utils/use-floating";
let id = 0;
export default defineComponent({
    name: "i-tooltip",
    props: {
        content: { type: String, default: "" },
        placement: { type: String as PropType<Placement>, default: "top" },
        disabled: Boolean
    },
    setup(props, { slots }) {
        const reference = ref<HTMLElement>(),
            floating = ref<HTMLElement>();
        const hovered = ref(false),
            focused = ref(false),
            dismissed = ref(false);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const tooltipId = `i-tooltip-${++id}`;
        const open = computed(
            () =>
                !props.disabled &&
                !dismissed.value &&
                (hovered.value || focused.value) &&
                !!(props.content || slots.content)
        );
        const position = useFloating({
            open,
            reference,
            floating,
            placement: () => props.placement,
            close: () => {
                dismissed.value = true;
            }
        });
        const enter = () => {
            clearTimeout(timer);
            hovered.value = true;
            dismissed.value = false;
        };
        const leave = () => {
            clearTimeout(timer);
            timer = setTimeout(() => (hovered.value = false), 80);
        };
        onBeforeUnmount(() => clearTimeout(timer));
        return () => (
            <>
                <span
                    class="i-tooltip__trigger"
                    ref={reference}
                    onMouseenter={enter}
                    onMouseleave={leave}
                    onFocusin={() => {
                        focused.value = true;
                        dismissed.value = false;
                    }}
                    onFocusout={(event: FocusEvent) => {
                        if (!reference.value?.contains(event.relatedTarget as Node)) focused.value = false;
                    }}>
                    {slots.default?.().map((vnode) =>
                        cloneVNode(vnode, {
                            "aria-describedby": open.value
                                ? [vnode.props?.["aria-describedby"], tooltipId].filter(Boolean).join(" ")
                                : vnode.props?.["aria-describedby"]
                        })
                    )}
                </span>
                {open.value && (
                    <Teleport to={position.target.value}>
                        <div
                            id={tooltipId}
                            ref={floating}
                            class="i-tooltip"
                            role="tooltip"
                            style={position.style.value}
                            data-placement={position.placement.value}
                            onMouseenter={enter}
                            onMouseleave={leave}>
                            {slots.content?.() ?? props.content}
                        </div>
                    </Teleport>
                )}
            </>
        );
    }
});
