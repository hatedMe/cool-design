import { h } from "vue";
import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";
import Checkbox from "../index";
import CheckboxGroup from "../group";

test("CheckboxGroup 使用数组模型并限制禁用项", async () => {
    const wrapper = mount(CheckboxGroup, {
        props: { modelValue: ["a"], min: 1, max: 2 },
        slots: { default: () => [h(Checkbox, { value: "a" }), h(Checkbox, { value: "b" })] }
    });
    expect(wrapper.findAll("input")[0].element.checked).toBe(true);
    await wrapper.findAll("input")[0].setValue(false);
    expect(wrapper.emitted("update:modelValue")?.length ?? 0).toBe(0);
    await wrapper.findAll("input")[1].setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a", "b"]]);
});
