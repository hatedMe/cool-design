import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, test } from "vitest";

import Button from "..";
import ButtonGroup from "../group";

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
    test("支持 Element Plus 风格的外观属性和图标", () => {
        const wrapper = mount(Button, {
            props: { type: "info", plain: true, text: true, link: true, round: true, circle: true, dashed: true, color: "#626aef", icon: "icon-add" },
            slots: { default: "新增" }
        });
        expect(wrapper.classes()).toEqual(expect.arrayContaining([
            "i-button--info",
            "is-plain",
            "is-text",
            "is-link",
            "is-round",
            "is-circle",
            "is-dashed"
        ]));
        expect(wrapper.find(".i-button__icon").classes()).toContain("icon-add");
        expect(wrapper.attributes("style")).toContain("--i-button-color");
    });
    test("支持 loading 插槽和自定义标签", () => {
        const wrapper = mount(Button, {
            props: { loading: true, tag: "a" },
            slots: { loading: () => "等待中", default: "保存" }
        });
        expect(wrapper.element.tagName).toBe("A");
        expect(wrapper.find(".i-button__loading").text()).toBe("等待中");
        expect(wrapper.attributes("aria-busy")).toBe("true");
    });
    test("按钮组统一尺寸和类型", () => {
        const wrapper = mount(ButtonGroup, {
            props: { type: "primary", size: "small" },
            slots: { default: () => ["前", "后"].map((text) => h(Button, null, () => text)) }
        });
        expect(wrapper.classes()).toContain("i-button-group");
        expect(wrapper.findAll(".i-button--primary")).toHaveLength(2);
        expect(wrapper.findAll(".i-button--small")).toHaveLength(2);
    });
});
