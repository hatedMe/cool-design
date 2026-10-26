import { mount } from "@vue/test-utils";
import { h } from "vue";
import { expect, test } from "vitest";
import Tag from "..";
test("保留复杂插槽，关闭仅发事件且不冒泡点击或自行移除", async () => {
    const w = mount(Tag, { props: { closable: true, type: "success" }, slots: { default: () => h("strong", "启用") } });
    expect(w.get("strong").text()).toBe("启用");
    await w.get("button").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
    expect(w.emitted("click")).toBeUndefined();
    expect(w.exists()).toBe(true);
    await w.setProps({ disabled: true });
    await w.get("button").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
    w.unmount();
});
