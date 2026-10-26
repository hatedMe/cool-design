import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";
import Input from "../index";
import Select from "../../select/index";
import SelectOption from "../../select-option/index";
import Checkbox from "../../checkbox/index";
import Switch from "../../switch/index";
import { h } from "vue";

test("输入框支持受控值、清空和禁用", async () => {
    const w = mount(Input, { props: { modelValue: "原值", clearable: true } });
    expect(w.find("input").element.value).toBe("原值");
    await w.find("input").setValue("新值");
    expect(w.emitted("update:modelValue")?.[0]).toEqual(["新值"]);
    await w.find("button").trigger("click");
    expect(w.emitted("update:modelValue")?.[1]).toEqual([""]);
    await w.setProps({ modelValue: "父级值", disabled: true });
    expect(w.find("input").element.value).toBe("父级值");
    expect(w.find("button").attributes("disabled")).toBeDefined();
});

test("选择器保留数字类型，清空得到 undefined", async () => {
    const w = mount(Select, {
        props: { modelValue: 1, clearable: true },
        slots: {
            default: () => [h(SelectOption, { value: 1, label: "启用" }), h(SelectOption, { value: 2, label: "停用" })]
        }
    });
    await w.find("select").setValue("2");
    expect(w.emitted("update:modelValue")?.[0]).toEqual([2]);
    await w.find("button").trigger("click");
    expect(w.emitted("update:modelValue")?.[1]).toEqual([undefined]);
});

test("复选框与开关发出布尔值，禁用不改变值", async () => {
    for (const component of [Checkbox, Switch]) {
        const w = mount(component, { props: { modelValue: false } });
        await w.find("input").setValue(true);
        expect(w.emitted("update:modelValue")?.[0]).toEqual([true]);
        await w.setProps({ disabled: true });
        await w.find("input").trigger("change");
        expect(w.emitted("update:modelValue")).toHaveLength(1);
    }
});
