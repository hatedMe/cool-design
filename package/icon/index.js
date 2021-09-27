
import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace("icon");
import "./index.scss";
export default createComponent({
    props: {
        type: String,
    },
    render(h) {
        return (
            <i class={[ "iconfont",bem(),this.type]}></i>
        )
    },
});

