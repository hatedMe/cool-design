import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Radio from "..";

describe("test `Radio` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Radio);
        expect(wrapper.exists()).toBeTruthy();
    });
    test("使用受控值并响应动态禁用，不直接改变父级模型", async () => {
        const wrapper = mount(Radio, {
            props: { value: "enabled", modelValue: "disabled" },
            slots: { default: "启用" }
        });
        expect(wrapper.get("input").element.checked).toBe(false);
        await wrapper.get("input").setValue(true);
        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["enabled"]);
        expect(wrapper.emitted("change")?.[0]).toEqual(["enabled"]);
        await wrapper.setProps({ modelValue: "enabled", disabled: true });
        expect(wrapper.get("input").element.checked).toBe(true);
        expect(wrapper.get("input").attributes("disabled")).toBeDefined();
        await wrapper.get("input").trigger("change");
        expect(wrapper.emitted("change")).toHaveLength(1);
    });
});
