import { mount } from "@vue/test-utils";
import { h } from "vue";
import { expect, test } from "vitest";
import ConfigProvider from "../index";
import Button from "../../button";

test("嵌套配置继承尺寸、主题和变量，支持动态更新", async () => {
  const wrapper = mount(ConfigProvider, {
    props: { size: "small", theme: "dark", themeVars: { "--i-primary": "#123456" } },
    slots: { default: () => h(ConfigProvider, null, { default: () => h(Button, null, () => "保存") }) }
  });
  expect(wrapper.find("button").classes()).toContain("i-button--small");
  const nested = wrapper.findAll(".i-config-provider")[1];
  expect(nested.attributes("data-theme")).toBe("dark");
  expect(nested.attributes("style")).toContain("--i-primary: #123456");
  await wrapper.setProps({ size: "large" });
  expect(wrapper.find("button").classes()).toContain("i-button--large");
});
