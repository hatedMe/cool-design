import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";
import Icon from "../index";

test("使用字体实际定义的类名，更新 type 后替换图标", async () => {
    const wrapper = mount(Icon, { props: { type: "icon-close" } });
    expect(wrapper.classes()).toContain("iconfont");
    expect(wrapper.classes()).toContain("icon-close");
    await wrapper.setProps({ type: "icon-search" });
    expect(wrapper.classes()).toContain("icon-search");
    expect(wrapper.classes()).not.toContain("icon-close");
});
