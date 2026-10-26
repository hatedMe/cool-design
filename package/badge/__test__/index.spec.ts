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
});
