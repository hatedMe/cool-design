import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Button from "..";

describe("test `Button` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Button);
        expect(wrapper.exists()).toBeTruthy();
    });
    test("渲染原生按钮和插槽，禁用及加载时不触发点击", async () => {
        const wrapper = mount(Button, { slots: { default: "保存" } });
        expect(wrapper.element.tagName).toBe("BUTTON");
        expect(wrapper.text()).toBe("保存");
        expect(wrapper.attributes("type")).toBe("button");
        await wrapper.trigger("click");
        expect(wrapper.emitted("click")).toHaveLength(1);
        await wrapper.setProps({ disabled: true });
        await wrapper.trigger("click");
        expect(wrapper.emitted("click")).toHaveLength(1);
        await wrapper.setProps({ disabled: false, loading: true });
        await wrapper.trigger("click");
        expect(wrapper.emitted("click")).toHaveLength(1);
    });
    test("动态修改尺寸同步更新", async () => {
        const wrapper = mount(Button, { props: { size: "small" } });
        expect(wrapper.classes()).toContain("i-button--small");
        await wrapper.setProps({ size: "large" });
        expect(wrapper.classes()).toContain("i-button--large");
    });
});
