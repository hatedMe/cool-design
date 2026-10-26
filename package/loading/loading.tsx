import { defineComponent } from "vue";
export default defineComponent({
    name: "i-loading",
    props: {
        loading: { type: Boolean, default: true },
        text: { type: String, default: "正在加载…" },
        overlay: Boolean
    },
    setup(props, { slots }) {
        const block = (event: Event) => {
            if (props.loading && props.overlay) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        return () => (
            <div class={["i-loading", { "i-loading--overlay": props.overlay }]} aria-busy={props.loading}>
                {slots.default && (
                    <div
                        class="i-loading__content"
                        inert={props.loading && props.overlay ? true : undefined}
                        {...{ onClickCapture: block, onKeydownCapture: block }}>
                        {slots.default()}
                    </div>
                )}
                {props.loading && (
                    <div class="i-loading__status" role="status" aria-live="polite">
                        <span class="i-loading__spinner" aria-hidden="true" />
                        <span>{props.text}</span>
                    </div>
                )}
            </div>
        );
    }
});
