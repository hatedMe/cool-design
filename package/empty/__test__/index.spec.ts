import { mount } from "@vue/test-utils";
import { h } from "vue";
import { expect, test } from "vitest";
import Empty from "..";
test("默认空态不请求外部图片，支持描述和恢复操作", () => {
    const w = mount(Empty, {
        props: { description: "没有查询结果" },
        slots: { default: () => h("button", "重置查询") }
    });
    expect(w.find("img").exists()).toBe(false);
    expect(w.text()).toContain("没有查询结果");
    expect(w.get("button").text()).toBe("重置查询");
    w.unmount();
});
