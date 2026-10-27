import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Badge from "..";

describe("test `Badge` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Badge);
        expect(wrapper.exists()).toBeTruthy();
    });
    test("数量、最大值、颜色和圆点状态随属性更新", async () => {
        const wrapper = mount(Badge, { props: { value: 120, max: 99 }, slots: { default: "消息" } });
        expect(wrapper.get(".i-badge__tag").text()).toBe("99+");
        expect(wrapper.text()).toContain("消息");
        await wrapper.setProps({ value: 5, type: "danger" });
        expect(wrapper.get(".i-badge__tag").text()).toBe("5");
        expect(wrapper.get(".i-badge__tag").classes()).toContain("i-badge__tag--danger");
        await wrapper.setProps({ isDot: true });
        expect(wrapper.get(".i-badge__dot").text()).toBe("");
        await wrapper.setProps({ isDot: false, value: "" });
        expect(wrapper.find(".i-badge__tag").exists()).toBe(false);
    });
    test("支持隐藏、零值显示、偏移和自定义颜色", async () => {
        const wrapper = mount(Badge, { props: { value: 0, showZero: false, offset: [4, 6], color: "#626aef" } });
        expect(wrapper.find(".i-badge__tag").exists()).toBe(false);
        await wrapper.setProps({ showZero: true });
        expect(wrapper.get(".i-badge__tag").text()).toBe("0");
        expect((wrapper.get(".i-badge__tag").element as HTMLElement).style.background).toBe("rgb(98, 106, 239)");
        expect(wrapper.get(".i-badge__tag").attributes("data-offset")).toBe("4,6");
        await wrapper.setProps({ hidden: true });
        expect(wrapper.find(".i-badge__tag").exists()).toBe(false);
    });
});
