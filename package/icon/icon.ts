import { defineComponent, h } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("icon");

export default defineComponent({
    name,
    props: {
        type: {
            type: String,
            default: "",
        },
    },
    setup(props) {
        const { type } = props;
        return () =>
            h("i", {
                class: [
                    "iconfont",
                    bem({
                        [type]: type,
                    }),
                ],
            });
    },
});
