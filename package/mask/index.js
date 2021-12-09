import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('mask');
import "./index.scss";

export default createComponent({
    props: {
        click: Function
    },
    methods: {
        clickMsakHandle() {
            this.$emit('click')
        }
    },
    render(h) {
        return (
            <div class={bem()} onClick={() => this.clickMsakHandle()}>
            </div>
        )
    },
});
