import { createVNode, type AppContext, type Ref, type VNode, render } from "vue";
import notification from "./notification";

function notify(opt = {}, _context: AppContext | null = null) {
    const props = { ...opt };
    const vm = createVNode(notification, props);

    const div = document.createElement("div");

    render(vm, document.body.appendChild(div));

    return {
        close() {}
    };
}

export default notify;
