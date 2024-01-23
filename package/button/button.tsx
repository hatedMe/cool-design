import { defineComponent } from "vue";
import type { PropType } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("button");

export type ButtonType =
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger";

const props = {
    size: String as PropType<"large" | "normal" | "small">,
    type: {
        type: String as PropType<ButtonType>,
        default: "warning",
    },
};

export default defineComponent({
    name,
    props,
    setup(props, { emit, slots }) {
        const { size } = props;

        const classes = [bem(), bem(size)];
        //  <button class={classes}>555</button>
        // const renderLoading = () => {
        // 	return (
        // 		<div class={bem('loading')}>
        // 			{ ctx.slots.loading && <solt name="loading" /> }
        // 		</div>
        // 	)
        // };

        const onClick = (event: MouseEvent) => {
            emit("click", event);
        };

        return (
            <div class={bem} onClick={onClick}>
                {/* { props.loading && <Loading type="spinner" size="20" /> }
					{ slots.default?.() } */}
            </div>
        );
    },
});
