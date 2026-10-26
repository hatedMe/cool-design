import { mount } from "@vue/test-utils";
import { h } from "vue";
import { expect, test, vi } from "vitest";
import Loading from "..";
test("遮罩期间隔离内容交互，结束恢复，支持状态文案", async () => {
    const action = vi.fn();
    const w = mount(Loading, {
        props: { loading: true, overlay: true, text: "加载用户" },
        slots: { default: () => h("button", { onClick: action }, "删除") }
    });
    expect(w.get('[role="status"]').text()).toContain("加载用户");
    expect(w.get(".i-loading__content").attributes("inert")).toBeDefined();
    await w.get("button").trigger("click");
    expect(action).not.toHaveBeenCalled();
    await w.setProps({ loading: false });
    expect(w.find('[role="status"]').exists()).toBe(false);
    expect(w.get(".i-loading__content").attributes("inert")).toBeUndefined();
    await w.get("button").trigger("click");
    expect(action).toHaveBeenCalledTimes(1);
    w.unmount();
});
