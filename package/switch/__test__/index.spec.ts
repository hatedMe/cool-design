import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";
import Switch from "../index";

test("Switch 支持自定义值、文字和尺寸", async () => {
  const wrapper = mount(Switch, {
    props: { modelValue: "on", activeValue: "on", inactiveValue: "off", activeText: "开启", size: "large" }
  });
  expect(wrapper.text()).toContain("开启");
  expect(wrapper.classes()).toContain("i-switch--large");
  await wrapper.find("input").setValue(false);
  expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["off"]);
});

test("beforeChange 拒绝时不修改模型", async () => {
  const wrapper = mount(Switch, { props: { modelValue: false, beforeChange: () => false } });
  await wrapper.find("input").setValue(true);
  expect(wrapper.emitted("update:modelValue")?.length ?? 0).toBe(0);
});
